import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface DayPrice {
  date: Date;
  price: number;
  season: 'low' | 'mid' | 'high' | 'holiday';
}

export const PricingCalendar = () => {
  const [prices, setPrices] = useState<DayPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [showRoomSurcharge, setShowRoomSurcharge] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchPrices();
  }, [selectedMonth, showRoomSurcharge]);

  const fetchPrices = async () => {
    try {
      const startDate = format(selectedMonth, 'yyyy-MM-dd');
      const endDate = format(addMonths(selectedMonth, isMobile ? 1 : 2), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .order('start_date', { ascending: true });

      if (error) throw error;

      // Convert pricing periods to daily prices
      const dailyPrices: DayPrice[] = [];
      data?.forEach(period => {
        let currentDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);

        while (currentDate <= endDate) {
          dailyPrices.push({
            date: new Date(currentDate),
            price: showRoomSurcharge ? period.base_price + period.room_surcharge : period.base_price,
            season: period.season_type,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      setPrices(dailyPrices);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Fehler beim Laden der Preise');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayContent = (day: Date) => {
    const price = prices.find(p => 
      format(p.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );

    if (!price) return null;

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium">{price.price} €</span>
        <span className={`text-[10px] ${
          price.season === 'low' ? 'text-blue-600' :
          price.season === 'mid' ? 'text-green-600' :
          price.season === 'high' ? 'text-red-600' :
          'text-purple-600'
        }`}>
          {price.season === 'low' && 'Neben'}
          {price.season === 'mid' && 'Zwischen'}
          {price.season === 'high' && 'Haupt'}
          {price.season === 'holiday' && 'Ferien'}
        </span>
      </div>
    );
  };

  // Generate array of months to display
  const months = Array.from(
    { length: isMobile ? 1 : 2 },
    (_, i) => addMonths(selectedMonth, i)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Price Type Selector */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          onClick={() => setShowRoomSurcharge(false)}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors ${
            !showRoomSurcharge
              ? 'bg-accent text-secondary'
              : 'bg-primary/5 hover:bg-primary/10'
          }`}
        >
          Hauptwohnung
        </button>
        <button
          onClick={() => setShowRoomSurcharge(true)}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors ${
            showRoomSurcharge
              ? 'bg-accent text-secondary'
              : 'bg-primary/5 hover:bg-primary/10'
          }`}
        >
          Mit Nebenzimmer
        </button>
      </div>

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
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                       rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 md:gap-8`}>
          {months.map((month) => (
            <div key={month.toISOString()}>
              <h4 className="text-center font-medium mb-4">
                {format(month, 'MMMM yyyy', { locale: de })}
              </h4>
              <DayPicker
                mode="single"
                locale={de}
                month={month}
                components={{
                  DayContent: ({ date }) => getDayContent(date),
                }}
                modifiers={{
                  booked: [],
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
                  },
                  day: { 
                    margin: '1px', 
                    color: '#1a2e35',
                    transition: 'all 0.2s ease-in-out',
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
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-sm">Nebensaison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span className="text-sm">Zwischensaison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-sm">Hauptsaison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          <span className="text-sm">Feiertage</span>
        </div>
      </div>
    </div>
  );
};
