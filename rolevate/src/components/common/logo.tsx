import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold text-foreground tracking-tight">
        rolevate
      </span>
    </div>
  );
};

export default Logo;