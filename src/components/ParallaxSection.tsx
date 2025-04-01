import React from 'react';
import { useParallax } from '../hooks/useParallax';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  scale?: number;
  easing?: 'linear' | 'ease-out' | 'ease-in-out';
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  speed = 0.2,
  disabled = false,
  direction = 'vertical',
  scale = 1,
  easing = 'ease-out',
}) => {
  const elementRef = useParallax({
    speed,
    disabled,
    direction,
    scale,
    easing,
  });

  return (
    <div
      ref={elementRef}
      className={`relative ${className}`}
      style={{
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};
