import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div className={`eco-card ${glow ? 'eco-card--glow' : ''} ${className}`}>
      {children}
    </div>
  );
}
