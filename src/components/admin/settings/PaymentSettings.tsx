import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PaymentSettings {
  id: string;
  deposit_percentage: number;
  deposit_due_days: number;
  remaining_due_days: number;
  bank_holder: string;
  bank_iban: string;
  bank_bic: string;
  is_active: boolean;
}

export const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Fehler beim Laden der Zahlungseinstellungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setError(null);

    try {
      // Validate settings
      if (settings.deposit_percentage < 0 || settings.deposit_percentage > 100) {
        throw new Error('Der Anzahlungsprozentsatz muss zwischen 0 und 100 liegen');
      }

      if (settings.deposit_due_days < 1) {
        throw new Error('Die Zahlungsfrist für die Anzahlung muss mindestens 1 Tag betragen');
      }

      if (settings.remaining_due_days < 1) {
        throw new Error('Die Zahlungsfrist für die Restzahlung muss mindestens 1 Tag betragen');
      }

      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          ...settings,
          is_active: true,
        });

      if (error) throw error;

      await fetchSettings();
    } catch (err) {
      console.error('Error saving payment settings:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Einstellungen');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Deposit Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Anzahlung</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Prozentsatz
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={settings?.deposit_percentage || 50}
                onChange={(e) => setSettings(prev => prev ? ({
                  ...prev,
                  deposit_percentage: parseInt(e.target.value),
                }) : null)}
                className="w-full pr-8 rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60">
                %
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Zahlungsfrist
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={settings?.deposit_due_days || 7}
                onChange={(e) => setSettings(prev => prev ? ({
                  ...prev,
                  deposit_due_days: parseInt(e.target.value),
                }) : null)}
                className="w-full pr-12 rounded-lg border-gray-300 focus:border-accent 
                         focus:ring focus:ring-accent/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60">
                Tage
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Payment Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Restzahlung</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Tage vor Anreise
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={settings?.remaining_due_days || 30}
              onChange={(e) => setSettings(prev => prev ? ({
                ...prev,
                remaining_due_days: parseInt(e.target.value),
              }) : null)}
              className="w-full pr-12 rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60">
              Tage
            </span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Bankverbindung</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Kontoinhaber
            </label>
            <input
              type="text"
              value={settings?.bank_holder || ''}
              onChange={(e) => setSettings(prev => prev ? ({
                ...prev,
                bank_holder: e.target.value,
              }) : null)}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={settings?.bank_iban || ''}
              onChange={(e) => setSettings(prev => prev ? ({
                ...prev,
                bank_iban: e.target.value,
              }) : null)}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              BIC
            </label>
            <input
              type="text"
              value={settings?.bank_bic || ''}
              onChange={(e) => setSettings(prev => prev ? ({
                ...prev,
                bank_bic: e.target.value,
              }) : null)}
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                   rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Wird gespeichert...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Speichern</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
