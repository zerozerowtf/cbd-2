import React, { useState, useCallback } from 'react';
import { DivideIcon as LucideIcon, Stars as Stairs, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSwipeable } from '../../hooks/useSwipeable';

interface FloorFeature {
  icon: LucideIcon;
  text: string;
}

interface Floor {
  level: string;
  title: string;
  description?: string;
  features: FloorFeature[];
  images: string[];
}

interface FloorTabsProps {
  floors: Floor[];
  onImageClick: (floorIndex: number, imageIndex: number) => void;
}

export const FloorTabs: React.FC<FloorTabsProps> = ({ floors, onImageClick }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const nextImage = useCallback(() => {
    setIsImageLoading(true);
    setActiveImage((prev) => (prev < floors[activeTab].images.length - 1 ? prev + 1 : 0));
  }, [activeTab, floors]);

  const prevImage = useCallback(() => {
    setIsImageLoading(true);
    setActiveImage((prev) => (prev > 0 ? prev - 1 : floors[activeTab].images.length - 1));
  }, [activeTab, floors]);

  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    swipeThreshold: 30
  });

  const handleTabChange = (index: number) => {
    setIsImageLoading(true);
    setActiveTab(index);
    setActiveImage(0);
    setShowInfo(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* Full-height Image Background */}
      <div 
        {...handlers}
        className="fixed inset-0 bg-primary transition-opacity duration-500"
        style={{ zIndex: -1 }}
      >
        {/* Loading Indicator */}
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Background Image */}
        <img
          src={floors[activeTab].images[activeImage]}
          alt={`${floors[activeTab].title} - Bild ${activeImage + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500
                   ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsImageLoading(false)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Floor Navigation */}
        <div className="sticky top-16 z-30 bg-primary/95 backdrop-blur shadow-lg py-3 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {floors.map((floor, index) => (
                <button
                  key={floor.level}
                  onClick={() => handleTabChange(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                          whitespace-nowrap flex-shrink-0 ${
                            activeTab === index 
                              ? 'bg-accent text-secondary shadow-lg scale-105' 
                              : 'bg-secondary/10 text-secondary/80 hover:bg-secondary/20'
                          }`}
                >
                  <Stairs className="w-5 h-5" />
                  <span className="font-medium">{floor.level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <ScrollReveal key={activeTab}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className={`space-y-6 transition-all duration-500 ${
                  showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                  <div>
                    <h3 className="text-lg font-medium text-accent mb-2">
                      {floors[activeTab].level}
                    </h3>
                    <h2 className="text-4xl md:text-5xl font-display text-secondary mb-4">
                      {floors[activeTab].title}
                    </h2>
                    {floors[activeTab].description && (
                      <p className="text-secondary/80 text-lg leading-relaxed">
                        {floors[activeTab].description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {floors[activeTab].features.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 group bg-primary/50 backdrop-blur
                                 p-4 rounded-lg transition-all hover:bg-primary/70"
                      >
                        <feature.icon 
                          className="w-6 h-6 text-accent flex-shrink-0 
                                   transition-transform duration-300 group-hover:scale-110" 
                        />
                        <span className="text-secondary group-hover:text-accent transition-colors">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Navigation */}
                <div className="relative aspect-video lg:aspect-square rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-between p-4 z-10">
                    <button
                      onClick={prevImage}
                      className="p-2 rounded-full bg-primary/80 text-secondary
                               hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="p-2 rounded-full bg-primary/80 text-secondary
                               hover:bg-accent transition-colors"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 
                               bg-primary/80 rounded-full text-secondary text-sm">
                    {activeImage + 1} / {floors[activeTab].images.length}
                  </div>

                  <img
                    src={floors[activeTab].images[activeImage]}
                    alt={`${floors[activeTab].title} - Bild ${activeImage + 1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl 
                             cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => onImageClick(activeTab, activeImage)}
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};
