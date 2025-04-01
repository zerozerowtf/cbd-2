import { supabase } from './supabase';

export interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  guest_id: string;
  num_adults: number;
  num_children: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at?: string;
  remaining_amount: number;
  remaining_paid: boolean;
  remaining_paid_at?: string;
  deposit_due_date?: string;
  remaining_due_date?: string;
  room_surcharge: number;
  reference?: string;
  selected_services?: string[];
  manual_discount_percentage: number;
  manual_discount_reason?: string;
}

interface PricingPeriod {
  base_price: number;
  room_surcharge: number;
  min_nights: number;
  max_nights: number;
  season_type: 'low' | 'mid' | 'high' | 'holiday';
}

interface Fee {
  name: Record<string, string>;
  type: 'mandatory' | 'optional';
  amount: number;
  calculation_type: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
  payment_location: 'online' | 'on_site';
}

interface PaymentSettings {
  deposit_percentage: number;
  deposit_due_days: number;
  remaining_due_days: number;
  bank_holder: string;
  bank_iban: string;
  bank_bic: string;
}

export const getMinimumStay = async (date: Date): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('pricing')
      .select('min_nights')
      .lte('start_date', date.toISOString().split('T')[0])
      .gte('end_date', date.toISOString().split('T')[0])
      .single();

    if (error) throw error;
    return data?.min_nights || 4; // Default to 4 if no period found
  } catch (err) {
    console.error('Error fetching minimum stay:', err);
    return 4; // Default to 4 nights on error
  }
};

export const validateStayDuration = async (
  startDate: Date,
  endDate: Date
): Promise<{ isValid: boolean; minNights: number; maxNights: number }> => {
  try {
    // Get pricing period for the dates
    const { data: pricing, error } = await supabase
      .from('pricing')
      .select('min_nights, max_nights')
      .lte('start_date', startDate.toISOString().split('T')[0])
      .gte('end_date', startDate.toISOString().split('T')[0])
      .single();

    if (error) throw error;
    if (!pricing) throw new Error('No pricing found for selected dates');

    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isValid: nights >= pricing.min_nights && nights <= pricing.max_nights,
      minNights: pricing.min_nights,
      maxNights: pricing.max_nights,
    };
  } catch (err) {
    console.error('Error validating stay duration:', err);
    // Default values on error
    return {
      isValid: true,
      minNights: 4,
      maxNights: 28,
    };
  }
};

export const checkAvailability = async (
  startDate: Date,
  endDate: Date
): Promise<{ available: boolean; reason?: string }> => {
  try {
    // Check for overlapping bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .neq('status', 'cancelled')
      .or(`start_date.lte.${endDate.toISOString().split('T')[0]},end_date.gte.${startDate.toISOString().split('T')[0]}`);

    if (bookingsError) throw bookingsError;
    if (bookings && bookings.length > 0) {
      return { available: false, reason: 'Der gewählte Zeitraum ist bereits gebucht' };
    }

    // Check for blocked dates
    const { data: blocked, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('id')
      .or(`start_date.lte.${endDate.toISOString().split('T')[0]},end_date.gte.${startDate.toISOString().split('T')[0]}`);

    if (blockedError) throw blockedError;
    if (blocked && blocked.length > 0) {
      return { available: false, reason: 'Der gewählte Zeitraum ist gesperrt' };
    }

    // Check stay duration
    const validation = await validateStayDuration(startDate, endDate);
    if (!validation.isValid) {
      return { 
        available: false, 
        reason: `Aufenthaltsdauer muss zwischen ${validation.minNights} und ${validation.maxNights} Nächten liegen` 
      };
    }

    return { available: true };
  } catch (err) {
    console.error('Error checking availability:', err);
    throw new Error('Fehler bei der Verfügbarkeitsprüfung');
  }
};

export const calculatePrice = async (
  startDate: Date,
  endDate: Date,
  numGuests: number,
  withRoomSurcharge = false,
  selectedServices: string[] = []
) => {
  try {
    // Get pricing period and payment settings in parallel
    const [pricingRes, settingsRes] = await Promise.all([
      supabase
        .from('pricing')
        .select('*')
        .lte('start_date', endDate.toISOString().split('T')[0])
        .gte('end_date', startDate.toISOString().split('T')[0])
        .single(),
      supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .single()
    ]);

    if (pricingRes.error) throw pricingRes.error;
    if (settingsRes.error) throw settingsRes.error;
    if (!pricingRes.data) throw new Error('No pricing found for selected dates');
    if (!settingsRes.data) throw new Error('No payment settings found');

    const pricing: PricingPeriod = pricingRes.data;
    const settings: PaymentSettings = settingsRes.data;

    // Calculate number of nights
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check minimum nights requirement
    if (nights < pricing.min_nights) {
      throw new Error(`Mindestaufenthalt: ${pricing.min_nights} Nächte`);
    }

    // Check maximum nights requirement
    if (nights > pricing.max_nights) {
      throw new Error(`Maximaler Aufenthalt: ${pricing.max_nights} Nächte`);
    }

    // Calculate base price
    let basePrice = pricing.base_price * nights;
    let roomSurcharge = withRoomSurcharge ? pricing.room_surcharge * nights : 0;

    // Get mandatory fees
    const { data: mandatoryFees, error: mandatoryFeesError } = await supabase
      .from('pricing_fees')
      .select('*')
      .eq('type', 'mandatory')
      .eq('is_active', true);

    if (mandatoryFeesError) throw mandatoryFeesError;

    // Get optional fees
    const { data: optionalFees, error: optionalFeesError } = await supabase
      .from('pricing_fees')
      .select('*')
      .eq('type', 'optional')
      .eq('is_active', true);

    if (optionalFeesError) throw optionalFeesError;

    // Calculate fees
    let totalOnline = basePrice + roomSurcharge;
    let totalOnSite = 0;

    const processedMandatoryFees = mandatoryFees?.map(fee => {
      let amount = fee.amount;
      switch (fee.calculation_type) {
        case 'per_stay':
          break;
        case 'per_night':
          amount *= nights;
          break;
        case 'per_person':
          amount *= numGuests;
          break;
        case 'per_person_night':
          amount *= numGuests * nights;
          break;
      }

      if (fee.payment_location === 'online') {
        totalOnline += amount;
      } else {
        totalOnSite += amount;
      }

      return {
        name: fee.name.de,
        amount,
        paymentLocation: fee.payment_location,
      };
    }) || [];

    const processedOptionalFees = optionalFees?.map(fee => {
      let amount = fee.amount;
      switch (fee.calculation_type) {
        case 'per_stay':
          break;
        case 'per_night':
          amount *= nights;
          break;
        case 'per_person':
          amount *= numGuests;
          break;
        case 'per_person_night':
          amount *= numGuests * nights;
          break;
      }

      // Only add to totals if service is selected
      if (selectedServices.includes(fee.name.de)) {
        if (fee.payment_location === 'online') {
          totalOnline += amount;
        } else {
          totalOnSite += amount;
        }
      }

      return {
        name: fee.name.de,
        amount,
        paymentLocation: fee.payment_location,
      };
    }) || [];

    // Calculate deposit and remaining amount based on settings
    const depositAmount = Math.round(totalOnline * (settings.deposit_percentage / 100) * 100) / 100;
    const remainingAmount = Math.round((totalOnline - depositAmount) * 100) / 100;

    // Calculate due dates
    const depositDueDate = new Date();
    depositDueDate.setDate(depositDueDate.getDate() + settings.deposit_due_days);

    const remainingDueDate = new Date(startDate);
    remainingDueDate.setDate(remainingDueDate.getDate() - settings.remaining_due_days);

    return {
      basePrice,
      roomSurcharge,
      mandatoryFees: processedMandatoryFees,
      optionalFees: processedOptionalFees,
      totalOnline,
      totalOnSite,
      depositAmount,
      remainingAmount,
      depositDueDate: depositDueDate.toISOString().split('T')[0],
      remainingDueDate: remainingDueDate.toISOString().split('T')[0],
      nights,
    };
  } catch (error) {
    console.error('Error calculating price:', error);
    throw error;
  }
};

export const createBooking = async (data: {
  dateRange: { from: Date; to: Date };
  guests: { adults: number; children: number };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  specialRequests?: string;
}) => {
  try {
    // Calculate price first to validate dates and get pricing
    const priceInfo = await calculatePrice(
      data.dateRange.from,
      data.dateRange.to,
      data.guests.adults + data.guests.children
    );

    // Create or find guest first
    let guestId: string;
    
    // Check if guest already exists
    const { data: existingGuest, error: findError } = await supabase
      .from('guests')
      .select('id')
      .eq('email', data.contactInfo.email)
      .maybeSingle();
      
    if (findError && findError.code !== 'PGRST116') { // Ignore not found error
      throw findError;
    }
    
    if (existingGuest) {
      // Update existing guest
      guestId = existingGuest.id;
      
      const { error: updateError } = await supabase
        .from('guests')
        .update({
          first_name: data.contactInfo.firstName,
          last_name: data.contactInfo.lastName,
          phone: data.contactInfo.phone || null,
        })
        .eq('id', guestId);
        
      if (updateError) throw updateError;
    } else {
      // Create new guest
      const { data: newGuest, error: createError } = await supabase
        .from('guests')
        .insert({
          first_name: data.contactInfo.firstName,
          last_name: data.contactInfo.lastName,
          email: data.contactInfo.email,
          phone: data.contactInfo.phone || null,
          preferred_language: 'de',
        })
        .select()
        .single();

      if (createError) throw createError;
      guestId = newGuest.id;
    }

    // Create booking
    const bookingData = {
      guest_id: guestId,
      start_date: data.dateRange.from.toISOString().split('T')[0],
      end_date: data.dateRange.to.toISOString().split('T')[0],
      num_adults: data.guests.adults,
      num_children: data.guests.children,
      special_requests: data.specialRequests || null,
      status: 'pending',
      total_price: priceInfo.totalOnline,
      deposit_amount: priceInfo.depositAmount,
      deposit_paid: false,
      remaining_amount: priceInfo.remainingAmount,
      remaining_paid: false,
      room_surcharge: 0,
      selected_services: [],
      deposit_due_date: priceInfo.depositDueDate,
      remaining_due_date: priceInfo.remainingDueDate,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) {
      if (bookingError.code === '23514') {
        throw new Error(`Mindestaufenthalt: ${priceInfo.nights} Nächte`);
      }
      throw bookingError;
    }

    return booking;
  } catch (error) {
    console.error('Error in createBooking:', error);
    throw error;
  }
};

export const getBlockedDates = async (): Promise<Date[]> => {
  // Get confirmed bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('start_date, end_date')
    .neq('status', 'cancelled');

  if (bookingsError) {
    throw bookingsError;
  }

  // Get blocked dates
  const { data: blockedDates, error: blockedError } = await supabase
    .from('blocked_dates')
    .select('start_date, end_date');

  if (blockedError) {
    throw blockedError;
  }

  // Combine and format all blocked dates
  const allBlockedDates = [
    ...bookings.map(b => ({ start: new Date(b.start_date), end: new Date(b.end_date) })),
    ...blockedDates.map(b => ({ start: new Date(b.start_date), end: new Date(b.end_date) })),
  ];

  // Generate array of all blocked individual dates
  const blockedDaysSet = new Set<string>();
  allBlockedDates.forEach(({ start, end }) => {
    const current = new Date(start);
    while (current <= end) {
      blockedDaysSet.add(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  });

  return Array.from(blockedDaysSet).map(date => new Date(date));
};
