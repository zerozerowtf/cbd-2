import React from 'react';
import { ScrollReveal } from './ScrollReveal';

interface ImageSectionProps {
  image: string;
  title: string;
  description: string;
  reverse?: boolean;
  className?: string;
}

export const ImageSection: React.FC<ImageSectionProps> = ({
  image,
  title,
  description,
  reverse = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 ${className}`}>
      <ScrollReveal className="flex-1">
        <div className="relative overflow-hidden rounded-lg shadow-lg group">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/0 transition-colors duration-500" />
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </ScrollReveal>
      
      <ScrollReveal className="flex-1 flex flex-col justify-center" delay={200}>
        <h3 className="text-2xl md:text-3xl font-display mb-4">{title}</h3>
        <p className="text-primary/80 leading-relaxed">{description}</p>
      </ScrollReveal>
    </div>
  );
};
