'use client';

import React from 'react';
import Link from 'next/link';

interface RolevateLogoProps {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
  textColorLight?: string;
  textColorAccent?: string;
}

export default function RolevateLogo({
  size = 36, // Base size for the icon, text will scale relatively
  primaryColor = '#2DD4BF', // Teal-400
  accentColor = '#5EEAD4', // Lighter Teal for highlights or secondary elements
  textColorLight = '#FFFFFF', // White
  textColorAccent = '#2DD4BF', // Teal-400 for "vate"
}: RolevateLogoProps) {
  return (
    <Link href="/" className="flex items-center cursor-pointer">
      {/* Simple two-tone logo text */}
      <h1
        className="text-[calc(var(--logo-size,30px)*0.95)] md:text-[calc(var(--logo-size,36px)*0.95)] font-light tracking-tight"
        style={{ '--logo-size': `${size}px` } as React.CSSProperties}
      >
        <span style={{ color: textColorLight }}>role</span>
        <span style={{ color: textColorAccent }}>vate</span>
      </h1>
    </Link>
  );
}
