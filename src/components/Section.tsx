import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  layered?: boolean;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'primary',
  layered = false,
  className = '',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return 'bg-primary text-secondary';
      case 'secondary': return 'bg-secondary text-primary';
      case 'accent': return 'bg-accent text-secondary';
      default: return 'bg-secondary text-primary';
    }
  };

  return (
    <section className={`relative ${getBackgroundColor()} ${className}`}>
      {layered && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 left-0 right-0 h-32 bg-current opacity-5 transform -skew-y-3" />
        </div>
      )}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {children}
      </div>
    </section>
  );
};
