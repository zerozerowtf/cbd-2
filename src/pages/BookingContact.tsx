import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Users, Mail, MapPin, Phone, Clock, Ban, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Section } from '../components/Section';
import { ScrollReveal } from '../components/ScrollReveal';
import { BookingForm } from '../components/booking/BookingForm';
import { AvailabilityCalendar } from '../components/booking/AvailabilityCalendar';
import { supabase } from '../lib/supabase';
import { sendEmail } from '../lib/email';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const BookingContact = () => {
  const location = useLocation();
  const [dateRange, setDateRange] = useState(
    location.state?.dateRange || { from: undefined, to: undefined }
  );
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
  // Contact form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Save message to database
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          language: 'de',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Send confirmation email to user
      const userEmailResult = await sendEmail({
        to: formData.email,
        templateId: 'contact_confirmation',
        data: {
          name: formData.name,
          subject: formData.subject,
          message: formData.message,
        },
        language: 'de',
      });

      if (!userEmailResult.success) {
        throw new Error(userEmailResult.error || 'Failed to send confirmation email');
      }

      // Send notification to admin
      await sendEmail({
        to: 'casadibarbara@zerozero.wtf',
        templateId: 'message_notification',
        data: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Booking Section */}
      <Section variant="secondary" className="py-12 md:py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-display mb-4">
                Jetzt buchen
              </h1>
              <p className="text-lg text-primary/80">
                Planen Sie Ihren perfekten Aufenthalt in der Casa di Barbara
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <BookingForm
              onSubmit={async (data) => {
                // Handle booking submission
                console.log('Booking data:', data);
              }}
              initialDateRange={dateRange}
              initialStep={dateRange.from ? 1 : 0}
            />
          </ScrollReveal>
        </div>
      </Section>

      {/* Contact Section */}
      <Section variant="accent" className="py-12 md:py-24">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display mb-4">
                Kontakt & Anfahrt
              </h2>
              <p className="text-lg text-primary/80">
                Haben Sie Fragen? Wir sind für Sie da.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <ScrollReveal>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-display mb-6">Schreiben Sie uns</h3>
                
                {error && (
                  <div className="mb-6 flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-lg">
                    Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns 
                    schnellstmöglich bei Ihnen melden.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm 
                                 focus:border-accent focus:ring focus:ring-accent/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">E-Mail</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm 
                                 focus:border-accent focus:ring focus:ring-accent/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Betreff</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm 
                               focus:border-accent focus:ring focus:ring-accent/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nachricht</label>
                    <textarea
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm 
                               focus:border-accent focus:ring focus:ring-accent/20"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent text-secondary py-3 rounded-lg 
                             font-semibold hover:bg-accent/90 transition-colors 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Wird gesendet...</span>
                      </>
                    ) : (
                      <span>Nachricht senden</span>
                    )}
                  </button>
                </form>
              </div>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal>
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-display mb-6">Kontaktdaten</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p className="text-primary/80">
                          Via Roma, 14<br />
                          18030 Airole (IM)<br />
                          Italien
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <a 
                          href="tel:+393401234567"
                          className="text-primary/80 hover:text-accent transition-colors"
                        >
                          +39 340 123 4567
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">E-Mail</p>
                        <a 
                          href="mailto:info@casadibarbara.com"
                          className="text-primary/80 hover:text-accent transition-colors"
                        >
                          info@casadibarbara.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium">Check-in & Check-out</p>
                        <p className="text-primary/80">
                          Check-in: 15:00 - 22:00 Uhr<br />
                          Check-out: bis 11:00 Uhr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-display mb-6">Anfahrt</h3>
                  <div className="prose prose-lg">
                    <p>
                      Die Casa di Barbara liegt im Herzen des mittelalterlichen Dorfes 
                      Airole. Kostenlose öffentliche Parkplätze finden Sie etwa 100m 
                      von der Wohnung entfernt.
                    </p>
                    <p>
                      Mit dem Zug erreichen Sie Airole über die Bahnlinie 
                      Ventimiglia-Cuneo. Der Bahnhof ist nur 120m von der Wohnung 
                      entfernt.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Section>
    </div>
  );
};
