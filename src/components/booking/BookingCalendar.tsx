import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import { format, addDays, isBefore, differenceInDays, addMonths } from 'date-fns';
import { Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlockedDates, calculatePrice } from '../../lib/bookings';
import { supabase } from '../../lib/supabase';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface BookingCalendarProps {
  selectedRange: { from: Date | undefined; to: Date | undefined };
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
  minNights?: number;
  className?: string;
  onPriceCalculated?: (price: number | null) => void;
  showPrices?: boolean;
  withRoomSurcharge?: boolean;
  disabledDays?: Date[];
}

interface BookedDate {
  date: Date;
  type: 'booking' | 'blocked';
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedRange,
  onSelect,
  minNights = 4,
  className = '',
  onPriceCalculated,
  showPrices = true,
  withRoomSurcharge = false,
  disabledDays = [],
}) => {
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [price, setPrice] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (disabledDays.length > 0) {
      // If disabledDays are provided, use them directly
      setBookedDates(disabledDays.map(date => ({
        date,
        type: 'blocked'
      })));
      setIsLoading(false);
    } else {
      // Otherwise fetch from the database
      fetchBookedDates();
    }
  }, [disabledDays]);

  useEffect(() => {
    if (selectedRange.from && selectedRange.to && showPrices) {
      calculatePrice(selectedRange.from, selectedRange.to, 2, withRoomSurcharge)
        .then(priceInfo => {
          setPrice(priceInfo.totalOnline);
          onPriceCalculated?.(priceInfo.totalOnline);
        })
        .catch(err => {
          console.error('Error calculating price:', err);
          setPrice(null);
          onPriceCalculated?.(null);
        });
    } else {
      setPrice(null);
      onPriceCalculated?.(null);
    }
  }, [selectedRange, onPriceCalculated, showPrices, withRoomSurcharge]);

  const fetchBookedDates = async () => {
    try {
      // Fetch both bookings and blocked dates
      const [bookingsRes, blockedRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .neq('status', 'cancelled'),
        supabase
          .from('blocked_dates')
          .select('*'),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (blockedRes.error) throw blockedRes.error;

      // Convert bookings to daily dates
      const bookingDates: BookedDate[] = [];
      bookingsRes.data?.forEach(booking => {
        let currentDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);

        while (currentDate <= endDate) {
          bookingDates.push({
            date: new Date(currentDate),
            type: 'booking',
            status: booking.status,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      // Convert blocked dates
      const blockedDates: BookedDate[] = [];
      blockedRes.data?.forEach(blocked => {
        let currentDate = new Date(blocked.start_date);
        const endDate = new Date(blocked.end_date);

        while (currentDate <= endDate) {
          blockedDates.push({
            date: new Date(currentDate),
            type: 'blocked',
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      setBookedDates([...bookingDates, ...blockedDates]);
    } catch (err) {
      setError('Verfügbarkeitsdaten konnten nicht geladen werden.');
      console.error('Error loading booked dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayClick = (day: Date) => {
    if (!selectedRange.from) {
      // Selecting start date
      onSelect({ from: day, to: undefined });
    } else if (!selectedRange.to) {
      // Selecting end date
      const minEndDate = addDays(selectedRange.from, minNights - 1);
      if (isBefore(day, minEndDate)) {
        setError(`Mindestaufenthalt: ${minNights} Nächte`);
        return;
      }

      // Check if any dates in range are booked
      const daysInRange = differenceInDays(day, selectedRange.from);
      for (let i = 1; i < daysInRange; i++) {
        const currentDate = addDays(selectedRange.from, i);
        if (bookedDates.some(booked => 
          format(booked.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        )) {
          setError('Der gewählte Zeitraum enthält bereits gebuchte Tage');
          return;
        }
      }

      onSelect({ from: selectedRange.from, to: day });
    } else {
      // Reset selection
      onSelect({ from: day, to: undefined });
    }
    setError(null);
  };

  const handleMonthChange = (increment: number) => {
    setSelectedMonth(current => addMonths(current, increment));
  };

  const numberOfNights = selectedRange.from && selectedRange.to
    ? differenceInDays(selectedRange.to, selectedRange.from)
    : null;

  // Generate array of months to display
  const months = Array.from(
    { length: isMobile ? 1 : 2 },
    (_, i) => addMonths(selectedMonth, i)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
      {error && (
        <div className="mb-6 px-4 py-3 border-l-4 border-red-500 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 px-4 py-3 border-l-4 border-accent bg-accent/5">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 mt-0.5 text-accent" />
          <div>
            <p className="font-medium text-primary">Buchungshinweise:</p>
            <ul className="mt-1 text-sm text-primary/80 space-y-1">
              <li>• Mindestaufenthalt: {minNights} Nächte</li>
              <li>• Check-in ab 15:00 Uhr</li>
              <li>• Check-out bis 11:00 Uhr</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-4 text-base md:text-lg font-medium">
            {months.map((month, index) => (
              <React.Fragment key={month.toISOString()}>
                <span>{format(month, 'MMMM yyyy', { locale: de })}</span>
                {index < months.length - 1 && <span>|</span>}
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 md:gap-8`}>
          {months.map((month) => (
            <DayPicker
              key={month.toISOString()}
              mode="range"
              selected={selectedRange}
              onDayClick={handleDayClick}
              locale={de}
              month={month}
              fromMonth={new Date()}
              toMonth={addMonths(new Date(), 12)}
              disabled={[
                { before: new Date() },
                ...bookedDates.map(date => date.date),
                ...disabledDays,
              ]}
              modifiers={{
                booked: bookedDates.filter(date => date.type === 'booking').map(date => date.date),
                blocked: bookedDates.filter(date => date.type === 'blocked').map(date => date.date),
                pending: bookedDates
                  .filter(date => date.type === 'booking' && date.status === 'pending')
                  .map(date => date.date),
              }}
              modifiersStyles={{
                booked: { 
                  textDecoration: 'line-through', 
                  color: '#94a3b8',
                  backgroundColor: '#f1f5f9',
                },
                blocked: {
                  textDecoration: 'line-through',
                  color: '#94a3b8',
                  backgroundColor: '#fee2e2',
                },
                pending: {
                  textDecoration: 'line-through',
                  color: '#94a3b8',
                  backgroundColor: '#fef3c7',
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
                caption: { display: 'none' },
                head_cell: { 
                  color: '#a59d8f', 
                  fontSize: isMobile ? '14px' : '16px',
                  padding: isMobile ? '4px' : '8px',
                },
                cell: { 
                  fontSize: isMobile ? '14px' : '16px',
                },
                day: { 
                  margin: '1px', 
                  color: '#1a2e35',
                  width: isMobile ? '36px' : '40px',
                  height: isMobile ? '36px' : '40px',
                },
                nav_button_previous: { display: 'none' },
                nav_button_next: { display: 'none' },
              }}
              showOutsideDays={false}
              fixedWeeks
            />
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-primary/80">
            <Calendar className="w-5 h-5" />
            {selectedRange.from ? (
              selectedRange.to ? (
                <span className="text-sm md:text-base">
                  {format(selectedRange.from, 'dd. MMMM yyyy', { locale: de })} 
                  {' – '}
                  {format(selectedRange.to, 'dd. MMMM yyyy', { locale: de })}
                  <span className="ml-2 font-medium text-primary">
                    ({numberOfNights} {numberOfNights === 1 ? 'Nacht' : 'Nächte'})
                  </span>
                </span>
              ) : (
                <span className="text-sm md:text-base">
                  Anreise: {format(selectedRange.from, 'dd. MMMM yyyy', { locale: de })}
                  <span className="ml-2 text-primary/60">
                    (Wählen Sie das Abreisedatum)
                  </span>
                </span>
              )
            ) : (
              'Wählen Sie Ihr Anreisedatum'
            )}
          </div>

          {selectedRange.from && (
            <button
              onClick={() => onSelect({ from: undefined, to: undefined })}
              className="text-sm text-primary/60 hover:text-primary transition-colors"
            >
              Auswahl zurücksetzen
            </button>
          )}
        </div>

        {price !== null && showPrices && (
          <div className="mt-4 p-4 bg-accent/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-primary/80">
                Gesamtpreis für {numberOfNights} Nächte:
              </span>
              <span className="text-xl font-semibold text-primary">
                {price} €
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent" />
            <span className="text-sm text-primary/80">Ausgewählt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f1f5f9]" />
            <span className="text-sm text-primary/80">Gebucht</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#fee2e2]" />
            <span className="text-sm text-primary/80">Gesperrt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#fef3c7]" />
            <span className="text-sm text-primary/80">Angefragt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
