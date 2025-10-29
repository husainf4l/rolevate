import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
  href?: string;
}

export default function Logo({ size = 150, className = "", href = "/" }: LogoProps) {
  const LogoImage = (
    <Image
      src="/logo/Rolevate.webp"
      alt="Rolevate"
      width={size}
      height={size * 0.25} // Approximate aspect ratio for logo
      className={className}
      priority
    />
  );

  // Only wrap in Link if href is provided and not empty
  if (href && href !== "") {
    return (
      <Link href={href} className="inline-block">
        {LogoImage}
      </Link>
    );
  }

  return LogoImage;
}
