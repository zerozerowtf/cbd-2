import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { ScrollReveal } from '../ScrollReveal';

interface ApartmentFeatureProps {
  icon: LucideIcon;
  title: string;
  details: string;
  delay?: number;
}

export const ApartmentFeature: React.FC<ApartmentFeatureProps> = ({
  icon: Icon,
  title,
  details,
  delay = 0,
}) => {
  return (
    <ScrollReveal 
      delay={delay}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <Icon className="w-8 h-8 text-accent flex-shrink-0" />
        <div>
          <h3 className="text-xl font-display mb-2">{title}</h3>
          <p className="text-primary/80">{details}</p>
        </div>
      </div>
    </ScrollReveal>
  );
};
