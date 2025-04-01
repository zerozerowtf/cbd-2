import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Users, 
  Mail, 
  Phone, 
  Globe2, 
  Calendar,
  Download,
  Search,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ScrollReveal } from '../../ScrollReveal';
import { Dialog } from '../../Dialog';
import { GuestForm } from './GuestForm';

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_language: string;
  marketing_consent: boolean;
  created_at: string;
  bookings?: {
    id: string;
    created_at: string;
    status: string;
  }[];
  bookings_count?: number;
  last_booking?: string;
}

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const GuestList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select(`
          *,
          bookings (
            id,
            created_at,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (guestsError) throw guestsError;

      // Process the data to include booking counts
      const processedGuests = guestsData?.map(guest => ({
        ...guest,
        bookings_count: guest.bookings?.length || 0,
        last_booking: guest.bookings?.length 
          ? guest.bookings.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].created_at
          : null
      }));

      setGuests(processedGuests || []);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Fehler beim Laden der Gästedaten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setSelectedGuest(null);
    setShowForm(false);
  };

  const handleFormSuccess = async () => {
    await fetchGuests();
    handleFormClose();
  };

  const exportGuestData = () => {
    // Check if there are guests to export
    if (!guests.length) {
      setError('Keine Gästedaten zum Exportieren vorhanden');
      return;
    }

    try {
      const csvData = guests.map(guest => ({
        'Vorname': guest.first_name,
        'Nachname': guest.last_name,
        'E-Mail': guest.email,
        'Telefon': guest.phone || '',
        'Sprache': languageLabels[guest.preferred_language as keyof typeof languageLabels] || 'Deutsch',
        'Marketing': guest.marketing_consent ? 'Ja' : 'Nein',
        'Buchungen': guest.bookings_count || 0,
        'Letzte Buchung': guest.last_booking ? format(new Date(guest.last_booking), 'dd.MM.yyyy', { locale: de }) : '',
        'Erstellt am': format(new Date(guest.created_at), 'dd.MM.yyyy', { locale: de })
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(';'),
        ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(';'))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `gaeste_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } catch (err) {
      console.error('Error exporting guest data:', err);
      setError('Fehler beim Exportieren der Gästedaten');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.first_name.toLowerCase().includes(searchLower) ||
      guest.last_name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display">Gäste</h1>
              <p className="text-primary/60 mt-1">
                {guests.length} Gäste insgesamt
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={exportGuestData}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                         bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Exportieren</span>
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 bg-accent text-secondary 
                         px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Gast hinzufügen</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gäste durchsuchen..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                       focus:border-accent focus:ring focus:ring-accent/20"
            />
          </div>

          {/* Guest List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Gäste gefunden
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGuests.map((guest) => (
                <ScrollReveal key={guest.id}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-accent/10 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {guest.first_name} {guest.last_name}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-primary/60 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {guest.email}
                              </div>
                              {guest.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {guest.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Globe2 className="w-4 h-4" />
                                {languageLabels[guest.preferred_language as keyof typeof languageLabels]}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:ml-auto">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">
                              {guest.bookings_count} Buchung{guest.bookings_count !== 1 ? 'en' : ''}
                            </span>
                            {guest.last_booking && (
                              <div className="flex items-center gap-1 text-sm text-primary/60">
                                <Calendar className="w-4 h-4" />
                                Letzte: {format(new Date(guest.last_booking), 'dd.MM.yyyy', { locale: de })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Link
                          to={`/admin/guests/${guest.id}`}
                          className="text-accent hover:text-primary transition-colors"
                        >
                          Details anzeigen
                        </Link>
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className="text-accent hover:text-primary transition-colors"
                        >
                          Bearbeiten
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guest Form Dialog */}
      <Dialog
        isOpen={showForm}
        onClose={handleFormClose}
        title={selectedGuest ? 'Gast bearbeiten' : 'Neuer Gast'}
        size="xl"
      >
        <GuestForm
          initialData={selectedGuest}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </Dialog>
    </div>
  );
};
