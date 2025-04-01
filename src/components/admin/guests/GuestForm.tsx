import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GuestFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    preferred_language: string;
    marketing_consent: boolean;
    address_line_1?: string;
    city?: string;
    zip_code?: string;
    country?: string;
  };
}

export const GuestForm: React.FC<GuestFormProps> = ({
  onClose,
  onSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    preferred_language: initialData?.preferred_language || 'de',
    marketing_consent: initialData?.marketing_consent || false,
    address_line_1: initialData?.address_line_1|| '',
    city: initialData?.city || '',
    zip_code: initialData?.zip_code || '',
    country: initialData?.country || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (initialData) {
        // Update existing guest
        const { error: guestError } = await supabase
          .from('guests')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone || null,
            preferred_language: formData.preferred_language,
            marketing_consent: formData.marketing_consent,
            address_line_1: formData.address_line_1 || null,
            city: formData.city || null,
            zip_code: formData.zip_code || null,
            country: formData.country || null,
          })
          .eq('id', initialData.id);

        if (guestError) throw guestError;
      } else {
        // Create new guest
        const { error } = await supabase
          .from('guests')
          .insert([{
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone || null,
            preferred_language: formData.preferred_language,
            marketing_consent: formData.marketing_consent,
            address_line_1: formData.address_line_1 || null,
            city: formData.city || null,
            zip_code: formData.zip_code || null,
            country: formData.country || null,
          }]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving guest:', err);
      setError('Fehler beim Speichern der Gästeinformationen');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Vorname
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              first_name: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nachname
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              last_name: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            E-Mail
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Telefon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              phone: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Sprache
          </label>
          <select
            value={formData.preferred_language}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              preferred_language: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.marketing_consent}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                marketing_consent: e.target.checked,
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                         peer-focus:ring-accent/20 rounded-full peer 
                         peer-checked:after:translate-x-full peer-checked:after:border-white 
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                         after:bg-white after:border-gray-300 after:border after:rounded-full 
                         after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
            <span className="ml-3 text-sm font-medium">Marketing erlaubt</span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2">
            Adresse
          </label>
          <input
            type="text"
            value={formData.address_line_1}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              address_line_1: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            placeholder="Straße und Hausnummer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            PLZ
          </label>
          <input
            type="text"
            value={formData.zip_code}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              zip_code: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Ort
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              city: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Land
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              country: e.target.value,
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
          {isLoading ? 'Wird gespeichert...' : initialData ? 'Speichern' : 'Erstellen'}
        </button>
      </div>
    </form>
  );
};
