import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Calendar,
  Users,
  Clock,
  Ban,
  AlertCircle,
  Plus,
  Home,
  DoorOpen,
  Filter,
} from 'lucide-react';
import { Section } from '../../components/Section';
import { ScrollReveal } from '../../components/ScrollReveal';
import { Dialog } from '../../components/Dialog';
import { AdminBookingCalendar } from '../../components/admin/bookings/BookingCalendar';
import { BookingForm } from '../../components/admin/bookings/BookingForm';
import { supabase } from '../../lib/supabase';
import type { Booking } from '../../lib/bookings';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['pending']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Basic query
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      // Add status filter if needed
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Fehler beim Laden der Buchungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as Booking['status'] }
          : booking
      ));
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Fehler beim Aktualisieren des Status');
    }
  };

  const handlePaymentStatusUpdate = async (
    bookingId: string, 
    field: 'deposit_paid' | 'remaining_paid',
    value: boolean
  ) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ [field]: value })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, [field]: value }
          : booking
      ));
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Fehler beim Aktualisieren des Zahlungsstatus');
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedBooking(null);
    setShowForm(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(null);
    setShowForm(true);
  };

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  // Group bookings by status
  const groupedBookings = [
    {
      title: 'Neue Anfragen',
      bookings: bookings.filter(b => b.status === 'pending'),
    },
    {
      title: 'Bestätigte Buchungen',
      bookings: bookings.filter(b => b.status === 'confirmed'),
    },
    {
      title: 'Stornierte Buchungen',
      bookings: bookings.filter(b => b.status === 'cancelled'),
    },
  ];

  return (
    <div className="py-4">
      <Section variant="secondary">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-display">Buchungen</h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Filter */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white pl-10 pr-4 py-2 rounded-lg 
                             border border-gray-300 focus:border-accent focus:ring 
                             focus:ring-accent/20 text-sm"
                  >
                    <option value="all">Alle Buchungen</option>
                    <option value="pending">Anfragen</option>
                    <option value="confirmed">Bestätigte</option>
                    <option value="cancelled">Stornierte</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                </div>

                {/* New Booking Button */}
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setSelectedDate(null);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-accent text-secondary 
                           px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors 
                           whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  <span>Neue Buchung</span>
                </button>
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
              <h2 className="text-xl font-display mb-6">Kalenderübersicht</h2>
              <AdminBookingCalendar
                onDateClick={handleDateClick}
                onBookingClick={handleBookingClick}
              />
            </div>
          </ScrollReveal>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent 
                           rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-primary/60">
              Keine Buchungen gefunden
            </div>
          ) : (
            <div className="space-y-8">
              {groupedBookings.map((group) => (
                <ScrollReveal key={group.title}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between p-6 
                               hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          group.title.includes('Neue') ? 'bg-amber-100 text-amber-800' :
                          group.title.includes('Bestätigte') ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {group.title.includes('Neue') ? <Clock className="w-6 h-6" /> :
                           group.title.includes('Bestätigte') ? <Calendar className="w-6 h-6" /> :
                           <Ban className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{group.title}</h3>
                          <p className="text-primary/60">
                            {group.bookings.length} Buchung{group.bookings.length !== 1 ? 'en' : ''}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Group Content */}
                    {expandedGroups.includes(group.title) && (
                      <div className="border-t border-gray-200">
                        {group.bookings.map((booking) => (
                          <div 
                            key={booking.id}
                            className="p-6 border-b border-gray-200 last:border-b-0 
                                     hover:bg-gray-50 transition-colors"
                          >
                            {/* Booking Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Calendar className="w-6 h-6 text-accent" />
                                <div>
                                  <h3 className="font-medium">
                                    {format(new Date(booking.start_date), 'dd. MMMM yyyy', { locale: de })}
                                    {' - '}
                                    {format(new Date(booking.end_date), 'dd. MMMM yyyy', { locale: de })}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 text-sm text-primary/60">
                                      <Home className="w-4 h-4" />
                                      Hauptwohnung
                                      {booking.room_surcharge > 0 && (
                                        <>
                                          <span className="mx-1">+</span>
                                          <DoorOpen className="w-4 h-4" />
                                          Nebenzimmer
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Guest Information */}
                            <div className="mt-4">
                              <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary/60" />
                                <span>
                                  {booking.first_name} {booking.last_name}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary/60" />
                                <span>
                                  {booking.num_adults} Erwachsene
                                  {booking.num_children > 0 && 
                                    `, ${booking.num_children} Kinder`}
                                </span>
                              </div>
                            </div>

                            {/* Edit Button */}
                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => handleBookingClick(booking)}
                                className="text-accent hover:text-primary transition-colors"
                              >
                                Buchung bearbeiten
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Booking Form Dialog */}
      <Dialog
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedBooking(null);
          setSelectedDate(null);
        }}
        title={selectedBooking ? 'Buchung bearbeiten' : 'Neue Buchung'}
        size="2xl"
      >
        <BookingForm
          onClose={() => {
            setShowForm(false);
            setSelectedBooking(null);
            setSelectedDate(null);
          }}
          onSuccess={fetchBookings}
          initialData={selectedBooking || undefined}
          initialDate={selectedDate || undefined}
        />
      </Dialog>
    </div>
  );
};
