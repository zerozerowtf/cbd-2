import React from 'react';
import { AlertCircle, Home, DoorOpen, Info, Check } from 'lucide-react';
import { FormSection } from '../../forms/FormSection';
import { FormField } from '../../forms/FormField';
import { FormSelect } from '../../forms/FormSelect';
import { PriceBreakdown } from '../PriceBreakdown';
import type { PriceBreakdownData } from '../types';

interface GuestDetailsProps {
  guests: {
    adults: number;
    children: number;
  };
  withExtraRoom: boolean;
  onGuestsChange: (guests: { adults: number; children: number }) => void;
  onExtraRoomChange: (withExtraRoom: boolean) => void;
  error?: string;
  priceBreakdown?: PriceBreakdownData | null;
  specialRequests: string;
  onSpecialRequestsChange: (value: string) => void;
  selectedOptions: string[];
  onOptionsChange: (options: string[]) => void;
}

export const GuestDetails: React.FC<GuestDetailsProps> = ({
  guests,
  withExtraRoom,
  onGuestsChange,
  onExtraRoomChange,
  error,
  priceBreakdown,
  specialRequests,
  onSpecialRequestsChange,
  selectedOptions,
  onOptionsChange,
}) => {
  const handleOptionToggle = (optionName: string) => {
    onOptionsChange(
      selectedOptions.includes(optionName)
        ? selectedOptions.filter(name => name !== optionName)
        : [...selectedOptions, optionName]
    );
  };

  return (
    <>
      <FormSection title="Unterkunft">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => onExtraRoomChange(false)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 
                     transition-colors ${
                       !withExtraRoom
                         ? 'bg-accent text-secondary'
                         : 'bg-primary/5 hover:bg-primary/10'
                     }`}
          >
            <Home className="w-4 h-4" />
            <span>Hauptwohnung</span>
          </button>
          <button
            type="button"
            onClick={() => onExtraRoomChange(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 
                     transition-colors ${
                       withExtraRoom
                         ? 'bg-accent text-secondary'
                         : 'bg-primary/5 hover:bg-primary/10'
                     }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>Mit Nebenzimmer</span>
          </button>
        </div>

        <div className="mt-3 p-3 bg-accent/10 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-accent" />
            <p className="text-sm text-primary/80">
              Das Nebenzimmer verfügt über ein eigenes Doppelbett und eine separate 
              Toilette. Es ist ideal für Gruppen von 4-5 Personen oder wenn Sie 
              zusätzliche Privatsphäre wünschen.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Gäste">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Erwachsene" required>
            <FormSelect
              value={guests.adults}
              onChange={(value) => onGuestsChange({ 
                ...guests, 
                adults: Number(value) 
              })}
              options={[1, 2, 3, 4, 5].map(num => ({
                value: num,
                label: String(num),
              }))}
            />
          </FormField>
          <FormField label="Kinder">
            <FormSelect
              value={guests.children}
              onChange={(value) => onGuestsChange({ 
                ...guests, 
                children: Number(value) 
              })}
              options={[0, 1, 2, 3].map(num => ({
                value: num,
                label: String(num),
              }))}
            />
          </FormField>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </FormSection>

      {priceBreakdown?.optionalFees && priceBreakdown.optionalFees.length > 0 && (
        <FormSection title="Extras">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {priceBreakdown.optionalFees.map((fee, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionToggle(fee.name)}
                className={`w-full flex items-center justify-between p-3 rounded-lg 
                         border transition-colors ${
                           selectedOptions.includes(fee.name)
                             ? 'border-accent bg-accent/5'
                             : 'border-gray-200 hover:border-accent/50'
                         }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center 
                               transition-colors ${
                                 selectedOptions.includes(fee.name)
                                   ? 'bg-accent text-secondary'
                                   : 'bg-gray-200'
                               }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{fee.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-primary/80">
                        {fee.amount} €
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/5">
                        {fee.paymentLocation === 'online' ? 'Online' : 'Vor Ort'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </FormSection>
      )}

      {priceBreakdown && (
        <FormSection title="Preisübersicht">
          <PriceBreakdown {...priceBreakdown} selectedOptions={selectedOptions} />
        </FormSection>
      )}

      <FormSection title="Besondere Wünsche">
        <textarea
          value={specialRequests}
          onChange={(e) => onSpecialRequestsChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm 
                   focus:border-accent focus:ring focus:ring-accent/20"
          placeholder="Haben Sie besondere Wünsche oder Anmerkungen?"
        />
      </FormSection>
    </>
  );
};
