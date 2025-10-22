/**
 * API URL utilities to ensure consistent backend URL usage
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005';

/**
 * Ensures an image URL uses the correct backend API base URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @param baseUrl - The base URL to use (defaults to API_BASE_URL)
 * @returns Full URL with correct backend domain
 */
export function ensureBackendImageUrl(imageUrl: string | null | undefined, baseUrl?: string): string | null {
  if (!imageUrl) return null;
  
  const base = baseUrl || API_BASE_URL;
  
  // If already absolute URL, return as-is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If relative URL, prepend backend base URL
  const separator = imageUrl.startsWith('/') ? '' : '/';
  return `${base}${separator}${imageUrl}`;
}

/**
 * Processes an object to ensure all image URLs use the correct backend URL
 * @param obj - Object that may contain image URLs
 * @param imageFields - Array of field names that contain image URLs
 * @param baseUrl - The base URL to use (defaults to API_BASE_URL)
 * @returns Object with corrected image URLs
 */
export function processImageUrls<T extends Record<string, unknown>>(
  obj: T, 
  imageFields: (keyof T)[], 
  baseUrl?: string
): T {
  const result = { ...obj };
  
  imageFields.forEach(field => {
    if (result[field]) {
      result[field] = ensureBackendImageUrl(result[field] as string, baseUrl) as T[keyof T];
    }
  });
  
  return result;
}

/**
 * Processes an array of objects to ensure all image URLs use the correct backend URL
 * @param items - Array of objects that may contain image URLs
 * @param imageFields - Array of field names that contain image URLs
 * @param baseUrl - The base URL to use (defaults to API_BASE_URL)
 * @returns Array with corrected image URLs
 */
export function processImageUrlsArray<T extends Record<string, unknown>>(
  items: T[], 
  imageFields: (keyof T)[], 
  baseUrl?: string
): T[] {
  return items.map(item => processImageUrls(item, imageFields, baseUrl));
}

const apiUtils = {
  ensureBackendImageUrl,
  processImageUrls,
  processImageUrlsArray,
};

export default apiUtils;