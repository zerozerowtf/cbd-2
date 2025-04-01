import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-accent" />}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
};
