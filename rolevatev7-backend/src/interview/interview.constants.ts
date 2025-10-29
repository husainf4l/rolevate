/**
 * Interview-related constants
 */

export const INTERVIEW_CONSTANTS = {
  ROOM_TOKEN_DURATION_HOURS: 2,
  DEFAULT_PARTICIPANT_NAME: 'Anonymous',
  AI_INTERVIEWER_EMAIL_DOMAIN: '@rolevate.ai',
  AI_INTERVIEWER_NAME: 'AI Interviewer',
  ROOM_NAME_PREFIXES: {
    INTERVIEW: 'interview',
    INTERVIEW_UNDERSCORE: 'interview_',
  },
} as const;

export const ERROR_MESSAGES = {
  INTERVIEW_NOT_FOUND: 'Interview not found',
  NO_ROOM_NAME: 'No room name available',
  NO_APPLICATION_FOUND: 'No application found for this job and phone number. Please verify the phone number is registered.',
  PROVIDE_CREDENTIALS: 'Please provide either interviewId, (jobId + phone), or roomName to join a room',
  PHONE_NOT_FOUND: 'No phone number found for candidate',
  FEEDBACK_SEND_FAILED: 'Failed to send feedback notification',
} as const;
