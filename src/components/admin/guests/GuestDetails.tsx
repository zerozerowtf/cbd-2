import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Users, 
  Mail, 
  Phone, 
  Globe2, 
  Calendar,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  MapPin,
  Hash,
  Edit2
} from 'lucide-react';
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
  address_line_1?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  customer_number?: number;
}

interface Booking {
  id: string;
  reference: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
  deposit_paid: boolean;
  remaining_paid: boolean;
  created_at: string;
  special_requests?: string;
  num_adults: number;
  num_children: number;
  room_surcharge: number;
}

const languageLabels = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const GuestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGuestData();
    }
  }, [id]);

  const fetchGuestData = async () => {
    try {
      // Fetch guest and their bookings in parallel
      const [guestRes, bookingsRes] = await Promise.all([
        supabase
          .from('guests')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('bookings')
          .select('*')
          .eq('guest_id', id)
          .order('created_at', { ascending: false })
      ]);

      if (guestRes.error) throw guestRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      setGuest(guestRes.data);
      setBookings(bookingsRes.data || []);
    } catch (err) {
      console.error('Error fetching guest data:', err);
      setError('Fehler beim Laden der Gästedaten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    await fetchGuestData();
    setShowEditForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                     rounded-full animate-spin" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-primary/60">Gast nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/guests"
              className="p-2 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-display">
                {guest.first_name} {guest.last_name}
              </h1>
              {guest.customer_number && (
                <div className="flex items-center gap-1 text-sm text-primary/60 mt-1">
                  <Hash className="w-4 h-4" />
                  Kundennummer: {guest.customer_number}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent 
                       text-secondary hover:bg-accent/90 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
              <span>Bearbeiten</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Guest Details */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Kontaktdaten</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary/60" />
                        <a 
                          href={`mailto:${guest.email}`}
                          className="hover:text-accent transition-colors"
                        >
                          {guest.email}
                        </a>
                      </div>
                      {guest.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-primary/60" />
                          <a 
                            href={`tel:${guest.phone}`}
                            className="hover:text-accent transition-colors"
                          >
                            {guest.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {(guest.address_line_1 || guest.city || guest.zip_code || guest.country) && (
                    <div>
                      <h3 className="font-medium mb-2">Adresse</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-primary/60 flex-shrink-0 mt-0.5" />
                          <div>
                            {guest.address_line_1 && (
                              <div>{guest.address_line_1}</div>
                            )}
                            {(guest.zip_code || guest.city) && (
                              <div>
                                {guest.zip_code} {guest.city}
                              </div>
                            )}
                            {guest.country && (
                              <div>{guest.country}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-2">Präferenzen</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-primary/60" />
                        <span>
                          {languageLabels[guest.preferred_language as keyof typeof languageLabels]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {guest.marketing_consent ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span>
                          {guest.marketing_consent ? 'Marketing erlaubt' : 'Kein Marketing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Statistiken</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary/60" />
                      <span>
                        Kunde seit {format(new Date(guest.created_at), 'dd. MMMM yyyy', { locale: de })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary/60" />
                      <span>{bookings.length} Buchungen insgesamt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Booking History */}
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-display mb-6">Buchungsverlauf</h2>

              {bookings.length === 0 ? (
                <p className="text-primary/60 text-center py-4">
                  Noch keine Buchungen vorhanden
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-secondary rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          {booking.status === 'pending' ? (
                            <Clock className="w-6 h-6 text-amber-600" />
                          ) : booking.status === 'confirmed' ? (
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <Ban className="w-6 h-6 text-red-600" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{booking.reference}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                booking.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : booking.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {booking.status === 'pending' ? 'Angefragt' :
                                 booking.status === 'confirmed' ? 'Bestätigt' : 'Storniert'}
                              </span>
                            </div>
                            <div className="text-sm text-primary/60 mt-1">
                              {format(new Date(booking.start_date), 'dd.MM.yyyy', { locale: de })}
                              {' – '}
                              {format(new Date(booking.end_date), 'dd.MM.yyyy', { locale: de })}
                              <span className="mx-2">•</span>
                              {booking.num_adults} Erwachsene
                              {booking.num_children > 0 && `, ${booking.num_children} Kinder`}
                              {booking.room_surcharge > 0 && (
                                <span className="mx-2">•</span>
                              )}
                              {booking.room_surcharge > 0 && 'Mit Nebenzimmer'}
                              {booking.special_requests && (
                                <>
                                  <span className="mx-2">•</span>
                                  {booking.special_requests}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:ml-auto">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{booking.total_price} €</span>
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full ${
                                booking.deposit_paid && booking.remaining_paid
                                  ? 'bg-emerald-500'
                                  : booking.deposit_paid
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`} />
                              <span className="text-primary/60">
                                {booking.deposit_paid && booking.remaining_paid
                                  ? 'Vollständig bezahlt'
                                  : booking.deposit_paid
                                  ? 'Anzahlung erfolgt'
                                  : 'Nicht bezahlt'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <Dialog
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Gast bearbeiten"
        size="xl"
      >
        <GuestForm
          initialData={guest}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleFormSuccess}
        />
      </Dialog>
    </div>
  );
};
