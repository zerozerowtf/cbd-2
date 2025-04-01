import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import { addYears, format, addMonths, startOfMonth } from 'date-fns';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface PricingPeriodFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    start_date: string;
    end_date: string;
    season_type: 'low' | 'mid' | 'high' | 'holiday';
    base_price: number;
    room_surcharge: number;
    min_nights: number;
    max_nights: number;
    description?: string;
  };
  copyMode?: boolean;
}

export const PricingPeriodForm: React.FC<PricingPeriodFormProps> = ({
  onClose,
  onSuccess,
  initialData,
  copyMode = false,
}) => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: initialData ? new Date(initialData.start_date) : undefined,
    to: initialData ? new Date(initialData.end_date) : undefined,
  });

  const [formData, setFormData] = useState({
    season_type: initialData?.season_type || 'low',
    base_price: initialData?.base_price || 110,
    room_surcharge: initialData?.room_surcharge || 30,
    min_nights: initialData?.min_nights || 3,
    max_nights: initialData?.max_nights || 28,
    description: initialData?.description || '',
  });

  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange.from || !dateRange.to) {
      setError('Bitte wählen Sie einen Zeitraum aus');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (formData.base_price <= 0) {
        throw new Error('Der Grundpreis muss größer als 0 sein');
      }

      if (formData.min_nights < 3 || formData.min_nights > formData.max_nights) {
        throw new Error('Die Mindestanzahl der Nächte muss zwischen 3 und der Maximalanzahl liegen');
      }

      if (formData.max_nights > 28) {
        throw new Error('Die Maximalanzahl der Nächte darf 28 nicht überschreiten');
      }

      const periodData = {
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
        season_type: formData.season_type,
        base_price: formData.base_price,
        room_surcharge: formData.room_surcharge,
        min_nights: formData.min_nights,
        max_nights: formData.max_nights,
        description: formData.description || null,
      };

      console.log('Saving pricing period:', periodData);

      if (initialData && !copyMode) {
        // Update existing period
        const { data, error: updateError } = await supabase
          .from('pricing')
          .update(periodData)
          .eq('id', initialData.id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            throw new Error('Der Preiszeitraum wurde nicht gefunden');
          }
          throw updateError;
        }

        if (!data) {
          throw new Error('Der Preiszeitraum konnte nicht aktualisiert werden');
        }

        console.log('Successfully updated pricing period:', data);
      } else {
        // Create new period
        const { data, error: insertError } = await supabase
          .from('pricing')
          .insert([periodData])
          .select()
          .single();

        if (insertError) {
          if (insertError.code === 'PGRST116') {
            throw new Error('Der Preiszeitraum konnte nicht erstellt werden');
          }
          throw insertError;
        }

        if (!data) {
          throw new Error('Der Preiszeitraum konnte nicht erstellt werden');
        }

        console.log('Successfully created pricing period:', data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving pricing period:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern des Preiszeitraums');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Zeitraum
        </label>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => addMonths(prev, -1))}
            className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-4 text-lg font-medium">
            <span>{format(selectedMonth, 'MMMM yyyy', { locale: de })}</span>
            <span>|</span>
            <span>{format(addMonths(selectedMonth, 1), 'MMMM yyyy', { locale: de })}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
            className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-8`}>
          {[selectedMonth, addMonths(selectedMonth, 1)].map((month) => (
            <DayPicker
              key={month.toISOString()}
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              locale={de}
              month={month}
              className="border rounded-lg p-4"
              disabled={[{ before: new Date() }]}
              toDate={addYears(new Date(), 2)}
              styles={{
                caption: { display: 'none' },
                head_cell: { color: '#a59d8f' },
                cell: { fontSize: '16px' },
                day: { margin: '2px', color: '#1a2e35' },
                nav_button_previous: { display: 'none' },
                nav_button_next: { display: 'none' },
              }}
              modifiersStyles={{
                selected: {
                  backgroundColor: '#a59d8f',
                  color: '#f5f3ee',
                },
                today: {
                  color: '#1a2e35',
                  fontWeight: 'bold',
                },
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Saisontyp
          </label>
          <select
            value={formData.season_type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              season_type: e.target.value as 'low' | 'mid' | 'high' | 'holiday',
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="low">Nebensaison</option>
            <option value="mid">Zwischensaison</option>
            <option value="high">Hauptsaison</option>
            <option value="holiday">Feiertage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Beschreibung (optional)
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            placeholder="z.B. Nebensaison Winter"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Grundpreis Hauptwohnung (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              base_price: parseFloat(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Aufpreis Nebenzimmer (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.room_surcharge}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              room_surcharge: parseFloat(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mindestaufenthalt (Nächte)
          </label>
          <input
            type="number"
            min="3"
            max="28"
            value={formData.min_nights}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              min_nights: parseInt(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Maximalaufenthalt (Nächte)
          </label>
          <input
            type="number"
            min="3"
            max="28"
            value={formData.max_nights}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              max_nights: parseInt(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-primary/60 
                   hover:text-primary transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent text-secondary px-4 py-2 rounded-lg 
                   hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Wird gespeichert...' : 
           initialData ? (copyMode ? 'Kopieren' : 'Speichern') : 'Erstellen'}
        </button>
      </div>
    </form>
  );
};
