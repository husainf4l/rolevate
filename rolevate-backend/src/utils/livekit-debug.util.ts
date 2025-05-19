import { Logger } from '@nestjs/common';

/**
 * Debug utility for LiveKit WebSocket connections
 */
export class LiveKitDebug {
  private static readonly logger = new Logger('LiveKitDebug');
  private static enabled = process.env.LIVEKIT_DEBUG === 'true';

  /**
   * Log a debug message if debugging is enabled
   * @param message The message to log
   * @param context Optional context information
   */
  static log(message: string, context?: any): void {
    if (!this.enabled) return;
    
    if (context) {
      this.logger.debug(`${message} ${JSON.stringify(context)}`);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Get WebSocket ready state as a string
   * @param readyState The WebSocket ready state number
   * @returns String representation of the ready state
   */
  static getWebSocketState(readyState: number): string {
    switch (readyState) {
      case 0: return 'CONNECTING';
      case 1: return 'OPEN';
      case 2: return 'CLOSING';
      case 3: return 'CLOSED';
      default: return `UNKNOWN (${readyState})`;
    }
  }
}
