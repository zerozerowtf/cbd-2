import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  AlertCircle, 
  Home, 
  DoorOpen, 
  Info,
  Calendar,
  Users,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  Euro,
  Percent,
  Tag
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Booking } from '../../../lib/bookings';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { FormSection } from '../../forms/FormSection';
import { FormField } from '../../forms/FormField';
import { FormSelect } from '../../forms/FormSelect';

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Booking;
  initialDate?: Date;
}

interface PricingFee {
  id: string;
  name: Record<string, string>;
  type: 'mandatory' | 'optional';
  amount: number;
  calculation_type: 'per_stay' | 'per_night' | 'per_person' | 'per_person_night';
  payment_location: 'online' | 'on_site';
}

interface PricingDiscount {
  id: string;
  type: 'long_stay' | 'early_bird' | 'last_minute';
  min_value: number;
  max_value?: number;
  discount_percentage: number;
}

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_language: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onClose,
  onSuccess,
  initialData,
  initialDate,
}) => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: initialDate || (initialData ? new Date(initialData.start_date) : undefined),
    to: initialData ? new Date(initialData.end_date) : undefined,
  });

  const [formData, setFormData] = useState({
    guest_id: initialData?.guest_id || '',
    contactInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    num_adults: initialData?.num_adults || 2,
    num_children: initialData?.num_children || 0,
    special_requests: initialData?.special_requests || '',
    status: initialData?.status || 'pending',
    deposit_paid: initialData?.deposit_paid || false,
    remaining_paid: initialData?.remaining_paid || false,
    room_surcharge: initialData?.room_surcharge || 0,
    selected_services: initialData?.selected_services || [],
    manual_discount_percentage: initialData?.manual_discount_percentage || 0,
    manual_discount_reason: initialData?.manual_discount_reason || '',
  });

  const [guest, setGuest] = useState<Guest | null>(null);
  const [availableFees, setAvailableFees] = useState<PricingFee[]>([]);
  const [availableDiscounts, setAvailableDiscounts] = useState<PricingDiscount[]>([]);
  const [priceInfo, setPriceInfo] = useState<{
    basePrice: number;
    roomSurcharge: number;
    onlineFees: Array<{ name: string; amount: number }>;
    onsiteFees: Array<{ name: string; amount: number }>;
    discounts: Array<{ type: string; amount: number }>;
    manualDiscount: number;
    totalOnline: number;
    totalOnsite: number;
    depositAmount: number;
    remainingAmount: number;
    nights: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchPricingData();
    if (initialData?.guest_id) {
      fetchGuestData(initialData.guest_id);
    }
  }, [initialData?.guest_id]);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      calculatePrice();
    }
  }, [dateRange, formData]);

  const fetchGuestData = async (guestId: string) => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .single();

      if (error) throw error;
      if (data) {
        setGuest(data);
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone || '',
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching guest data:', err);
      setError('Fehler beim Laden der Gästedaten');
    }
  };

  const fetchPricingData = async () => {
    try {
      const [feesRes, discountsRes] = await Promise.all([
        supabase
          .from('pricing_fees')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('pricing_discounts')
          .select('*')
          .eq('is_active', true)
      ]);

      if (feesRes.error) throw feesRes.error;
      if (discountsRes.error) throw discountsRes.error;

      setAvailableFees(feesRes.data || []);
      setAvailableDiscounts(discountsRes.data || []);

      // If we have initial data, trigger price calculation
      if (initialData && dateRange.from && dateRange.to) {
        calculatePrice();
      }
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError('Fehler beim Laden der Preisdaten');
    }
  };

  const calculatePrice = async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      // Get pricing period
      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing')
        .select('*')
        .lte('start_date', dateRange.to.toISOString().split('T')[0])
        .gte('end_date', dateRange.from.toISOString().split('T')[0])
        .single();

      if (pricingError) throw pricingError;
      if (!pricingData) throw new Error('No pricing found for selected dates');

      // Calculate number of nights
      const nights = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate base price
      let basePrice = pricingData.base_price * nights;
      let roomSurcharge = formData.room_surcharge > 0 ? pricingData.room_surcharge * nights : 0;

      // Calculate fees
      const onlineFees: Array<{ name: string; amount: number }> = [];
      const onsiteFees: Array<{ name: string; amount: number }> = [];

      availableFees.forEach(fee => {
        if (formData.selected_services.includes(fee.name.de) || fee.type === 'mandatory') {
          let amount = fee.amount;
          switch (fee.calculation_type) {
            case 'per_night':
              amount *= nights;
              break;
            case 'per_person':
              amount *= (formData.num_adults + formData.num_children);
              break;
            case 'per_person_night':
              amount *= (formData.num_adults + formData.num_children) * nights;
              break;
          }

          if (fee.payment_location === 'online') {
            onlineFees.push({ name: fee.name.de, amount });
          } else {
            onsiteFees.push({ name: fee.name.de, amount });
          }
        }
      });

      // Calculate discounts
      const discounts: Array<{ type: string; amount: number }> = [];
      let maxDiscount = 0;

      availableDiscounts.forEach(discount => {
        let isApplicable = false;
        switch (discount.type) {
          case 'long_stay':
            isApplicable = nights >= discount.min_value && 
              (!discount.max_value || nights <= discount.max_value);
            break;
          case 'early_bird':
            const daysUntilArrival = Math.ceil(
              (dateRange.from.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            isApplicable = daysUntilArrival >= discount.min_value &&
              (!discount.max_value || daysUntilArrival <= discount.max_value);
            break;
          case 'last_minute':
            const daysUntilArrival2 = Math.ceil(
              (dateRange.from.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            isApplicable = daysUntilArrival2 <= discount.min_value &&
              (!discount.max_value || daysUntilArrival2 >= discount.max_value);
            break;
        }

        if (isApplicable && discount.discount_percentage > maxDiscount) {
          maxDiscount = discount.discount_percentage;
          discounts.push({
            type: discount.type,
            amount: (basePrice + roomSurcharge) * (discount.discount_percentage / 100)
          });
        }
      });

      // Add manual discount if set
      let manualDiscount = 0;
      if (formData.manual_discount_percentage > 0) {
        manualDiscount = (basePrice + roomSurcharge) * (formData.manual_discount_percentage / 100);
        discounts.push({
          type: 'manual',
          amount: manualDiscount
        });
      }

      // Calculate totals
      const totalOnlineFees = onlineFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalOnsiteFees = onsiteFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalDiscounts = discounts.reduce((sum, discount) => sum + discount.amount, 0);

      const totalOnline = basePrice + roomSurcharge + totalOnlineFees - totalDiscounts;
      const depositAmount = Math.round(totalOnline * 0.5 * 100) / 100;
      const remainingAmount = Math.round((totalOnline - depositAmount) * 100) / 100;

      setPriceInfo({
        basePrice,
        roomSurcharge,
        onlineFees,
        onsiteFees,
        discounts,
        manualDiscount,
        totalOnline,
        totalOnsite: totalOnsiteFees,
        depositAmount,
        remainingAmount,
        nights
      });
    } catch (err) {
      console.error('Error calculating price:', err);
      setError('Fehler bei der Preisberechnung');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange.from || !dateRange.to || !priceInfo) {
      setError('Bitte wählen Sie einen Zeitraum aus');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, check if guest exists or needs to be created/updated
      let guestId = formData.guest_id;
      
      if (!guestId) {
        // Create new guest
        const { data: newGuest, error: createError } = await supabase
          .from('guests')
          .insert({
            first_name: formData.contactInfo.firstName,
            last_name: formData.contactInfo.lastName,
            email: formData.contactInfo.email,
            phone: formData.contactInfo.phone || null,
            preferred_language: 'de',
          })
          .select()
          .single();

        if (createError) throw createError;
        guestId = newGuest.id;
      } else {
        // Update existing guest
        const { error: updateError } = await supabase
          .from('guests')
          .update({
            first_name: formData.contactInfo.firstName,
            last_name: formData.contactInfo.lastName,
            phone: formData.contactInfo.phone || null,
          })
          .eq('id', guestId);

        if (updateError) throw updateError;
      }

      const bookingData = {
        guest_id: guestId,
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
        num_adults: formData.num_adults,
        num_children: formData.num_children,
        special_requests: formData.special_requests || null,
        status: formData.status,
        total_price: priceInfo.totalOnline,
        deposit_amount: priceInfo.depositAmount,
        deposit_paid: formData.deposit_paid,
        remaining_amount: priceInfo.remainingAmount,
        remaining_paid: formData.remaining_paid,
        room_surcharge: formData.room_surcharge,
        selected_services: formData.selected_services,
        manual_discount_percentage: formData.manual_discount_percentage,
        manual_discount_reason: formData.manual_discount_reason || null,
      };

      if (initialData) {
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert([bookingData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving booking:', err);
      setError('Fehler beim Speichern der Buchung');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (email: string) => {
    setFormData(prev => ({ 
      ...prev, 
      contactInfo: {
        ...prev.contactInfo,
        email
      }
    }));

    try {
      // Look up guest by email
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      // If guest exists, update form with their info
      if (data) {
        setGuest(data);
        setFormData(prev => ({
          ...prev,
          guest_id: data.id,
          contactInfo: {
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phone: data.phone || '',
          }
        }));
      } else {
        setGuest(null);
        setFormData(prev => ({
          ...prev,
          guest_id: '',
        }));
      }
    } catch (err) {
      console.error('Error looking up guest:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Guest Information */}
      <FormSection title="Gast" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Vorname" required>
            <div className="relative">
              <input
                type="text"
                value={formData.contactInfo.firstName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: {
                    ...prev.contactInfo,
                    firstName: e.target.value,
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
              />
            </div>
          </FormField>

          <FormField label="Nachname" required>
            <div className="relative">
              <input
                type="text"
                value={formData.contactInfo.lastName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: {
                    ...prev.contactInfo,
                    lastName: e.target.value,
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
              />
            </div>
          </FormField>

          <FormField label="E-Mail" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full pl-10 rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
              />
            </div>
          </FormField>

          <FormField label="Telefon (optional)">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: {
                    ...prev.contactInfo,
                    phone: e.target.value,
                  }
                }))}
                className="w-full pl-10 rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* Booking Details */}
      <FormSection title="Buchungsdetails" icon={Calendar}>
        <div className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Anreise" required>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="date"
                  value={dateRange.from?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    from: e.target.value ? new Date(e.target.value) : undefined,
                  }))}
                  className="w-full pl-10 pr-12 rounded-lg border-gray-300 shadow-sm 
                           focus:border-accent focus:ring focus:ring-accent/20"
                  required
                />
              </div>
            </FormField>

            <FormField label="Abreise" required>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="date"
                  value={dateRange.to?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    to: e.target.value ? new Date(e.target.value) : undefined,
                  }))}
                  className="w-full pl-10 pr-12 rounded-lg border-gray-300 shadow-sm 
                           focus:border-accent focus:ring focus:ring-accent/20"
                  required
                  min={dateRange.from?.toISOString().split('T')[0]}
                />
              </div>
            </FormField>
          </div>

          {/* Guest Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Erwachsene" required>
              <FormSelect
                value={formData.num_adults}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  num_adults: Number(value),
                }))}
                options={[1, 2, 3, 4, 5].map(num => ({
                  value: num,
                  label: String(num),
                }))}
              />
            </FormField>

            <FormField label="Kinder">
              <FormSelect
                value={formData.num_children}
                onChange={(value) => setFormData(prev => ({
                  ...prev,
                  num_children: Number(value),
                }))}
                options={[0, 1, 2, 3].map(num => ({
                  value: num,
                  label: String(num),
                }))}
              />
            </FormField>
          </div>

          {/* Room Type */}
          <FormField label="Unterkunft">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, room_surcharge: 0 }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 
                         transition-colors ${
                           formData.room_surcharge === 0
                             ? 'bg-accent text-secondary'
                             : 'bg-primary/5 hover:bg-primary/10'
                         }`}
              >
                <Home className="w-5 h-5" />
                <span>Nur Hauptwohnung</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, room_surcharge: 30 }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 
                         transition-colors ${
                           formData.room_surcharge > 0
                             ? 'bg-accent text-secondary'
                             : 'bg-primary/5 hover:bg-primary/10'
                         }`}
              >
                <DoorOpen className="w-5 h-5" />
                <span>Mit Nebenzimmer</span>
              </button>
            </div>
          </FormField>

          {/* Additional Services */}
          {availableFees.filter(fee => fee.type === 'optional').length > 0 && (
            <FormField label="Zusatzleistungen">
              <div className="space-y-2">
                {availableFees
                  .filter(fee => fee.type === 'optional')
                  .map(fee => (
                    <label key={fee.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.selected_services.includes(fee.name.de)}
                        onChange={(e) => {
                          const services = e.target.checked
                            ? [...formData.selected_services, fee.name.de]
                            : formData.selected_services.filter(s => s !== fee.name.de);
                          setFormData(prev => ({
                            ...prev,
                            selected_services: services,
                          }));
                        }}
                        className="rounded border-gray-300 text-accent 
                                 focus:ring-accent/20"
                      />
                      <span>{fee.name.de}</span>
                      <span className="text-sm text-primary/60">
                        ({fee.amount} € {
                          fee.calculation_type === 'per_stay' ? 'pro Aufenthalt' :
                          fee.calculation_type === 'per_night' ? 'pro Nacht' :
                          fee.calculation_type === 'per_person' ? 'pro Person' :
                          'pro Person/Nacht'
                        })
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/5">
                        {fee.payment_location === 'online' ? 'Online' : 'Vor Ort'}
                      </span>
                    </label>
                  ))}
              </div>
            </FormField>
          )}

          {/* Manual Discount */}
          <FormField label="Manueller Rabatt">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.manual_discount_percentage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    manual_discount_percentage: Number(e.target.value),
                  }))}
                  className="w-full pl-10 pr-12 rounded-lg border-gray-300 shadow-sm 
                           focus:border-accent focus:ring focus:ring-accent/20"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/60">
                  %
                </span>
              </div>
              <input
                type="text"
                value={formData.manual_discount_reason}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  manual_discount_reason: e.target.value,
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
                placeholder="Grund für den Rabatt"
              />
            </div>
          </FormField>

          {/* Status and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status">
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.value as 'pending' | 'confirmed' | 'cancelled',
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
                required
              >
                <option value="pending">Anfrage</option>
                <option value="confirmed">Bestätigt</option>
                <option value="cancelled">Storniert</option>
              </select>
            </FormField>

            <FormField label="Zahlungsstatus">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deposit_paid}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      deposit_paid: e.target.checked,
                    }))}
                    className="rounded border-gray-300 text-accent 
                             focus:ring-accent/20"
                  />
                  <span>Anzahlung bezahlt</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.remaining_paid}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      remaining_paid: e.target.checked,
                    }))}
                    className="rounded border-gray-300 text-accent 
                             focus:ring-accent/20"
                  />
                  <span>Restzahlung bezahlt</span>
                </label>
              </div>
            </FormField>
          </div>

          {/* Special Requests */}
          <FormField label="Besondere Wünsche">
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-primary/40" />
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  special_requests: e.target.value,
                }))}
                rows={4}
                className="w-full pl-10 rounded-lg border-gray-300 shadow-sm 
                         focus:border-accent focus:ring focus:ring-accent/20"
              />
            </div>
          </FormField>
        </div>
      </FormSection>

      {/* Price Information */}
      {priceInfo && (
        <FormSection title="Preisübersicht" icon={Euro}>
          <div className="bg-accent/10 rounded-lg p-4 space-y-4">
            {/* Base Price */}
            <div>
              <div className="flex justify-between font-medium">
                <span>Grundpreis ({priceInfo.nights} Nächte)</span>
                <span>{priceInfo.basePrice} €</span>
              </div>
              {priceInfo.roomSurcharge > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span>Aufpreis Nebenzimmer</span>
                  <span>+ {priceInfo.roomSurcharge} €</span>
                </div>
              )}
            </div>

            {/* Online Fees */}
            {priceInfo.onlineFees.length > 0 && (
              <div className="border-t border-accent/20 pt-4">
                <p className="font-medium mb-2">Online zu zahlende Gebühren</p>
                {priceInfo.onlineFees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{fee.name}</span>
                    <span>+ {fee.amount} €</span>
                  </div>
                ))}
              </div>
            )}

            {/* Onsite Fees */}
            {priceInfo.onsiteFees.length > 0 && (
              <div className="border-t border-accent/20 pt-4">
                <p className="font-medium mb-2">Vor Ort zu zahlende Gebühren</p>
                {priceInfo.onsiteFees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{fee.name}</span>
                    <span>+ {fee.amount} €</span>
                  </div>
                ))}
              </div>
            )}

            {/* Discounts */}
            {priceInfo.discounts.length > 0 && (
              <div className="border-t border-accent/20 pt-4">
                <p className="font-medium mb-2">Rabatte</p>
                {priceInfo.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{
                      discount.type === 'long_stay' ? 'Langzeitrabatt' :
                      discount.type === 'early_bird' ? 'Frühbucherrabatt' :
                      discount.type === 'last_minute' ? 'Last-Minute-Rabatt' :
                      'Manueller Rabatt'
                    }</span>
                    <span>- {discount.amount} €</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-accent/20 pt-4">
              <div className="flex justify-between font-medium">
                <span>Online zu zahlen</span>
                <span>{priceInfo.totalOnline} €</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Anzahlung (50%)</span>
                <span>{priceInfo.depositAmount} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Restzahlung</span>
                <span>{priceInfo.remainingAmount} €</span>
              </div>
              {priceInfo.totalOnsite > 0 && (
                <div className="flex justify-between text-sm mt-2 text-primary/60">
                  <span>Vor Ort zu zahlen</span>
                  <span>{priceInfo.totalOnsite} €</span>
                </div>
              )}
            </div>
          </div>
        </FormSection>
      )}

      {/* Form Actions */}
      <div className={`flex ${isMobile ? 'flex-col' : ''} justify-end gap-2`}>
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-2 rounded-lg text-primary/60 
                   hover:text-primary transition-colors
                   ${isMobile ? 'order-2' : ''}`}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-accent text-secondary px-4 py-2 rounded-lg 
                   hover:bg-accent/90 transition-colors disabled:opacity-50
                   ${isMobile ? 'order-1' : ''}`}
        >
          {isLoading ? 'Wird gespeichert...' : initialData ? 'Speichern' : 'Erstellen'}
        </button>
      </div>
    </form>
  );
};
