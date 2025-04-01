import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FormSection } from '../../forms/FormSection';
import { AvailabilityCalendar } from '../AvailabilityCalendar';

interface DateSelectionProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
  error?: string;
}

export const DateSelection: React.FC<DateSelectionProps> = ({
  dateRange,
  onSelect,
  error,
}) => {
  return (
    <FormSection 
      title="Verfügbarkeit prüfen"
      subtitle="Wählen Sie Ihren gewünschten Aufenthaltszeitraum"
    >
      <AvailabilityCalendar
        selectedRange={dateRange}
        onSelect={onSelect}
        className="mb-4"
      />
      {error && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </FormSection>
  );
};
