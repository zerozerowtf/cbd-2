import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FeeFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: Record<string, string>;
    type: 'mandatory' | 'optional';
    amount: number;
    calculation_type: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
    payment_location: 'online' | 'on_site';
    is_active: boolean;
  };
}

export const FeeForm: React.FC<FeeFormProps> = ({
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || {
      de: '',
      en: '',
      fr: '',
      it: '',
    },
    type: initialData?.type || 'optional',
    amount: initialData?.amount || 0,
    calculation_type: initialData?.calculation_type || 'per_stay',
    payment_location: initialData?.payment_location || 'online',
    is_active: initialData?.is_active ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.name.de || !formData.name.en || !formData.name.fr || !formData.name.it) {
        throw new Error('Bitte füllen Sie alle Sprachversionen des Namens aus');
      }

      if (formData.amount < 0) {
        throw new Error('Der Betrag muss größer oder gleich 0 sein');
      }

      // Log the data being sent
      console.log('Saving fee data:', {
        ...formData,
        id: initialData?.id,
      });

      if (initialData) {
        // Update existing fee
        const { error: updateError } = await supabase
          .from('pricing_fees')
          .update({
            name: formData.name,
            type: formData.type,
            amount: formData.amount,
            calculation_type: formData.calculation_type,
            payment_location: formData.payment_location,
            is_active: formData.is_active,
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        console.log('Updated fee successfully');
      } else {
        // Create new fee
        const { error: insertError } = await supabase
          .from('pricing_fees')
          .insert([{
            name: formData.name,
            type: formData.type,
            amount: formData.amount,
            calculation_type: formData.calculation_type,
            payment_location: formData.payment_location,
            is_active: formData.is_active,
          }]);

        if (insertError) throw insertError;
        console.log('Created fee successfully');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving fee:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Gebühr');
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

      <div className="grid grid-cols-2 gap-4">
        {/* Name translations */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Name (Deutsch)
            </label>
            <input
              type="text"
              value={formData.name.de}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: { ...prev.name, de: e.target.value },
              }))}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Name (English)
            </label>
            <input
              type="text"
              value={formData.name.en}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: { ...prev.name, en: e.target.value },
              }))}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Name (Français)
            </label>
            <input
              type="text"
              value={formData.name.fr}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: { ...prev.name, fr: e.target.value },
              }))}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Name (Italiano)
            </label>
            <input
              type="text"
              value={formData.name.it}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: { ...prev.name, it: e.target.value },
              }))}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Typ
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              type: e.target.value as 'mandatory' | 'optional',
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="mandatory">Verpflichtend</option>
            <option value="optional">Optional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Berechnungsart
          </label>
          <select
            value={formData.calculation_type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              calculation_type: e.target.value as 'per_stay' | 'per_night' | 'per_person' | 'per_person_night',
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="per_stay">Pro Aufenthalt</option>
            <option value="per_night">Pro Nacht</option>
            <option value="per_person">Pro Person</option>
            <option value="per_person_night">Pro Person/Nacht</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Betrag (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              amount: parseFloat(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Zahlungsort
          </label>
          <select
            value={formData.payment_location}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              payment_location: e.target.value as 'online' | 'on_site',
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="online">Online vorab</option>
            <option value="on_site">Vor Ort</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                is_active: e.target.checked,
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                         peer-focus:ring-accent/20 rounded-full peer 
                         peer-checked:after:translate-x-full peer-checked:after:border-white 
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                         after:bg-white after:border-gray-300 after:border after:rounded-full 
                         after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
            <span className="ml-3 text-sm font-medium">Aktiv</span>
          </label>
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
          className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                   rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Wird gespeichert...</span>
            </>
          ) : (
            <span>{initialData ? 'Speichern' : 'Erstellen'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
