// Common interface for all participants in a LiveKit room
export interface Participant {
  identity: string;
  name?: string;
  metadata?: string;
}

// Interface for room creation options
export interface RoomOptions {
  name: string;
  emptyTimeout?: number;
  maxParticipants?: number;
  metadata?: string;
}

// Interface for token creation options
export interface TokenOptions {
  // Identity of the participant (required)
  identity: string;
  
  // Name of the room to join (used in roomName for room grant)
  name: string;
  
  // Time-to-live in seconds (default: 3600)
  ttl?: number;
  
  // Metadata to associate with the participant
  metadata?: string;
  
  // Whether to grant room join permissions
  roomJoin?: boolean;
  
  // Whether the participant can publish media
  canPublish?: boolean;
  
  // Whether the participant can subscribe to other participants' media
  canSubscribe?: boolean;
  
  // Whether the participant can publish data messages
  canPublishData?: boolean;
}

// Interface for room status information
export interface RoomStatus {
  name: string;
  sid: string;
  emptyTimeout: number;
  maxParticipants: number;
  creationTime: number;
  turnPassword: string;
  enabledCodecs: any[];
  metadata: string;
  numParticipants: number;
  activeRecording: boolean;
}
