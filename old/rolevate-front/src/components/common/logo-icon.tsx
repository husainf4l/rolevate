import React from "react";
import Image from "next/image";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export default function LogoIcon({ size = 32, className = "" }: LogoIconProps) {
  return (
    <Image
      src="/logo/Rolevate-icon.webp"
      alt="Rolevate Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}