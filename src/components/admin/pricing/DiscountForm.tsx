import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DiscountFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    type: 'long_stay' | 'early_bird' | 'last_minute';
    min_value: number;
    max_value?: number;
    discount_percentage: number;
    is_active: boolean;
  };
}

export const DiscountForm: React.FC<DiscountFormProps> = ({
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'long_stay',
    min_value: initialData?.min_value || 7,
    max_value: initialData?.max_value || undefined,
    discount_percentage: initialData?.discount_percentage || 10,
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
      if (formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
        throw new Error('Der Rabatt muss zwischen 0 und 100% liegen');
      }

      if (formData.min_value < 0) {
        throw new Error('Der Mindestwert muss größer oder gleich 0 sein');
      }

      if (formData.max_value !== undefined && formData.max_value < formData.min_value) {
        throw new Error('Der Maximalwert muss größer als der Mindestwert sein');
      }

      // Log the data being sent
      console.log('Saving discount data:', {
        ...formData,
        id: initialData?.id,
      });

      if (initialData) {
        // Update existing discount
        const { error: updateError } = await supabase
          .from('pricing_discounts')
          .update({
            type: formData.type,
            min_value: formData.min_value,
            max_value: formData.max_value,
            discount_percentage: formData.discount_percentage,
            is_active: formData.is_active,
          })
          .eq('id', initialData.id);

        if (updateError) throw updateError;
        console.log('Updated discount successfully');
      } else {
        // Create new discount
        const { error: insertError } = await supabase
          .from('pricing_discounts')
          .insert([{
            type: formData.type,
            min_value: formData.min_value,
            max_value: formData.max_value,
            discount_percentage: formData.discount_percentage,
            is_active: formData.is_active,
          }]);

        if (insertError) throw insertError;
        console.log('Created discount successfully');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving discount:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern des Rabatts');
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
          Rabatttyp
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            type: e.target.value as 'long_stay' | 'early_bird' | 'last_minute',
          }))}
          className="w-full rounded-lg border-gray-300 focus:border-accent 
                   focus:ring focus:ring-accent/20"
        >
          <option value="long_stay">Langzeitrabatt</option>
          <option value="early_bird">Frühbucher</option>
          <option value="last_minute">Last Minute</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {formData.type === 'long_stay' ? 'Mindestaufenthalt (Nächte)' : 'Mindestvorlauf (Tage)'}
          </label>
          <input
            type="number"
            min="0"
            value={formData.min_value}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              min_value: parseInt(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {formData.type === 'long_stay' ? 'Maximalaufenthalt (Nächte)' : 'Maximalvorlauf (Tage)'}
          </label>
          <input
            type="number"
            min="0"
            value={formData.max_value || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              max_value: e.target.value ? parseInt(e.target.value) : undefined,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Rabatt (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.discount_percentage}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discount_percentage: parseFloat(e.target.value),
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
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
                         after:content-[''] after:absolute after: top-[2px] after:left-[2px] 
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
          className="bg-accent text-secondary px-4 py-2 rounded-lg 
                   hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Wird gespeichert...' : initialData ? 'Speichern' : 'Erstellen'}
        </button>
      </div>
    </form>
  );
};
