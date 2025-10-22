import { useState } from 'react';
import { updateAvatar, removeAvatar } from '@/services/auth';

interface UseAvatarReturn {
  uploading: boolean;
  error: string | null;
  uploadAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook for managing user avatar upload and deletion
 *
 * @example
 * ```tsx
 * const { uploading, error, uploadAvatar, deleteAvatar } = useAvatar();
 *
 * const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const url = await uploadAvatar(file);
 *     if (url) {
 *       console.log('Avatar uploaded:', url);
 *     }
 *   }
 * };
 * ```
 */
export function useAvatar(): UseAvatarReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setError(null);

      const url = await updateAvatar(file);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (): Promise<boolean> => {
    try {
      setUploading(true);
      setError(null);

      await removeAvatar();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar';
      setError(errorMessage);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploading,
    error,
    uploadAvatar,
    deleteAvatar,
    clearError
  };
}
