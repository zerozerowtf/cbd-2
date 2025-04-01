import React from 'react';
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface BookingCalendarProps {
  selectedRange: { from: Date | undefined; to: Date | undefined };
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
  disabledDays?: Date[];
  minNights?: number;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedRange,
  onSelect,
  disabledDays = [],
  minNights = 4,
}) => {
  const footer = selectedRange.from ? (
    <div className="mt-4 text-sm text-primary/70">
      {selectedRange.to ? (
        <>
          <Calendar className="inline-block w-4 h-4 mr-1 -mt-0.5" />
          {format(selectedRange.from, 'PPP', { locale: de })} 
          {' – '}
          {format(selectedRange.to, 'PPP', { locale: de })}
        </>
      ) : (
        'Wählen Sie ein Abreisedatum'
      )}
    </div>
  ) : (
    <div className="mt-4 text-sm text-primary/70">
      <Calendar className="inline-block w-4 h-4 mr-1 -mt-0.5" />
      Wählen Sie ein Anreisedatum
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[0, 1, 2].map((offset) => (
          <DayPicker
            key={offset}
            mode="range"
            selected={selectedRange}
            onSelect={onSelect}
            locale={de}
            month={new Date(new Date().setMonth(new Date().getMonth() + offset))}
            disabled={[
              ...disabledDays,
              { before: new Date() },
            ]}
            modifiers={{
              booked: disabledDays,
            }}
            modifiersStyles={{
              booked: { 
                textDecoration: 'line-through', 
                color: '#94a3b8',
                backgroundColor: '#f1f5f9',
              },
              disabled: { 
                color: '#cbd5e1',
              },
              selected: {
                backgroundColor: '#a59d8f',
                color: '#f5f3ee',
              },
              today: {
                color: '#1a2e35',
                fontWeight: 'bold',
              },
            }}
            styles={{
              caption: { color: '#1a2e35' },
              head_cell: { color: '#a59d8f' },
              cell: { fontSize: '16px' },
              day: { margin: '2px', color: '#1a2e35' },
              nav_button_previous: { color: '#1a2e35' },
              nav_button_next: { color: '#1a2e35' },
            }}
            showOutsideDays={false}
            fixedWeeks
          />
        ))}
      </div>
      <div className="mt-6 border-t border-gray-200 pt-4">
        {footer}
      </div>
    </div>
  );
};
