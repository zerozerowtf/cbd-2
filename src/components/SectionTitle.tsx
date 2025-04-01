import React from 'react';
import { ScrollReveal } from './ScrollReveal';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  centered = true,
  className = '',
}) => {
  return (
    <ScrollReveal className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="text-3xl md:text-4xl font-display mb-4">{title}</h2>
      {subtitle && (
        <p className="text-lg opacity-80 max-w-3xl mx-auto">{subtitle}</p>
      )}
    </ScrollReveal>
  );
};
