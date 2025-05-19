import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AiService } from './ai.service';
import { LivekitService } from '../livekit/livekit.service';
import {
  InterviewSession,
  InterviewState,
  InterviewQuestion,
  InterviewExchange,
  ChatMessage,
} from './interfaces/ai-interviewer.interfaces';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);
  private readonly interviews: Map<string, InterviewSession> = new Map();

  constructor(
    private readonly aiService: AiService,
    private readonly livekitService: LivekitService,
  ) {}

  /**
   * Create a new interview session
   * @param roomName The LiveKit room name for the interview
   * @param candidateId The candidate's unique identifier
   * @param jobDescription Description of the job being interviewed for
   * @returns The created interview session
   */
  async createInterview(
    roomName: string,
    candidateId: string,
    jobDescription: string,
  ): Promise<InterviewSession> {
    try {
      // Generate interview questions using AI
      const questionTexts = await this.aiService.generateInterviewQuestions(
        jobDescription,
        'This is a technical interview for a software engineering position',
        5, // Generate 5 questions
      );

      // Map question texts to InterviewQuestion objects
      const questions: InterviewQuestion[] = questionTexts.map((text, index) => ({
        id: uuidv4(),
        text,
        type: index === 0 ? 'open' : 'technical',
        expectedKeywords: [],
      }));

      // Create interview session object
      const interviewId = uuidv4();
      const interview: InterviewSession = {
        id: interviewId,
        roomName,
        candidateId,
        state: InterviewState.WAITING,
        questions,
        currentQuestionIndex: 0,
        startTime: new Date(),
        transcript: [],
      };

      // Store the interview session
      this.interviews.set(interviewId, interview);
      
      this.logger.log(`Created interview session ${interviewId} in room ${roomName}`);
      
      return interview;
    } catch (error) {
      this.logger.error(`Error creating interview: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get an interview session by ID
   * @param interviewId The interview session ID
   * @returns The interview session
   */
  getInterview(interviewId: string): InterviewSession {
    const interview = this.interviews.get(interviewId);
    if (!interview) {
      throw new Error(`Interview session ${interviewId} not found`);
    }
    return interview;
  }

  /**
   * Get an interview session by room name
   * @param roomName The room name to look up
   * @returns The interview session or undefined if not found
   */
  getInterviewByRoom(roomName: string): InterviewSession | undefined {
    // Search through all interviews to find the one with the matching room name
    for (const interview of this.interviews.values()) {
      if (interview.roomName === roomName) {
        return interview;
      }
    }
    return undefined;
  }

  /**
   * Update the state of an interview
   * @param interviewId The interview session ID
   * @param state The new interview state
   * @returns The updated interview session
   */
  updateInterviewState(
    interviewId: string,
    state: InterviewState,
  ): InterviewSession {
    const interview = this.getInterview(interviewId);
    interview.state = state;
    
    // If the interview is completed, set the end time
    if (state === InterviewState.COMPLETED) {
      interview.endTime = new Date();
    }
    
    this.interviews.set(interviewId, interview);
    this.logger.log(`Updated interview ${interviewId} state to ${state}`);
    
    return interview;
  }

  /**
   * Process a candidate's response and update the interview accordingly
   * @param interviewId The interview session ID
   * @param response The candidate's response text
   * @returns The next question or action
   */
  async processResponse(
    interviewId: string,
    response: string,
  ): Promise<{ text: string; type: string }> {
    try {
      const interview = this.getInterview(interviewId);
      
      // Add the candidate's response to the transcript
      interview.transcript.push({
        timestamp: new Date(),
        speaker: 'candidate',
        text: response,
      });

      // Get the current question
      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      // Mark the current question as answered
      if (currentQuestion && !currentQuestion.answeredAt) {
        currentQuestion.answeredAt = new Date();
      }

      // Analyze the response
      const analysis = await this.aiService.analyzeResponse(
        currentQuestion.text,
        response,
      );

      // Determine the next action based on the interview state
      switch (interview.state) {
        case InterviewState.INTRODUCTION:
          // Move to questioning state after introduction
          this.updateInterviewState(interviewId, InterviewState.QUESTIONING);
          
          // Ask the first question
          const firstQuestion = interview.questions[0];
          firstQuestion.askedAt = new Date();
          
          // Add the question to the transcript
          interview.transcript.push({
            timestamp: new Date(),
            speaker: 'ai',
            text: firstQuestion.text,
          });
          
          return { text: firstQuestion.text, type: 'question' };

        case InterviewState.QUESTIONING:
          // Decide whether to ask a follow-up or move to the next question
          const shouldAskFollowUp = Math.random() > 0.5; // 50% chance for a follow-up
          
          if (shouldAskFollowUp) {
            // Generate a follow-up question
            this.updateInterviewState(interviewId, InterviewState.FOLLOW_UP);
            const followUpQuestion = await this.aiService.generateFollowUp(
              currentQuestion.text,
              response,
            );
            
            // Create a new question object for the follow-up
            const followUp: InterviewQuestion = {
              id: uuidv4(),
              text: followUpQuestion,
              type: 'follow_up',
              context: currentQuestion.text,
              askedAt: new Date(),
            };
            
            // Insert the follow-up after the current question
            interview.questions.splice(
              interview.currentQuestionIndex + 1,
              0,
              followUp,
            );
            
            // Move to the follow-up question
            interview.currentQuestionIndex++;
            
            // Add the follow-up to the transcript
            interview.transcript.push({
              timestamp: new Date(),
              speaker: 'ai',
              text: followUpQuestion,
            });
            
            return { text: followUpQuestion, type: 'follow_up' };
          } else {
            // Move to the next question
            interview.currentQuestionIndex++;
            
            // Check if we've reached the end of the questions
            if (interview.currentQuestionIndex >= interview.questions.length) {
              // If so, conclude the interview
              this.updateInterviewState(interviewId, InterviewState.CONCLUDING);
              
              const conclusion =
                "Thank you for participating in this interview. You've done well, and I have all the information I need. Do you have any questions for me?";
              
              // Add the conclusion to the transcript
              interview.transcript.push({
                timestamp: new Date(),
                speaker: 'ai',
                text: conclusion,
              });
              
              return { text: conclusion, type: 'conclusion' };
            } else {
              // Otherwise, ask the next question
              const nextQuestion =
                interview.questions[interview.currentQuestionIndex];
              nextQuestion.askedAt = new Date();
              
              // Add the question to the transcript
              interview.transcript.push({
                timestamp: new Date(),
                speaker: 'ai',
                text: nextQuestion.text,
              });
              
              return { text: nextQuestion.text, type: 'question' };
            }
          }

        case InterviewState.FOLLOW_UP:
          // After a follow-up, always move to the next main question
          interview.currentQuestionIndex++;
          
          // Check if we've reached the end of the questions
          if (interview.currentQuestionIndex >= interview.questions.length) {
            // If so, conclude the interview
            this.updateInterviewState(interviewId, InterviewState.CONCLUDING);
            
            const conclusion =
              "Thank you for participating in this interview. You've done well, and I have all the information I need. Do you have any questions for me?";
            
            // Add the conclusion to the transcript
            interview.transcript.push({
              timestamp: new Date(),
              speaker: 'ai',
              text: conclusion,
            });
            
            return { text: conclusion, type: 'conclusion' };
          } else {
            // Otherwise, ask the next question
            this.updateInterviewState(interviewId, InterviewState.QUESTIONING);
            const nextQuestion =
              interview.questions[interview.currentQuestionIndex];
            nextQuestion.askedAt = new Date();
            
            // Add the question to the transcript
            interview.transcript.push({
              timestamp: new Date(),
              speaker: 'ai',
              text: nextQuestion.text,
            });
            
            return { text: nextQuestion.text, type: 'question' };
          }

        case InterviewState.CONCLUDING:
          // After conclusion, complete the interview
          this.updateInterviewState(interviewId, InterviewState.COMPLETED);
          
          const farewell =
            "Thank you for your time today. The interview is now complete. We'll be in touch regarding next steps. Have a great day!";
          
          // Add the farewell to the transcript
          interview.transcript.push({
            timestamp: new Date(),
            speaker: 'ai',
            text: farewell,
          });
          
          return { text: farewell, type: 'farewell' };

        default:
          // For any other state, start the interview
          this.updateInterviewState(interviewId, InterviewState.INTRODUCTION);
          
          const introduction =
            "Hello! I'm your AI interviewer today. I'll be asking you some questions about your experience and skills. Let's start by having you introduce yourself briefly.";
          
          // Add the introduction to the transcript
          interview.transcript.push({
            timestamp: new Date(),
            speaker: 'ai',
            text: introduction,
          });
          
          return { text: introduction, type: 'introduction' };
      }
    } catch (error) {
      this.logger.error(`Error processing response: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Start an interview session
   * @param interviewId The interview session ID
   * @returns The introduction message
   */
  startInterview(interviewId: string): string {
    try {
      if (!interviewId) {
        this.logger.error('Cannot start interview: interviewId is undefined');
        throw new Error('Interview ID is required');
      }
      
      const interview = this.getInterview(interviewId);
      
      if (!interview) {
        this.logger.error(`Cannot start interview: interview with ID ${interviewId} not found`);
        throw new Error(`Interview with ID ${interviewId} not found`);
      }
      
      this.logger.log(`Starting interview ${interviewId} in room ${interview.roomName}`);
      
      // Update the interview state to introduction
      this.updateInterviewState(interviewId, InterviewState.INTRODUCTION);
      
      const introduction =
        "Hello! I'm your AI interviewer today. I'll be asking you some questions about your experience and skills. Let's start by having you introduce yourself briefly.";
      
      // Add the introduction to the transcript
      interview.transcript.push({
        timestamp: new Date(),
        speaker: 'ai',
        text: introduction,
      });
      
      this.logger.log(`Interview ${interviewId} started successfully`);
      
      return introduction;
    } catch (error) {
      this.logger.error(`Error starting interview: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get the transcript of an interview
   * @param interviewId The interview session ID
   * @returns Array of interview exchanges
   */
  getTranscript(interviewId: string): InterviewExchange[] {
    const interview = this.getInterview(interviewId);
    return interview.transcript;
  }

  /**
   * Generate a summary of the interview
   * @param interviewId The interview session ID
   * @returns Promise resolving to interview summary text
   */
  async generateSummary(interviewId: string): Promise<string> {
    try {
      const interview = this.getInterview(interviewId);
      
      // Convert the transcript to a string format
      const transcriptText = interview.transcript
        .map(exchange => `${exchange.speaker}: ${exchange.text}`)
        .join('\n\n');
      
      // Use AI to generate a summary
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'You are an expert at summarizing technical interviews. Provide a concise summary of the following interview transcript, highlighting key strengths and areas for improvement.',
        },
        {
          role: 'user',
          content: `Here is the interview transcript:\n\n${transcriptText}`,
        },
      ];
      
      const summary = await this.aiService.generateResponse(messages);
      return summary;
    } catch (error) {
      this.logger.error(`Error generating summary: ${error.message}`, error.stack);
      throw error;
    }
  }
}
