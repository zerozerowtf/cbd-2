import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, Ban, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Dialog } from '../../components/Dialog';
import { AdminBookingCalendar } from '../../components/admin/bookings/BookingCalendar';
import { supabase } from '../../lib/supabase';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export const BlockedDates = () => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState({
    dateRange: { from: undefined, to: undefined },
    reason: '',
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data);
    } catch (err) {
      setError('Fehler beim Laden der gesperrten Termine');
      console.error('Error fetching blocked dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate.dateRange.from || !newBlockedDate.dateRange.to) {
      setError('Bitte wählen Sie einen Zeitraum aus');
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          start_date: newBlockedDate.dateRange.from.toISOString().split('T')[0],
          end_date: newBlockedDate.dateRange.to.toISOString().split('T')[0],
          reason: newBlockedDate.reason.trim() || null,
        });

      if (error) throw error;

      await fetchBlockedDates();
      setShowAddForm(false);
      setNewBlockedDate({
        dateRange: { from: undefined, to: undefined },
        reason: '',
      });
    } catch (err) {
      setError('Fehler beim Speichern des gesperrten Zeitraums');
      console.error('Error adding blocked date:', err);
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBlockedDates();
    } catch (err) {
      setError('Fehler beim Löschen des gesperrten Zeitraums');
      console.error('Error deleting blocked date:', err);
    }
  };

  return (
    <div className="py-4">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-display">Gesperrte Termine</h1>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-accent text-secondary px-4 py-2 
                         rounded-lg hover:bg-accent/90 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Zeitraum sperren</span>
              </button>
            </div>
          </ScrollReveal>

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Calendar View */}
          <ScrollReveal>
            <div className="mb-12">
              <h2 className="text-xl font-display mb-6">Kalenderübersicht</h2>
              <AdminBookingCalendar
                onDateClick={(date) => {
                  setNewBlockedDate(prev => ({
                    ...prev,
                    dateRange: { from: date, to: undefined },
                  }));
                  setShowAddForm(true);
                }}
              />
            </div>
          </ScrollReveal>

          {/* Blocked Dates List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine gesperrten Zeiträume vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {blockedDates.map((blockedDate) => (
                <ScrollReveal key={blockedDate.id}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-red-100 p-3 rounded-lg">
                            <Ban className="w-6 h-6 text-red-800" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {format(new Date(blockedDate.start_date), 'dd. MMMM yyyy', { locale: de })}
                              {' - '}
                              {format(new Date(blockedDate.end_date), 'dd. MMMM yyyy', { locale: de })}
                            </h3>
                            {blockedDate.reason && (
                              <p className="text-primary/60 text-sm mt-1">
                                {blockedDate.reason}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteBlockedDate(blockedDate.id)}
                          className="sm:ml-auto p-2 rounded-lg text-red-600 hover:bg-red-50 
                                   transition-colors self-end sm:self-auto"
                          title="Zeitraum löschen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Add Form Dialog */}
      <Dialog
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Zeitraum sperren"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Zeitraum auswählen
            </label>
            <div className={`${isMobile ? '-mx-4' : ''}`}>
              <AdminBookingCalendar
                onDateClick={(date) => setNewBlockedDate(prev => ({
                  ...prev,
                  dateRange: { 
                    ...prev.dateRange,
                    from: !prev.dateRange.from ? date : prev.dateRange.from,
                    to: prev.dateRange.from && !prev.dateRange.to ? date : prev.dateRange.to,
                  },
                }))}
                showTwoMonths={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Grund (optional)
            </label>
            <input
              type="text"
              value={newBlockedDate.reason}
              onChange={(e) => setNewBlockedDate(prev => ({
                ...prev,
                reason: e.target.value,
              }))}
              placeholder="z.B. Renovierung, Eigenbedarf"
              className="w-full rounded-lg border-gray-300 focus:border-accent 
                       focus:ring focus:ring-accent/20"
            />
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : ''} justify-end gap-2`}>
            <button
              onClick={() => setShowAddForm(false)}
              className={`px-4 py-2 rounded-lg text-primary/60 
                       hover:text-primary transition-colors
                       ${isMobile ? 'order-2' : ''}`}
            >
              Abbrechen
            </button>
            <button
              onClick={handleAddBlockedDate}
              className={`bg-accent text-secondary px-4 py-2 rounded-lg 
                       hover:bg-accent/90 transition-colors
                       ${isMobile ? 'order-1' : ''}`}
            >
              Speichern
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
