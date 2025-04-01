# Booking System Documentation and Improvements

## Current Issues and Solutions

### 1. Payment System

#### Current State
- Deposit amount has been increased from 30% to 50%
- Payment deadlines are hardcoded
- No admin UI for payment settings
- Missing payment confirmation emails

#### Required Changes

1. **Payment Settings Table**
```sql
CREATE TABLE payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_percentage integer NOT NULL DEFAULT 50 CHECK (deposit_percentage BETWEEN 0 AND 100),
  deposit_due_days integer NOT NULL DEFAULT 7,
  remaining_due_days integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

2. **Payment Deadlines**
- Deposit: 7 days after booking
- Remaining payment: 30 days before arrival
- Both deadlines should be configurable in admin panel

3. **Payment Status Tracking**
```sql
ALTER TABLE bookings
  ADD COLUMN deposit_paid_at timestamptz,
  ADD COLUMN remaining_paid_at timestamptz,
  ADD COLUMN deposit_due_date date NOT NULL,
  ADD COLUMN remaining_due_date date NOT NULL;
```

### 2. Email Templates

#### Required Templates

1. **Booking Request** (✓ Updated)
- Now shows 50% deposit requirement
- Includes room type information
- Lists selected services
- Improved HTML formatting

2. **Booking Confirmation** (✓ Updated)
- Shows 50% deposit requirement
- Includes payment schedule with due dates
- Lists selected services
- Improved price breakdown
- Bank details with booking reference

3. **Payment Confirmation** (New)
```typescript
interface PaymentConfirmationTemplate {
  type: 'deposit' | 'remaining';
  variables: {
    name: string;
    amount: number;
    bookingRef: string;
    remainingAmount?: number;
    remainingDueDate?: string;
  };
}
```

4. **Payment Reminder** (New)
```typescript
interface PaymentReminderTemplate {
  type: 'deposit' | 'remaining';
  variables: {
    name: string;
    amount: number;
    dueDate: string;
    bookingRef: string;
    bankDetails: {
      holder: string;
      iban: string;
      bic: string;
    };
  };
}
```

5. **Pre-Stay Information** (New)
```typescript
interface PreStayTemplate {
  variables: {
    name: string;
    checkIn: {
      date: string;
      time: string;
    };
    contact: {
      name: string;
      phone: string;
    };
    parkingInfo: string;
    directions: string;
    houseRules: string[];
  };
}
```

6. **Post-Stay** (New)
```typescript
interface PostStayTemplate {
  variables: {
    name: string;
    stayDates: {
      from: string;
      to: string;
    };
    feedbackLink: string;
    returnDiscount: {
      percentage: number;
      validUntil: string;
    };
  };
}
```

### 3. Minimum Stay Requirements

#### Current State
- Frontend has hardcoded 4-night minimum
- Backend has season-specific requirements:
  - Low season: 3 nights
  - Mid season: 3 nights
  - High season: 5 nights
  - Holiday season: 4 nights

#### Implementation

1. **Frontend Changes**
```typescript
const getMinimumStay = async (startDate: Date): Promise<number> => {
  const { data } = await supabase
    .from('pricing')
    .select('min_nights')
    .lte('start_date', startDate)
    .gte('end_date', startDate)
    .single();
    
  return data?.min_nights || 4; // Default to 4 if no period found
};
```

2. **Validation**
```typescript
const validateStayDuration = (
  startDate: Date,
  endDate: Date,
  minNights: number,
  maxNights: number = 28
): boolean => {
  const nights = differenceInDays(endDate, startDate);
  return nights >= minNights && nights <= maxNights;
};
```

### 4. Booking Display

#### Current State
- New bookings not showing in calendar
- Admin bookings list not updating
- No real-time updates

#### Implementation

1. **Real-time Updates**
```typescript
const useBookingSubscription = () => {
  useEffect(() => {
    const subscription = supabase
      .from('bookings')
      .on('*', payload => {
        console.log('Booking change:', payload);
        // Update local state based on change type
        switch (payload.eventType) {
          case 'INSERT':
            addBooking(payload.new);
            break;
          case 'UPDATE':
            updateBooking(payload.new);
            break;
          case 'DELETE':
            removeBooking(payload.old.id);
            break;
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
```

2. **Booking Reference Display**
```typescript
const BookingReference: React.FC<{ reference: string }> = ({ reference }) => (
  <div className="inline-flex items-center gap-2 px-2 py-1 bg-accent/10 rounded">
    <Hash className="w-4 h-4 text-accent" />
    <code className="text-sm font-mono">{reference}</code>
  </div>
);
```

### 5. Booking Success Page

#### Current State
- Success page breaks layout flow
- Missing booking details
- No email preview

#### Implementation

1. **Success Page Layout**
```typescript
const BookingSuccess = () => {
  const { booking } = useLocation().state;
  
  return (
    <Section variant="secondary">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h1 className="text-3xl font-display mt-4">
              Vielen Dank für Ihre Buchung!
            </h1>
          </div>
          
          {/* Booking Details */}
          <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6">
              <h2 className="font-display text-xl mb-4">
                Ihre Buchungsdetails
              </h2>
              <div className="space-y-2">
                <p>Buchungsnummer: {booking.reference}</p>
                <p>Check-in: {format(booking.startDate)}</p>
                <p>Check-out: {format(booking.endDate)}</p>
                <p>Gesamtpreis: {booking.totalPrice} €</p>
              </div>
            </div>
            
            {/* Payment Instructions */}
            <div className="bg-accent/10 rounded-lg p-6">
              <h2 className="font-display text-xl mb-4">
                Nächste Schritte
              </h2>
              <div className="space-y-4">
                <p>
                  Bitte überweisen Sie die Anzahlung von {booking.depositAmount} € 
                  bis zum {format(booking.depositDueDate)}.
                </p>
                <div className="bg-white rounded p-4">
                  <p>Kontoinhaber: Robert Spennemann</p>
                  <p>IBAN: DE967005 2060 0000 150813</p>
                  <p>BIC: BYLADEM1LLD</p>
                  <p>Verwendungszweck: {booking.reference}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
```

### 6. Discount System

#### Current State
- Discounts not showing in booking process
- No validation of discount conditions
- Missing discount display in admin

#### Implementation

1. **Discount Types**
```typescript
type DiscountType = 'long_stay' | 'early_bird' | 'last_minute';

interface Discount {
  type: DiscountType;
  minValue: number;
  maxValue?: number;
  percentage: number;
  isActive: boolean;
}
```

2. **Discount Validation**
```typescript
const validateDiscount = async (
  startDate: Date,
  endDate: Date,
  discountType: DiscountType
): Promise<Discount | null> => {
  const nights = differenceInDays(endDate, startDate);
  const daysUntilArrival = differenceInDays(startDate, new Date());
  
  const { data } = await supabase
    .from('pricing_discounts')
    .select('*')
    .eq('type', discountType)
    .eq('is_active', true)
    .lte('min_value', 
      discountType === 'long_stay' ? nights : daysUntilArrival
    )
    .gte('max_value', 
      discountType === 'long_stay' ? nights : daysUntilArrival
    )
    .maybeSingle();
    
  return data;
};
```

3. **Price Calculation with Discounts**
```typescript
const calculatePrice = async (
  startDate: Date,
  endDate: Date,
  numGuests: number,
  withRoomSurcharge = false,
  selectedServices: string[] = []
) => {
  // Get base price
  const basePrice = await getBasePrice(startDate, endDate, withRoomSurcharge);
  
  // Check for applicable discounts
  const discounts = await Promise.all([
    validateDiscount(startDate, endDate, 'long_stay'),
    validateDiscount(startDate, endDate, 'early_bird'),
    validateDiscount(startDate, endDate, 'last_minute')
  ]);
  
  // Apply highest discount
  const maxDiscount = discounts
    .filter(Boolean)
    .reduce((max, discount) => 
      discount.percentage > max.percentage ? discount : max
    , { percentage: 0 });
    
  const discountAmount = basePrice * (maxDiscount.percentage / 100);
  
  // Calculate final price
  return {
    basePrice,
    discount: maxDiscount,
    discountAmount,
    totalPrice: basePrice - discountAmount
  };
};
```

## Next Steps

1. **Payment System**
   - [ ] Create payment_settings table
   - [ ] Add admin UI for payment settings
   - [ ] Update payment calculations
   - [ ] Add payment status tracking

2. **Email Templates**
   - [x] Update booking request template
   - [x] Update booking confirmation template
   - [ ] Create payment confirmation templates
   - [ ] Create payment reminder templates
   - [ ] Create pre-stay information template
   - [ ] Create post-stay template

3. **Minimum Stay**
   - [ ] Remove hardcoded frontend value
   - [ ] Implement dynamic minimum stay fetch
   - [ ] Add validation in booking form
   - [ ] Update calendar display

4. **Booking Display**
   - [ ] Add real-time subscriptions
   - [ ] Fix calendar updates
   - [ ] Improve admin booking list
   - [ ] Add booking reference display

5. **Success Page**
   - [ ] Update layout to match site
   - [ ] Add comprehensive booking summary
   - [ ] Add payment instructions
   - [ ] Improve email preview

6. **Discount System**
   - [ ] Implement discount validation
   - [ ] Add discount display
   - [ ] Update price calculations
   - [ ] Improve admin discount management
