import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  columns = 3,
  className = '',
}) => {
  const getColumnsClass = () => {
    switch (columns) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  return (
    <div className={`grid grid-cols-1 ${getColumnsClass()} gap-8 ${className}`}>
      {features.map((feature, index) => (
        <ScrollReveal key={index} delay={index * 100}>
          <div className="bg-secondary rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <feature.icon className="w-12 h-12 text-accent mb-4" />
            <h3 className="text-xl font-display mb-2">{feature.title}</h3>
            <p className="text-primary/80">{feature.description}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
};
