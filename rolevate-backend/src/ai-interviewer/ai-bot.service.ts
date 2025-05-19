import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LivekitService } from '../livekit/livekit.service';
import { InterviewService } from './interview.service';
import { InterviewState } from './interfaces/ai-interviewer.interfaces';
import * as WebSocket from 'ws';
import { LiveKitDebug } from '../utils/livekit-debug.util';

@Injectable()
export class AiBotService implements OnModuleInit {
  private readonly logger = new Logger(AiBotService.name);
  private readonly livekitUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly botConnections = new Map<string, WebSocket>(); // Map room name to WebSocket connection

  constructor(
    private readonly configService: ConfigService,
    private readonly livekitService: LivekitService,
    private readonly interviewService: InterviewService,
  ) {
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';

    if (!this.livekitUrl || !this.apiKey || !this.apiSecret) {
      this.logger.error('LiveKit configuration is missing. Please check your .env file.');
    }
  }

  onModuleInit() {
    this.logger.log('AI Bot Service initialized');
  }

  /**
   * Create and connect an AI Bot to a LiveKit room
   * @param roomName The name of the room to join
   * @param interviewId The ID of the associated interview session
   * @returns Promise resolving to true if successful
   */
  async createAiBot(roomName: string, interviewId: string): Promise<boolean> {
    try {
      // Generate a token for the AI bot
      const botIdentity = `ai-interviewer-${roomName}`;
      const token = await this.livekitService.generateToken({
        identity: botIdentity,
        name: roomName, // This should be the room name
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        metadata: JSON.stringify({ type: 'ai-bot', interviewId }),
      });

      // LiveKit WebSocket URL needs the complete URL structure
      // The URL format should be: wss://host.livekit.cloud
      // Do not append /rtc or other path components as they're not needed
      const wsUrl = `${this.livekitUrl}?access_token=${token}`;
      
      this.logger.debug(`Connecting AI Bot to WebSocket URL: ${this.livekitUrl}`);
      LiveKitDebug.log(`Connecting to LiveKit WebSocket`, { 
        url: this.livekitUrl, 
        identity: botIdentity, 
        room: roomName,
        tokenLength: token.length
      });
      
      const ws = new WebSocket(wsUrl);

      // Set up event handlers
      ws.on('open', () => {
        this.logger.log(`AI Bot connected to room ${roomName}`);
        LiveKitDebug.log(`WebSocket connection opened`, { room: roomName, readyState: LiveKitDebug.getWebSocketState(ws.readyState) });
        
        // Store the connection
        this.botConnections.set(roomName, ws);
        
        // LiveKit WebSocket doesn't need a join message - the token already contains room info
        this.logger.log(`AI Bot successfully joined room ${roomName}`);
      });

      ws.on('message', (data) => {
        LiveKitDebug.log(`Received WebSocket message`, { room: roomName, dataLength: data.toString().length });
        this.handleBotMessage(roomName, interviewId, data.toString());
      });

      ws.on('close', (code, reason) => {
        this.logger.log(`AI Bot disconnected from room ${roomName} (Code: ${code}, Reason: ${reason || 'No reason provided'})`);
        LiveKitDebug.log(`WebSocket connection closed`, { room: roomName, code, reason: reason.toString() });
        this.botConnections.delete(roomName);
      });

      ws.on('error', (error) => {
        this.logger.error(`WebSocket error for AI Bot in room ${roomName}: ${error.message}`);
        LiveKitDebug.log(`WebSocket error`, { room: roomName, error: error.message });
      });

      return true;
    } catch (error) {
      this.logger.error(`Error creating AI Bot: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Handle incoming messages to the AI Bot
   * @param roomName The room name
   * @param interviewId The interview ID
   * @param message The message data
   */
  private async handleBotMessage(roomName: string, interviewId: string, message: string) {
    try {
      this.logger.debug(`Received message from room ${roomName}: ${message.substring(0, 100)}...`);
      
      if (!message) {
        this.logger.warn(`Empty message received from room ${roomName}`);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(message);
      } catch (parseError) {
        this.logger.error(`Error parsing message as JSON: ${parseError.message}`, parseError.stack);
        return;
      }
      
      // Handle different message types
      switch (data.type) {
        case 'data':
          // Handle data messages (text chat)
          if (data.kind === 'user' && data.payload) {
            let payload;
            try {
              payload = JSON.parse(data.payload);
            } catch (payloadError) {
              this.logger.error(`Error parsing payload as JSON: ${payloadError.message}`, payloadError.stack);
              return;
            }
            
            if (payload.type === 'chat' && payload.message) {
              this.logger.log(`Processing chat message from room ${roomName}: ${payload.message.substring(0, 50)}...`);
              
              // Process user chat message as a candidate response
              await this.interviewService.processResponse(
                interviewId,
                payload.message,
              );
            }
          }
          break;
          
        case 'participant_joined':
          // A new participant joined, check if we should start the interview
          try {
            const interview = this.interviewService.getInterview(interviewId);
            
            if (interview.state === InterviewState.WAITING) {
              this.logger.log(`New participant joined room ${roomName}. Starting interview after delay.`);
              
              // Start the interview after a short delay
              setTimeout(() => {
                this.startAiInterview(roomName, interviewId);
              }, 3000);
            }
          } catch (error) {
            this.logger.error(`Error handling participant_joined event: ${error.message}`, error.stack);
          }
          break;
          
        default:
          // Log but ignore other message types
          this.logger.debug(`Ignored message type: ${data.type}`);
          break;
      }
    } catch (error) {
      this.logger.error(`Error handling bot message: ${error.message}`, error.stack);
    }
  }

  /**
   * Start an AI interview in a room
   * @param roomName The room name
   * @param interviewId The interview ID
   */
  async startAiInterview(roomName: string, interviewId: string) {
    try {
      this.logger.log(`Starting AI interview in room ${roomName} for interview ${interviewId}`);
      
      if (!roomName || !interviewId) {
        this.logger.error('Cannot start AI interview: roomName or interviewId is missing');
        return;
      }
      
      // Start the interview
      try {
        const introduction = this.interviewService.startInterview(interviewId);
        this.logger.log(`Interview ${interviewId} started. Sending introduction message.`);
        
        // Send the introduction message to the room
        const success = await this.sendBotMessage(roomName, {
          type: 'chat',
          message: introduction,
          sender: 'AI Interviewer',
          timestamp: new Date().toISOString(),
        });
        
        if (success) {
          this.logger.log(`Introduction message sent successfully to room ${roomName}`);
        } else {
          this.logger.error(`Failed to send introduction message to room ${roomName}`);
        }
      } catch (error) {
        this.logger.error(`Error starting interview ${interviewId}: ${error.message}`, error.stack);
      }
    } catch (error) {
      this.logger.error(`Error in startAiInterview: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a message from the AI Bot to the room
   * @param roomName The room name
   * @param payload The message payload
   */
  async sendBotMessage(roomName: string, payload: any): Promise<boolean> {
    try {
      const ws = this.botConnections.get(roomName);
      
      if (!ws) {
        this.logger.warn(`No connection found for AI Bot in room ${roomName}`);
        return false;
      }
      
      if (ws.readyState !== WebSocket.OPEN) {
        this.logger.warn(`WebSocket for room ${roomName} is not open. Current state: ${ws.readyState}`);
        return false;
      }
      
      // Format the message according to LiveKit's data channel format
      const message = {
        type: 'data',
        kind: 'reliable',
        payload: JSON.stringify(payload),
      };
      
      // Send a data message
      this.logger.debug(`Sending message to room ${roomName}: ${JSON.stringify(message).substring(0, 100)}...`);
      ws.send(JSON.stringify(message));
      this.logger.log(`Message sent to room ${roomName} successfully`);
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending bot message to room ${roomName}: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Disconnect an AI Bot from a room
   * @param roomName The room name
   */
  disconnectAiBot(roomName: string) {
    const ws = this.botConnections.get(roomName);
    
    if (ws) {
      ws.close();
      this.botConnections.delete(roomName);
      this.logger.log(`AI Bot disconnected from room ${roomName}`);
    }
  }
}
