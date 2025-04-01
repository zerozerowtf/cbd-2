import React from 'react';
import { FormSection } from '../../forms/FormSection';
import { FormField } from '../../forms/FormField';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface ContactInfoProps {
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onChange: (field: string, value: string) => void;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  marketingConsent: boolean;
  onMarketingConsentChange: (value: boolean) => void;
  existingGuest: boolean;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  contactInfo,
  onChange,
  errors,
  marketingConsent,
  onMarketingConsentChange,
  existingGuest,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <FormSection title="Kontaktinformationen">
      <div className="space-y-4">
        {existingGuest && (
          <div className="bg-accent/10 px-4 py-3 rounded-lg text-sm">
            Willkommen zurück! Wir haben Ihre Daten bereits gespeichert.
          </div>
        )}

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <FormField 
            label="Vorname" 
            required 
            error={errors.firstName}
          >
            <input
              type="text"
              value={contactInfo.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm 
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
              onChange={(e) => onChange('lastName', e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm 
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
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm 
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
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm 
                     focus:border-accent focus:ring focus:ring-accent/20"
          />
        </FormField>

        <div className="mt-6">
          <label className="flex items-start gap-2 text-sm text-primary/80">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => onMarketingConsentChange(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-accent 
                       focus:ring-accent/20"
            />
            <span>
              Ich möchte gerne über Angebote und Neuigkeiten von Casa di Barbara 
              informiert werden. Diese Einwilligung kann jederzeit widerrufen werden.
            </span>
          </label>
        </div>
      </div>
    </FormSection>
  );
};
