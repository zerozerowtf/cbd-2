import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TemplateFormProps {
  initialData?: {
    id: string;
    name: string;
    type: string;
    subject_de: string;
    subject_en: string;
    subject_fr: string;
    subject_it: string;
    body_de: string;
    body_en: string;
    body_fr: string;
    body_it: string;
    is_active: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'info',
    subject_de: initialData?.subject_de || '',
    subject_en: initialData?.subject_en || '',
    subject_fr: initialData?.subject_fr || '',
    subject_it: initialData?.subject_it || '',
    body_de: initialData?.body_de || '',
    body_en: initialData?.body_en || '',
    body_fr: initialData?.body_fr || '',
    body_it: initialData?.body_it || '',
    is_active: initialData?.is_active ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (initialData) {
        const { error } = await supabase
          .from('email_templates')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([formData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Fehler beim Speichern der Vorlage');
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
        <div>
          <label className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Typ
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              type: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
          >
            <option value="booking">Buchung</option>
            <option value="payment">Zahlung</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* German */}
      <div className="space-y-4">
        <h3 className="font-medium">Deutsch</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Betreff
          </label>
          <input
            type="text"
            value={formData.subject_de}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subject_de: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Inhalt
          </label>
          <textarea
            rows={6}
            value={formData.body_de}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              body_de: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20 font-mono"
            required
          />
        </div>
      </div>

      {/* English */}
      <div className="space-y-4">
        <h3 className="font-medium">English</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject_en}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subject_en: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Content
          </label>
          <textarea
            rows={6}
            value={formData.body_en}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              body_en: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20 font-mono"
            required
          />
        </div>
      </div>

      {/* French */}
      <div className="space-y-4">
        <h3 className="font-medium">Français</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Sujet
          </label>
          <input
            type="text"
            value={formData.subject_fr}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subject_fr: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Contenu
          </label>
          <textarea
            rows={6}
            value={formData.body_fr}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              body_fr: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20 font-mono"
            required
          />
        </div>
      </div>

      {/* Italian */}
      <div className="space-y-4">
        <h3 className="font-medium">Italiano</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Oggetto
          </label>
          <input
            type="text"
            value={formData.subject_it}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subject_it: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Contenuto
          </label>
          <textarea
            rows={6}
            value={formData.body_it}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              body_it: e.target.value,
            }))}
            className="w-full rounded-lg border-gray-300 focus:border-accent 
                     focus:ring focus:ring-accent/20 font-mono"
            required
          />
        </div>
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
