"use client";

import React, { useRef, useState } from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAvatar } from '@/hooks/useAvatar';
import { useAuth } from '@/hooks/useAuth';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  showName?: boolean;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: () => void;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40'
};

const iconSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};

/**
 * Avatar Upload Component
 *
 * Displays user avatar with upload/delete functionality
 *
 * @example
 * ```tsx
 * <AvatarUpload
 *   size="lg"
 *   editable={true}
 *   showName={true}
 *   onUploadSuccess={(url) => console.log('Avatar uploaded:', url)}
 * />
 * ```
 */
export default function AvatarUpload({
  size = 'md',
  editable = true,
  showName = false,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess
}: AvatarUploadProps) {
  const { user, refreshUser } = useAuth();
  const { uploading, error, uploadAvatar, deleteAvatar, clearError } = useAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const url = await uploadAvatar(file);

    if (url) {
      // Refresh user data to get updated avatar
      await refreshUser();
      onUploadSuccess?.(url);
    } else if (error) {
      setPreview(null);
      onUploadError?.(error);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    const success = await deleteAvatar();
    if (success) {
      setPreview(null);
      await refreshUser();
      onDeleteSuccess?.();
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const avatarUrl = preview || user?.avatar;

  // Get user initials for placeholder
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-sm overflow-hidden bg-primary-600 border-2 border-gray-200 flex items-center justify-center`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name || 'User avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-white font-bold ${textSizeClasses[size]}`}>
              {getUserInitials()}
            </span>
          )}
        </div>

        {/* Upload/Edit Overlay - Only show when editable */}
        {editable && (
          <div className="absolute inset-0 rounded-sm transition-all duration-200 flex items-center justify-center bg-black/0 group-hover:bg-black/40">
            <button
              onClick={handleButtonClick}
              disabled={uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-sm shadow-lg hover:bg-gray-100 disabled:opacity-50"
              title="Change profile picture"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              ) : (
                <CameraIcon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={!editable || uploading}
        />
      </div>

      {/* User Name */}
      {showName && user?.name && (
        <div className="text-center">
          <p className="font-semibold text-gray-900">{user.name}</p>
          {user.email && (
            <p className="text-sm text-gray-600">{user.email}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {editable && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleButtonClick}
            disabled={uploading}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
          </button>

          {avatarUrl && (
            <button
              onClick={handleDeleteAvatar}
              disabled={uploading}
              className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove profile picture"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-3 max-w-md">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={clearError}
            className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Instructions */}
      {editable && !avatarUrl && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Upload a profile picture. JPG, PNG or GIF. Max size 5MB.
        </p>
      )}
    </div>
  );
}
