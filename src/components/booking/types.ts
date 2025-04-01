export interface PriceBreakdownData {
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

export interface BookingFormData {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  guests: {
    adults: number;
    children: number;
  };
  accommodation: {
    withExtraRoom: boolean;
    selectedOptions: string[];
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    guestId?: string;
  };
  specialRequests?: string;
  marketingConsent: boolean;
}
