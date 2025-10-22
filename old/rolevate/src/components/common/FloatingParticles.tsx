'use client';

import { useEffect, useState } from 'react';

interface FloatingParticlesProps {
  count?: number;
}

interface ParticleStyle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export default function FloatingParticles({ count = 20 }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);

  useEffect(() => {
    // Generate random values only on the client side after hydration
    const newParticles = Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`
    }));
    setParticles(newParticles);
  }, [count]);

  if (particles.length === 0) {
    return null; // Don't render anything until client-side values are set
  }

  return (
    <div className="absolute inset-0">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/10 rounded-full animate-bounce"
          style={style}
        />
      ))}
    </div>
  );
}