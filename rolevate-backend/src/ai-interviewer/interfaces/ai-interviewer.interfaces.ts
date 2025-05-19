// Defines the current state of the interview
export enum InterviewState {
  WAITING = 'waiting',
  INTRODUCTION = 'introduction',
  QUESTIONING = 'questioning',
  FOLLOW_UP = 'follow_up',
  CONCLUDING = 'concluding',
  COMPLETED = 'completed',
}

// Interface for storing interview session data
export interface InterviewSession {
  id: string;
  roomName: string;
  candidateId: string;
  state: InterviewState;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime: Date;
  endTime?: Date;
  transcript: InterviewExchange[];
}

// Structure for interview questions
export interface InterviewQuestion {
  id: string;
  text: string;
  type: 'open' | 'technical' | 'behavioral' | 'follow_up';
  context?: string;
  expectedKeywords?: string[];
  askedAt?: Date;
  answeredAt?: Date;
}

// Structure for interview interactions
export interface InterviewExchange {
  timestamp: Date;
  speaker: 'ai' | 'candidate';
  text: string;
  audioUrl?: string;
}

// Interface to match OpenAI's expected message format
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}
