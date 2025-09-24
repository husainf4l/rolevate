import React from 'react';
import { Link } from '@/i18n/navigation';
import { LogoProps } from '@/types/common';

export default function Logo({ className = '', asText = false }: LogoProps) {
  const logoText = 'rolevate';
  const logoClasses = `font-semibold text-2xl tracking-tight text-gray-900 dark:text-white ${asText ? '' : 'hover:opacity-80 transition-opacity cursor-pointer'} ${className}`;

  if (asText) {
    return (
      <span className={logoClasses}>
        {logoText}
      </span>
    );
  }

  return (
    <Link href="/" className={logoClasses}>
      {logoText}
    </Link>
  );
}