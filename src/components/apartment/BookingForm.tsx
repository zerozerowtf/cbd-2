import React, { useState, useEffect } from 'react';
import { BookingCalendar } from './BookingCalendar';
import { FormField } from '../forms/FormField';
import { FormSection } from '../forms/FormSection';
import { FormSelect } from '../forms/FormSelect';
import { getBlockedDates, createBooking, calculatePrice } from '../../lib/bookings';
import { addDays } from 'date-fns';
import { AlertCircle, Calendar } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  minNights?: number;
}

export interface BookingFormData {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  guests: {
    adults: number;
    children: number;
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  specialRequests?: string;
}

interface FormErrors {
  dateRange?: string;
  guests?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  minNights = 4,
}) => {
  // Form state
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [guests, setGuests] = useState({ adults: 2, children: 0 });
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');

  // UI state
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<{
    totalPrice: number;
    depositAmount: number;
    remainingAmount: number;
    nights: number;
  } | null>(null);

  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        const dates = await getBlockedDates();
        setDisabledDates(dates);
      } catch (err) {
        setServerError('Verfügbarkeitsdaten konnten nicht geladen werden.');
      }
    };

    loadBlockedDates();
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const price = calculatePrice(
        dateRange.from,
        dateRange.to,
        guests.adults + guests.children
      );
      setPriceInfo(price);
    } else {
      setPriceInfo(null);
    }
  }, [dateRange, guests]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!dateRange.from || !dateRange.to) {
      newErrors.dateRange = 'Bitte wählen Sie ein Anreise- und Abreisedatum.';
    }

    if (guests.adults + guests.children > 5) {
      newErrors.guests = 'Maximal 5 Gäste möglich.';
    }

    if (!contactInfo.firstName.trim()) {
      newErrors.firstName = 'Bitte geben Sie Ihren Vornamen ein.';
    }

    if (!contactInfo.lastName.trim()) {
      newErrors.lastName = 'Bitte geben Sie Ihren Nachnamen ein.';
    }

    if (!contactInfo.email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (contactInfo.phone && !/^[+\d\s-()]{6,20}$/.test(contactInfo.phone)) {
      newErrors.phone = 'Bitte geben Sie eine gültige Telefonnummer ein.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm() || !dateRange.from || !dateRange.to) {
      return;
    }

    setIsLoading(true);

    try {
      await createBooking({
        dateRange: {
          from: dateRange.from,
          to: dateRange.to,
        },
        guests,
        contactInfo,
        specialRequests,
      });

      onSubmit({
        dateRange,
        guests,
        contactInfo,
        specialRequests,
      });
    } catch (err) {
      setServerError('Buchung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (range.from) {
      const minEndDate = addDays(range.from, minNights - 1);
      setDateRange({
        from: range.from,
        to: range.to && range.to > minEndDate ? range.to : minEndDate,
      });
    } else {
      setDateRange(range);
    }
    setErrors({ ...errors, dateRange: undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <FormSection 
        title="Verfügbarkeit prüfen"
        subtitle={`Mindestaufenthalt: ${minNights} Nächte`}
      >
        <BookingCalendar
          selectedRange={dateRange}
          onSelect={handleDateSelect}
          disabledDays={disabledDates}
          minNights={minNights}
        />
        {errors.dateRange && (
          <p className="mt-2 text-sm text-red-600">{errors.dateRange}</p>
        )}
      </FormSection>

      <FormSection title="Gäste">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Erwachsene" required>
            <FormSelect
              value={guests.adults}
              onChange={(value) => {
                setGuests({ ...guests, adults: Number(value) });
                setErrors({ ...errors, guests: undefined });
              }}
              options={[1, 2, 3, 4, 5].map(num => ({
                value: num,
                label: String(num),
              }))}
            />
          </FormField>
          <FormField label="Kinder">
            <FormSelect
              value={guests.children}
              onChange={(value) => {
                setGuests({ ...guests, children: Number(value) });
                setErrors({ ...errors, guests: undefined });
              }}
              options={[0, 1, 2, 3].map(num => ({
                value: num,
                label: String(num),
              }))}
            />
          </FormField>
        </div>
        {errors.guests && (
          <p className="mt-2 text-sm text-red-600">{errors.guests}</p>
        )}
      </FormSection>

      {priceInfo && (
        <FormSection title="Preisübersicht">
          <div className="bg-accent/10 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span>{priceInfo.nights} Nächte</span>
              </div>
              <span className="font-semibold">{priceInfo.totalPrice} €</span>
            </div>
            <div className="border-t border-accent/20 pt-4">
              <div className="flex justify-between text-sm">
                <span>Anzahlung (30%)</span>
                <span>{priceInfo.depositAmount} €</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Restzahlung</span>
                <span>{priceInfo.remainingAmount} €</span>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      <FormSection title="Kontaktinformationen">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              label="Vorname" 
              required 
              error={errors.firstName}
            >
              <input
                type="text"
                value={contactInfo.firstName}
                onChange={(e) => {
                  setContactInfo({ ...contactInfo, firstName: e.target.value });
                  setErrors({ ...errors, firstName: undefined });
                }}
                className="w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
              />
            </FormField>
            <FormField 
              label="Nachname" 
              required 
              error={errors.lastName}
            >
              <input
                type="text"
                value={contactInfo.lastName}
                onChange={(e) => {
                  setContactInfo({ ...contactInfo, lastName: e.target.value });
                  setErrors({ ...errors, lastName: undefined });
                }}
                className="w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
              />
            </FormField>
          </div>
          <FormField 
            label="E-Mail" 
            required 
            error={errors.email}
          >
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, email: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              className="w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-accent focus:ring focus:ring-accent/20"
            />
          </FormField>
          <FormField 
            label="Telefon (optional)" 
            error={errors.phone}
          >
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => {
                setContactInfo({ ...contactInfo, phone: e.target.value });
                setErrors({ ...errors, phone: undefined });
              }}
              className="w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-accent focus:ring focus:ring-accent/20"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Besondere Wünsche">
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm 
                   focus:border-accent focus:ring focus:ring-accent/20"
          placeholder="Haben Sie besondere Wünsche oder Anmerkungen?"
        />
      </FormSection>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent text-secondary py-3 rounded-md font-semibold 
                 hover:bg-accent/90 transition-colors duration-300 
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Wird gesendet...' : 'Anfrage senden'}
      </button>
    </form>
  );
};
