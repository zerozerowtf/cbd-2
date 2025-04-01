import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Users, DoorOpen, Check } from 'lucide-react';

interface StepSummaryProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  guests?: {
    adults: number;
    children: number;
  };
  withExtraRoom?: boolean;
  selectedOptions?: string[];
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  dateRange,
  guests,
  withExtraRoom,
  selectedOptions = [],
}) => {
  if (!dateRange.from || !dateRange.to) return null;

  return (
    <div className="bg-accent/5 rounded-lg p-3 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          <div className="text-sm">
            <span className="text-primary/60">Zeitraum:</span>{' '}
            <span className="font-medium">
              {format(dateRange.from, 'dd.MM.', { locale: de })} 
              {' – '}
              {format(dateRange.to, 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
        </div>

        {/* Guests */}
        {guests && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <div className="text-sm">
              <span className="text-primary/60">Gäste:</span>{' '}
              <span className="font-medium">
                {guests.adults} Erw.
                {guests.children > 0 && `, ${guests.children} Ki.`}
              </span>
            </div>
          </div>
        )}

        {/* Room Type */}
        {typeof withExtraRoom !== 'undefined' && (
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-accent" />
            <div className="text-sm">
              <span className="text-primary/60">Unterkunft:</span>{' '}
              <span className="font-medium">
                {withExtraRoom ? 'Mit Nebenzimmer' : 'Hauptwohnung'}
              </span>
            </div>
          </div>
        )}

        {/* Selected Options */}
        {selectedOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            <div className="text-sm">
              <span className="text-primary/60">Extras:</span>{' '}
              <span className="font-medium">
                {selectedOptions.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
