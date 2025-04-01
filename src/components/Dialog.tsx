import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    'full': 'w-[95vw] h-[95vh]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-primary/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Dialog */}
        <div 
          className={`inline-block w-full ${sizeClasses[size]} my-8 text-left align-middle bg-white rounded-xl shadow-xl transform transition-all`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-display">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <X size={20} className="text-primary/60" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(95vh-8rem)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
