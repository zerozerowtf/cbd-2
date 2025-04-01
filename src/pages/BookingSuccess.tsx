import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  DoorOpen,
  Euro,
  Clock,
  ArrowLeft,
  Mail,
  Home
} from 'lucide-react';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';
import type { Booking } from '../lib/bookings';

export const BookingSuccess = () => {
  const location = useLocation();
  const booking = location.state?.booking as Booking;

  // If no booking data is found, redirect back to booking page
  if (!location.state?.booking) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="min-h-screen py-24">
      <Section variant="secondary">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Success Message */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center 
                             justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-display mt-6 mb-2">
                  Vielen Dank für Ihre Buchung!
                </h1>
                <p className="text-primary/80">
                  Wir haben Ihre Buchungsanfrage erfolgreich erhalten.
                </p>
              </div>

              {/* Booking Details */}
              <div className="space-y-8 mb-12">
                {/* Reference and Status */}
                <div className="bg-accent/5 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                      <p className="text-sm text-primary/60 mb-1">Buchungsnummer</p>
                      <p className="font-mono text-lg">{booking.reference}</p>
                    </div>
                    <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                      Anfrage wird geprüft
                    </div>
                  </div>
                </div>

                {/* Stay Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Calendar className="w-5 h-5" />
                      <span>Check-in</span>
                    </div>
                    <p className="font-medium">
                      {new Date(booking.start_date).toLocaleDateString('de-DE')}
                      <span className="text-primary/60 ml-2">ab 15:00 Uhr</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Calendar className="w-5 h-5" />
                      <span>Check-out</span>
                    </div>
                    <p className="font-medium">
                      {new Date(booking.end_date).toLocaleDateString('de-DE')}
                      <span className="text-primary/60 ml-2">bis 11:00 Uhr</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Users className="w-5 h-5" />
                      <span>Gäste</span>
                    </div>
                    <p className="font-medium">
                      {booking.num_adults} Erwachsene
                      {booking.num_children > 0 && `, ${booking.num_children} Kinder`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Home className="w-5 h-5" />
                      <span>Unterkunft</span>
                    </div>
                    <p className="font-medium">
                      Hauptwohnung
                      {booking.room_surcharge > 0 && (
                        <>
                          <span className="mx-2">+</span>
                          <DoorOpen className="inline-block w-4 h-4 -mt-0.5" />
                          <span className="ml-1">Nebenzimmer</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Selected Services */}
                {booking.selected_services && booking.selected_services.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium mb-4">Gebuchte Zusatzleistungen</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {booking.selected_services.map((service) => (
                        <div 
                          key={service}
                          className="flex items-center gap-2 bg-accent/5 px-4 py-2 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium mb-4">Zahlungsdetails</h3>
                  <div className="space-y-6">
                    <div className="bg-accent/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-primary/60">Gesamtpreis</span>
                        <span className="text-xl font-medium">{booking.total_price} €</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>Anzahlung (fällig bis {new Date(booking.deposit_due_date).toLocaleDateString('de-DE')})</span>
                          </div>
                          <span>{booking.deposit_amount} €</span>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>Restzahlung (fällig bis {new Date(booking.remaining_due_date).toLocaleDateString('de-DE')})</span>
                          </div>
                          <span>{booking.remaining_amount} €</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/10 rounded-lg p-6">
                      <h4 className="font-medium mb-4">Bankverbindung</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-primary/60">Kontoinhaber:</span>{' '}
                          <span className="font-medium">Robert Spennemann</span>
                        </p>
                        <p>
                          <span className="text-primary/60">IBAN:</span>{' '}
                          <span className="font-medium">DE967005 2060 0000 150813</span>
                        </p>
                        <p>
                          <span className="text-primary/60">BIC:</span>{' '}
                          <span className="font-medium">BYLADEM1LLD</span>
                        </p>
                        <p>
                          <span className="text-primary/60">Verwendungszweck:</span>{' '}
                          <span className="font-medium">Casa di Barbara, {booking.reference}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-medium mb-4">Nächste Schritte</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-primary/80">
                      Wir haben Ihnen eine Bestätigungs-E-Mail mit allen Details gesendet. 
                      Bitte überprüfen Sie auch Ihren Spam-Ordner.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-primary/80">
                      Bitte überweisen Sie die Anzahlung innerhalb der nächsten 7 Tage. 
                      Ihre Buchung wird nach Zahlungseingang bestätigt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/5 
                           text-primary hover:bg-primary/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Zur Startseite</span>
                </Link>

                <Link
                  to="/apartment"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent 
                           text-secondary hover:bg-accent/90 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Weitere Termine ansehen</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Section>
    </div>
  );
};
