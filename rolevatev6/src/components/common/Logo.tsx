import React from "react";

interface LogoProps {
  size?: number;
  companyLogo?: string | undefined;
  companyName?: string | undefined;
}

export default function Logo({
  size = 190,
  companyLogo,
  companyName,
}: LogoProps) {
  // If company logo is provided, show it
  if (companyLogo) {
    return (
      <div className="flex items-center">
        <img
          src={companyLogo}
          alt={`${companyName || "Company"} Logo`}
          className="object-contain"
          style={{
            width: size,
            height: size,
            maxWidth: size,
            maxHeight: size,
          }}
        />
      </div>
    );
  }

  // If company name is provided but no logo, show company initial
  if (companyName && companyName.toLowerCase() !== "rolevate") {
    return (
      <div
        className="bg-gradient-to-tr from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
      >
        {companyName.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Default: show rolevate logo image
  return (
    <div className="flex items-center">
      <img
        src="/logo/Rolevate.webp"
        alt="Rolevate Logo"
        className="object-contain"
        style={{
          width: size,
          height: size,
          maxWidth: size,
          maxHeight: size,
        }}
      />
    </div>
  );
}