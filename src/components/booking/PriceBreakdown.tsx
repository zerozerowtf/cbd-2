import React from 'react';

interface PriceBreakdownData {
  basePrice: number;
  roomSurcharge: number;
  mandatoryFees: Array<{
    name: string;
    amount: number;
    paymentLocation: 'online' | 'on_site';
  }>;
  optionalFees: Array<{
    name: string;
    amount: number;
    paymentLocation: 'online' | 'on_site';
  }>;
  totalOnline: number;
  totalOnSite: number;
  depositAmount: number;
  remainingAmount: number;
  nights: number;
}

interface PriceBreakdownProps extends Partial<PriceBreakdownData> {
  selectedOptions?: string[];
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  basePrice = 0,
  roomSurcharge = 0,
  mandatoryFees = [],
  optionalFees = [],
  totalOnline = 0,
  totalOnSite = 0,
  depositAmount = 0,
  remainingAmount = 0,
  nights = 0,
  selectedOptions = [],
}) => {
  return (
    <div className="bg-accent/10 rounded-lg p-4 space-y-4">
      {/* Base Price */}
      <div>
        <div className="flex justify-between font-medium">
          <span>Grundpreis ({nights} {nights === 1 ? 'Nacht' : 'Nächte'})</span>
          <span>{basePrice} €</span>
        </div>
        {roomSurcharge > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span>Aufpreis Nebenzimmer</span>
            <span>+ {roomSurcharge} €</span>
          </div>
        )}
      </div>

      {/* Mandatory Fees */}
      {mandatoryFees.length > 0 && (
        <div className="border-t border-accent/20 pt-4">
          <p className="font-medium mb-2">Pflichtgebühren</p>
          {mandatoryFees.map((fee, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{fee.name}</span>
              <div className="flex items-center gap-2">
                <span>{fee.amount} €</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/5">
                  {fee.paymentLocation === 'online' ? 'Online' : 'Vor Ort'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Optional Services */}
      {selectedOptions && selectedOptions.length > 0 && optionalFees && (
        <div className="border-t border-accent/20 pt-4">
          <p className="font-medium mb-2">Zusatzleistungen</p>
          {optionalFees
            .filter(fee => selectedOptions.includes(fee.name))
            .map((fee, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{fee.name}</span>
                <div className="flex items-center gap-2">
                  <span>{fee.amount} €</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/5">
                    {fee.paymentLocation === 'online' ? 'Online' : 'Vor Ort'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-accent/20 pt-4">
        <div className="flex justify-between font-medium">
          <span>Online zu zahlen</span>
          <span>{totalOnline} €</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Anzahlung (30%)</span>
          <span>{depositAmount} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Restzahlung</span>
          <span>{remainingAmount} €</span>
        </div>
        {totalOnSite > 0 && (
          <div className="flex justify-between text-sm mt-2 text-primary/60">
            <span>Vor Ort zu zahlen</span>
            <span>{totalOnSite} €</span>
          </div>
        )}
      </div>
    </div>
  );
};
