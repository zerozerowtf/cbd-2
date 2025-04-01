import React from 'react';
import { Calendar, Users, CreditCard, CheckCircle } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface BookingStepsProps {
  currentStep: number;
}

export const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const steps = [
    { icon: Calendar, label: 'Zeitraum' },
    { icon: Users, label: 'Gäste' },
    { icon: CreditCard, label: 'Kontakt' },
    { icon: CheckCircle, label: 'Bestätigung' },
  ];

  return (
    <div className="relative mb-8">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200">
        <div 
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div 
              key={step.label} 
              className={`flex flex-col items-center ${
                isMobile ? 'w-1/4' : ''
              }`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                         transition-all duration-500 ${
                           isCompleted || isCurrent
                             ? 'bg-accent text-secondary'
                             : 'bg-gray-200 text-gray-400'
                         }`}
              >
                <step.icon className="w-4 h-4" />
              </div>
              {!isMobile && (
                <span className={`mt-2 text-sm ${
                  isCompleted || isCurrent ? 'text-primary' : 'text-primary/60'
                }`}>
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Label - Show only current step */}
      {isMobile && (
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-primary">
            {steps[currentStep].label}
          </span>
        </div>
      )}
    </div>
  );
};
