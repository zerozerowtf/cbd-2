import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import { format, addMonths, startOfMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Booking } from '../../../lib/bookings';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface AdminBookingCalendarProps {
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: Booking) => void;
  showTwoMonths?: boolean;
}

interface BookedDay {
  date: Date;
  booking: Booking;
}

export const AdminBookingCalendar: React.FC<AdminBookingCalendarProps> = ({
  onDateClick,
  onBookingClick,
  showTwoMonths = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [bookedDays, setBookedDays] = useState<BookedDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchCalendarData();
  }, [selectedMonth]);

  const fetchCalendarData = async () => {
    try {
      const startDate = format(selectedMonth, 'yyyy-MM-dd');
      const endDate = format(addMonths(selectedMonth, isMobile ? 1 : showTwoMonths ? 1 : 2), 'yyyy-MM-dd');

      // Fetch bookings and blocked dates in parallel
      const [bookingsRes, blockedRes] = await Promise.all([
        supabase
          .from('booking_details')
          .select('*')
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
          .order('start_date', { ascending: true }),
        supabase
          .from('blocked_dates')
          .select('*')
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (blockedRes.error) throw blockedRes.error;

      // Process bookings into daily entries
      const bookedDaysMap = new Map<string, BookedDay>();
      bookingsRes.data?.forEach(booking => {
        let currentDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);

        while (currentDate <= endDate) {
          bookedDaysMap.set(format(currentDate, 'yyyy-MM-dd'), {
            date: new Date(currentDate),
            booking,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      // Process blocked dates
      const blockedDatesSet = new Set<string>();
      blockedRes.data?.forEach(blocked => {
        let currentDate = new Date(blocked.start_date);
        const endDate = new Date(blocked.end_date);

        while (currentDate <= endDate) {
          blockedDatesSet.add(format(currentDate, 'yyyy-MM-dd'));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      setBookedDays(Array.from(bookedDaysMap.values()));
      setBlockedDates(Array.from(blockedDatesSet).map(date => new Date(date)));
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayClick = (date: Date) => {
    const bookedDay = bookedDays.find(
      day => format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (bookedDay) {
      onBookingClick?.(bookedDay.booking);
    } else if (!blockedDates.some(blocked => isSameDay(blocked, date))) {
      onDateClick?.(date);
    }
  };

  const getDayContent = (date: Date) => {
    const bookedDay = bookedDays.find(
      day => format(day.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (!bookedDay) {
      const isBlocked = blockedDates.some(blocked => isSameDay(blocked, date));
      const isHovered = hoveredDay && isSameDay(date, hoveredDay);
      
      if (!isBlocked && isHovered) {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-accent" />
          </div>
        );
      }
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm">{date.getDate()}</span>
        </div>
      );
    }

    const statusColors = {
      pending: 'bg-amber-50 border-amber-200 text-amber-700',
      confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      cancelled: 'bg-red-50 border-red-200 text-red-700',
    };

    return (
      <div className={`w-full h-full p-1 flex flex-col justify-between border rounded-md
                    ${statusColors[bookedDay.booking.status]}`}>
        <div className="text-xs font-medium truncate">
          {bookedDay.booking.first_name} {bookedDay.booking.last_name}
        </div>
        <div className="text-[10px] flex items-center justify-between">
          <span>{bookedDay.booking.num_adults + bookedDay.booking.num_children} Gäste</span>
          {bookedDay.booking.room_surcharge > 0 && (
            <span>+NZ</span>
          )}
        </div>
      </div>
    );
  };

  // Generate array of months to display
  const months = Array.from(
    { length: isMobile ? 1 : showTwoMonths ? 2 : 3 },
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
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setSelectedMonth(prev => addMonths(prev, -1))}
          className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
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
          onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
          className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : showTwoMonths ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4 md:gap-8`}>
        {months.map((month) => (
          <div key={month.toISOString()} className="w-full">
            <DayPicker
              mode="single"
              locale={de}
              month={month}
              onDayClick={handleDayClick}
              onDayMouseEnter={(date) => setHoveredDay(date)}
              onDayMouseLeave={() => setHoveredDay(null)}
              components={{
                DayContent: ({ date }) => getDayContent(date),
              }}
              modifiers={{
                booked: bookedDays.map(day => day.date),
                blocked: blockedDates,
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: 'transparent',
                },
                blocked: {
                  textDecoration: 'line-through',
                  backgroundColor: '#fee2e2',
                },
                disabled: { 
                  color: '#cbd5e1',
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
                  height: isMobile ? '60px' : '80px',
                  width: '100%',
                },
                day: { 
                  margin: '1px',
                  color: '#1a2e35',
                  width: '100%',
                  height: '100%',
                },
                table: {
                  width: '100%',
                  tableLayout: 'fixed',
                }
              }}
              showOutsideDays={false}
              fixedWeeks
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-sm">Bestätigt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-600" />
          <span className="text-sm">Angefragt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-sm">Storniert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-200" />
          <span className="text-sm">Gesperrt</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Plus className="w-4 h-4 text-accent" />
          <span className="text-sm">Klicken für neue Buchung</span>
        </div>
      </div>
    </div>
  );
};
