import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: string;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  threshold = 0.1,
  delay = 0,
  duration = 800,
  direction = 'up',
  distance = '20px',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const entry = useIntersectionObserver(ref, { threshold });

  useEffect(() => {
    if (entry?.isIntersecting && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [entry, delay, isVisible]);

  const getTransform = () => {
    if (direction === 'none') return 'none';
    
    switch (direction) {
      case 'up': return `translateY(${distance})`;
      case 'down': return `translateY(-${distance})`;
      case 'left': return `translateX(${distance})`;
      case 'right': return `translateX(-${distance})`;
      default: return `translateY(${distance})`;
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};
