import React, { useEffect, useState } from 'react';
import { useParallax } from '../hooks/useParallax';

interface ParallaxHeroProps {
  title: string;
  subtitle?: string;
  images: {
    main: string;
    overlay?: string;
  };
  height?: string;
  className?: string;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  title,
  subtitle,
  images,
  height = 'h-[80vh]',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref } = useParallax();

  useEffect(() => {
    const img = new Image();
    img.src = images.main;
    img.onload = () => setIsLoaded(true);
  }, [images.main]);

  return (
    <div 
      className={`relative ${height} overflow-hidden ${className}`}
      ref={ref}
    >
      {/* Main background image with parallax effect */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          backgroundImage: `url(${images.main})`,
          transform: 'scale(1.1)',
        }}
      />

      {/* Optional overlay image */}
      {images.overlay && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images.overlay})` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/70" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-display text-secondary mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-secondary/90 max-w-2xl drop-shadow-md">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
