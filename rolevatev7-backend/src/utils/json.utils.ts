import { BadRequestException, Logger } from '@nestjs/common';

const logger = new Logger('JsonUtils');

/**
 * Safely parse JSON string without crashing the application
 * @param jsonString - The JSON string to parse
 * @param fieldName - Field name for error messaging
 * @returns Parsed object or undefined
 */
export function parseJsonSafely<T = any>(
  jsonString: string | undefined | null,
  fieldName: string = 'JSON field',
): T | undefined {
  if (!jsonString) {
    return undefined;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.error(`Invalid JSON for ${fieldName}: ${error.message}`);
    throw new BadRequestException(`Invalid JSON format for ${fieldName}`);
  }
}

/**
 * Safely stringify object to JSON
 * @param obj - Object to stringify
 * @returns JSON string or null
 */
export function stringifyJsonSafely(obj: any): string | null {
  if (!obj) {
    return null;
  }

  try {
    return JSON.stringify(obj);
  } catch (error) {
    logger.error(`Failed to stringify object: ${error.message}`);
    return null;
  }
}
