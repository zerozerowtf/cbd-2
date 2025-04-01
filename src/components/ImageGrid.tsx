import React from 'react';
import { ScrollReveal } from './ScrollReveal';

interface ImageGridProps {
  images: Array<{
    src: string;
    alt?: string;
    title?: string;
    description?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  className?: string;
  withOverlay?: boolean;
  onClick?: (index: number) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  columns = 3,
  gap = 'medium',
  aspectRatio = 'landscape',
  className = '',
  withOverlay = false,
  onClick,
}) => {
  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8',
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div 
      className={`grid ${gapClasses[gap]} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <ScrollReveal key={index} delay={index * 100}>
          <div 
            className={`relative overflow-hidden rounded-lg shadow-md ${aspectRatioClasses[aspectRatio]} 
                      ${onClick ? 'cursor-pointer transform transition-transform hover:scale-[1.02]' : ''}`}
            onClick={() => onClick && onClick(index)}
          >
            <img 
              src={image.src} 
              alt={image.alt || ''} 
              className="w-full h-full object-cover"
            />
            
            {(image.title || image.description) && withOverlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-4">
                {image.title && (
                  <h4 className="text-lg font-display text-secondary">{image.title}</h4>
                )}
                {image.description && (
                  <p className="text-sm text-secondary/90">{image.description}</p>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
};
