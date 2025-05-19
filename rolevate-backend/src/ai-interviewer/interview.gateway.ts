import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { LivekitService } from '../livekit/livekit.service';
import { InterviewState } from './interfaces/ai-interviewer.interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class InterviewGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(InterviewGateway.name);
  private readonly clientRooms = new Map<string, string>(); // Map client ID to room name

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly interviewService: InterviewService,
    private readonly livekitService: LivekitService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up client room mapping
    const roomName = this.clientRooms.get(client.id);
    if (roomName) {
      this.clientRooms.delete(client.id);
      this.logger.log(`Client ${client.id} removed from room ${roomName}`);
    }
  }

  @SubscribeMessage('joinInterview')
  handleJoinInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { interviewId: string; participantId: string },
  ) {
    try {
      const { interviewId, participantId } = data;
      this.logger.log(`Participant ${participantId} joining interview ${interviewId}`);
      
      // Associate the client with the interview
      this.clientRooms.set(client.id, interviewId);
      
      // Join the socket room
      client.join(interviewId);
      
      // Emit a confirmation event
      client.emit('joinedInterview', { 
        interviewId, 
        message: 'Successfully joined interview session' 
      });
      
      // Broadcast to others in the room that a new participant has joined
      client.to(interviewId).emit('participantJoined', { participantId });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error joining interview: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to join interview' });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leaveInterview')
  handleLeaveInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { interviewId: string; participantId: string },
  ) {
    try {
      const { interviewId, participantId } = data;
      this.logger.log(`Participant ${participantId} leaving interview ${interviewId}`);
      
      // Leave the socket room
      client.leave(interviewId);
      
      // Remove the client-room association
      this.clientRooms.delete(client.id);
      
      // Broadcast to others that a participant has left
      client.to(interviewId).emit('participantLeft', { participantId });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error leaving interview: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('candidateResponse')
  async handleCandidateResponse(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { interviewId: string; response: string },
  ) {
    try {
      const { interviewId, response } = data;
      this.logger.log(`Received response in interview ${interviewId}`);
      
      // Process the candidate's response
      const result = await this.interviewService.processResponse(
        interviewId,
        response,
      );
      
      // Broadcast the AI's response to all clients in the room
      this.server.to(interviewId).emit('aiInterviewerMessage', {
        interviewId,
        message: result.text,
        messageType: result.type,
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing response: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to process response' });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('startInterview')
  handleStartInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { interviewId: string },
  ) {
    try {
      const { interviewId } = data;
      this.logger.log(`Starting interview ${interviewId}`);
      
      // Start the interview
      const introduction = this.interviewService.startInterview(interviewId);
      
      // Broadcast the AI's introduction to all clients in the room
      this.server.to(interviewId).emit('aiInterviewerMessage', {
        interviewId,
        message: introduction,
        messageType: 'introduction',
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error starting interview: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to start interview' });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('endInterview')
  handleEndInterview(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { interviewId: string },
  ) {
    try {
      const { interviewId } = data;
      this.logger.log(`Ending interview ${interviewId}`);
      
      // Update the interview state to completed
      const interview = this.interviewService.updateInterviewState(
        interviewId,
        InterviewState.COMPLETED,
      );
      
      // Broadcast to all clients that the interview has ended
      this.server.to(interviewId).emit('interviewEnded', {
        interviewId,
        message: 'The interview has been completed',
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error ending interview: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to end interview' });
      return { success: false, error: error.message };
    }
  }
}
