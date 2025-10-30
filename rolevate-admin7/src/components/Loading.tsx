'use client';

interface LoadingProps {
  fullPage?: boolean;
  message?: string;
}

export default function Loading({ fullPage = false, message = 'Loading...' }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  );
}
