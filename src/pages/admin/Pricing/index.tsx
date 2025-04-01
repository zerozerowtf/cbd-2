import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Euro, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy,
  Percent,
  Receipt,
  AlertCircle,
  Globe2
} from 'lucide-react';
import { Section } from '../../../components/Section';
import { ScrollReveal } from '../../../components/ScrollReveal';
import { Dialog } from '../../../components/Dialog';
import { PricingCalendar } from '../../../components/admin/pricing/PricingCalendar';
import { PricingPeriodForm } from '../../../components/admin/pricing/PricingPeriodForm';
import { DiscountForm } from '../../../components/admin/pricing/DiscountForm';
import { FeeForm } from '../../../components/admin/pricing/FeeForm';
import { supabase } from '../../../lib/supabase';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface PricingPeriod {
  id: string;
  start_date: string;
  end_date: string;
  season_type: 'low' | 'mid' | 'high' | 'holiday';
  base_price: number;
  room_surcharge: number;
  min_nights: number;
  max_nights: number;
  description?: string;
}

interface Discount {
  id: string;
  type: 'long_stay' | 'early_bird' | 'last_minute';
  min_value: number;
  max_value?: number;
  discount_percentage: number;
  is_active: boolean;
}

interface Fee {
  id: string;
  name: Record<string, string>;
  type: 'mandatory' | 'optional';
  amount: number;
  calculation_type: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
  is_active: boolean;
  payment_location: 'online' | 'on_site';
}

type DialogType = {
  type: 'period' | 'discount' | 'fee';
  isOpen: boolean;
  data?: PricingPeriod | Discount | Fee;
  copyMode?: boolean;
};

export const Pricing = () => {
  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogType>({
    type: 'period',
    isOpen: false,
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [periodsRes, discountsRes, feesRes] = await Promise.all([
        supabase
          .from('pricing')
          .select('*')
          .order('start_date', { ascending: true }),
        supabase
          .from('pricing_discounts')
          .select('*')
          .order('type', { ascending: true }),
        supabase
          .from('pricing_fees')
          .select('*')
          .order('type', { ascending: true }),
      ]);

      if (periodsRes.error) throw periodsRes.error;
      if (discountsRes.error) throw discountsRes.error;
      if (feesRes.error) throw feesRes.error;

      setPeriods(periodsRes.data || []);
      setDiscounts(discountsRes.data || []);
      setFees(feesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: 'period' | 'discount' | 'fee', id: string) => {
    if (!window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      return;
    }

    try {
      const table = type === 'period' ? 'pricing' :
                    type === 'discount' ? 'pricing_discounts' :
                    'pricing_fees';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Fehler beim Löschen des Eintrags');
    }
  };

  const handleCopyPeriod = (period: PricingPeriod) => {
    setDialog({
      type: 'period',
      isOpen: true,
      data: period,
      copyMode: true,
    });
  };

  return (
    <div className="py-4">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-display">Preise & Rabatte</h1>
              </div>
            </div>
          </ScrollReveal>

          {error && (
            <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Calendar View */}
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-xl font-display mb-6">Preiskalender</h2>
              <PricingCalendar />
            </div>
          </ScrollReveal>

          {/* Pricing Periods */}
          <ScrollReveal>
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <h2 className="text-xl font-display">Preiszeiträume</h2>
                <button
                  onClick={() => setDialog({ type: 'period', isOpen: true })}
                  className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                           rounded-lg hover:bg-accent/90 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neuer Preiszeitraum</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                               rounded-full animate-spin" />
                </div>
              ) : periods.length === 0 ? (
                <div className="text-center py-12 text-primary/60">
                  Keine Preiszeiträume vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {periods.map((period) => (
                    <ScrollReveal key={period.id}>
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-accent/10 p-3 rounded-lg">
                                <Euro className="w-6 h-6 text-accent" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {format(new Date(period.start_date), 'dd. MMMM yyyy', { locale: de })}
                                  {' - '}
                                  {format(new Date(period.end_date), 'dd. MMMM yyyy', { locale: de })}
                                </h3>
                                <span className="text-sm text-primary/60">
                                  {period.description || period.season_type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:ml-auto">
                              <button
                                onClick={() => handleCopyPeriod(period)}
                                className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                                title="Für nächstes Jahr kopieren"
                              >
                                <Copy className="w-5 h-5 text-primary/60" />
                              </button>
                              <button
                                onClick={() => setDialog({ type: 'period', isOpen: true, data: period })}
                                className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-5 h-5 text-primary/60" />
                              </button>
                              <button
                                onClick={() => handleDelete('period', period.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <div>
                              <span className="text-sm text-primary/60">Grundpreis</span>
                              <p className="font-medium">{period.base_price} € / Nacht</p>
                            </div>
                            <div>
                              <span className="text-sm text-primary/60">Min. Nächte</span>
                              <p className="font-medium">{period.min_nights}</p>
                            </div>
                            <div>
                              <span className="text-sm text-primary/60">Max. Nächte</span>
                              <p className="font-medium">{period.max_nights}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Discounts */}
          <ScrollReveal>
            <div className="mb-12">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <h2 className="text-xl font-display">Rabatte</h2>
                <button
                  onClick={() => setDialog({ type: 'discount', isOpen: true })}
                  className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                           rounded-lg hover:bg-accent/90 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neuer Rabatt</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                               rounded-full animate-spin" />
                </div>
              ) : discounts.length === 0 ? (
                <div className="text-center py-12 text-primary/60">
                  Keine Rabatte vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {discounts.map((discount) => (
                    <ScrollReveal key={discount.id}>
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-accent/10 p-3 rounded-lg">
                                <Percent className="w-6 h-6 text-accent" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {discount.type === 'long_stay' ? 'Langzeitrabatt' :
                                   discount.type === 'early_bird' ? 'Frühbucher' : 'Last Minute'}
                                </h3>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                                               ${discount.is_active ? 'bg-emerald-100 text-emerald-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                  {discount.is_active ? 'Aktiv' : 'Inaktiv'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:ml-auto">
                              <button
                                onClick={() => setDialog({ type: 'discount', isOpen: true, data: discount })}
                                className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-5 h-5 text-primary/60" />
                              </button>
                              <button
                                onClick={() => handleDelete('discount', discount.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <div>
                              <span className="text-sm text-primary/60">
                                {discount.type === 'long_stay' ? 'Aufenthaltsdauer' : 'Vorlaufzeit'}
                              </span>
                              <p className="font-medium">
                                {discount.min_value}
                                {discount.max_value ? ` - ${discount.max_value}` : '+'} 
                                {discount.type === 'long_stay' ? ' Nächte' : ' Tage'}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-primary/60">Rabatt</span>
                              <p className="font-medium">{discount.discount_percentage}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Fees */}
          <ScrollReveal>
            <div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <h2 className="text-xl font-display">Gebühren</h2>
                <button
                  onClick={() => setDialog({ type: 'fee', isOpen: true })}
                  className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                           rounded-lg hover:bg-accent/90 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neue Gebühr</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                               rounded-full animate-spin" />
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-12 text-primary/60">
                  Keine Gebühren vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <ScrollReveal key={fee.id}>
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-accent/10 p-3 rounded-lg">
                                <Receipt className="w-6 h-6 text-accent" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{fee.name.de}</h3>
                                  <Globe2 className="w-4 h-4 text-primary/40" />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                                                 ${fee.type === 'mandatory' ? 'bg-amber-100 text-amber-800' :
                                                                            'bg-blue-100 text-blue-800'}`}>
                                    {fee.type === 'mandatory' ? 'Verpflichtend' : 'Optional'}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                                                 ${fee.is_active ? 'bg-emerald-100 text-emerald-800' :
                                                                  'bg-gray-100 text-gray-800'}`}>
                                    {fee.is_active ? 'Aktiv' : 'Inaktiv'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:ml-auto">
                              <button
                                onClick={() => setDialog({ type: 'fee', isOpen: true, data: fee })}
                                className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-5 h-5 text-primary/60" />
                              </button>
                              <button
                                onClick={() => handleDelete('fee', fee.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <div>
                              <span className="text-sm text-primary/60">Betrag</span>
                              <p className="font-medium">{fee.amount} €</p>
                            </div>
                            <div>
                              <span className="text-sm text-primary/60">Berechnung</span>
                              <p className="font-medium">
                                {fee.calculation_type === 'per_stay' ? 'Pro Aufenthalt' :
                                 fee.calculation_type === 'per_night' ? 'Pro Nacht' :
                                 fee.calculation_type === 'per_person' ? 'Pro Person' :
                                 'Pro Person/Nacht'}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-primary/60">Zahlung</span>
                              <p className="font-medium">
                                {fee.payment_location === 'online' ? 'Online vorab' : 'Vor Ort'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </Section>

      {/* Dialogs */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={
          dialog.type === 'period' ? (dialog.data ? 'Preiszeitraum bearbeiten' : 'Neuer Preiszeitraum') :
          dialog.type === 'discount' ? (dialog.data ? 'Rabatt bearbeiten' : 'Neuer Rabatt') :
          dialog.data ? 'Gebühr bearbeiten' : 'Neue Gebühr'
        }
        size={dialog.type === 'fee' ? 'xl' : 'lg'}
      >
        {dialog.type === 'period' && (
          <PricingPeriodForm
            onClose={() => setDialog({ ...dialog, isOpen: false })}
            onSuccess={fetchData}
            initialData={dialog.data as PricingPeriod}
            copyMode={dialog.copyMode}
          />
        )}
        {dialog.type === 'discount' && (
          <DiscountForm
            onClose={() => setDialog({ ...dialog, isOpen: false })}
            onSuccess={fetchData}
            initialData={dialog.data as Discount}
          />
        )}
        {dialog.type === 'fee' && (
          <FeeForm
            onClose={() => setDialog({ ...dialog, isOpen: false })}
            onSuccess={fetchData}
            initialData={dialog.data as Fee}
          />
        )}
      </Dialog>
    </div>
  );
};
