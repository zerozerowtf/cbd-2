import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from '../../hooks/useSwipeable';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex,
  title,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const nextImage = useCallback(() => {
    setDirection('next');
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setDirection('prev');
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    swipeThreshold: 30
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, nextImage, prevImage]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-secondary hover:text-accent 
                 transition-colors z-50 p-2"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        {...handlers}
      >
        {/* Navigation Buttons */}
        {images.length > 1 && !isMobile && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 p-2 rounded-full bg-primary/80 text-secondary
                       hover:bg-accent transition-colors z-10 focus:outline-none
                       focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 p-2 rounded-full bg-primary/80 text-secondary
                       hover:bg-accent transition-colors z-10 focus:outline-none
                       focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Image Container */}
        <div className="relative max-w-[90vw] max-h-[90vh]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          )}
          <img
            src={images[currentIndex].replace('w=1200', 'w=1920')}
            alt={`${title} - Bild ${currentIndex + 1}`}
            className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl
                     transition-all duration-300 ${
                       isLoading ? 'opacity-0' : 'opacity-100'
                     } ${
                       direction === 'next' ? 'animate-slide-left' : 
                       direction === 'prev' ? 'animate-slide-right' : ''
                     }`}
            onLoad={() => {
              setIsLoading(false);
              setDirection(null);
            }}
          />
        </div>

        {/* Image Counter and Title */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
          <h3 className="text-secondary text-lg font-display text-center px-4">{title}</h3>
          <div className="px-4 py-2 bg-primary/80 rounded-full text-secondary">
            {currentIndex + 1} / {images.length}
          </div>
          {isMobile && images.length > 1 && (
            <p className="text-secondary/80 text-sm mt-2">
              Wischen Sie nach links oder rechts
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
