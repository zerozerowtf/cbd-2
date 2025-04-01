# Casa di Barbara - Email System Documentation

## Overview

The email system for Casa di Barbara uses Supabase Edge Functions with Nodemailer to handle all email communications. The system supports multiple languages and uses templates stored in the database.

## Architecture

### Components

1. **Frontend Email Client**
   - Located in `src/lib/email.ts`
   - Provides functions for sending emails and testing connections
   - Interfaces with Supabase Edge Functions

2. **Edge Function**
   - Located in `supabase/functions/send-email/`
   - Uses Nodemailer for SMTP communication
   - Handles both test connections and email sending

3. **Database**
   - Email templates stored in `email_templates` table
   - Email logs stored in `email_logs` table

## Configuration

### SMTP Settings

The email system uses Microsoft Exchange SMTP settings:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_FROM=Casa di Barbara <your-email@domain.com>
```

### Email Templates

Templates are stored in the database with translations for all supported languages:
- German (de)
- English (en)
- French (fr)
- Italian (it)

Each template includes:
- Subject lines in all languages
- Body content in all languages
- Type (booking, payment, info)
- Active status flag

## Usage

### Sending Emails

```typescript
import { sendEmail } from '../lib/email';

// Send an email
const result = await sendEmail({
  to: 'recipient@example.com',
  templateId: 'booking_confirmation',
  data: {
    first_name: 'John',
    check_in_date: '2025-06-15',
    // ... other template variables
  },
  language: 'de' // defaults to 'de' if not specified
});
```

### Testing Connection

```typescript
import { testEmailConnection } from '../lib/email';

// Test SMTP connection
const result = await testEmailConnection();
```

## Email Types

### 1. Booking Emails

- **Booking Request** (`booking_request`)
  - Sent immediately after a booking request
  - Includes booking details and next steps

- **Booking Confirmation** (`booking_confirmation`)
  - Sent when admin confirms booking
  - Includes payment instructions

### 2. Payment Emails

- **Payment Confirmation** (`payment_confirmation`)
  - Sent after receiving deposit/payment
  - Includes remaining balance if applicable

### 3. Pre-Stay Emails

- **Arrival Information** (`arrival_info`)
  - Sent 7 days before arrival
  - Includes check-in details and directions

### 4. Post-Stay Emails

- **Thank You** (`post_stay`)
  - Sent 1 day after departure
  - Includes feedback request

## Error Handling

The system includes comprehensive error handling:

1. **Frontend**
   - Validates input before sending
   - Handles network errors
   - Provides user-friendly error messages

2. **Edge Function**
   - Validates SMTP configuration
   - Handles connection errors
   - Logs detailed error information

3. **Logging**
   - All emails are logged in the `email_logs` table
   - Includes success/failure status
   - Stores error messages for troubleshooting

## Testing

The admin interface includes an email testing tool at `/admin/email-test` that allows:
- Testing SMTP connection
- Sending test emails
- Viewing detailed error information

## Security

- All sensitive information (SMTP credentials) stored in Edge Function environment variables
- Email templates and logs protected by Row Level Security (RLS)
- Only authenticated admins can manage templates and view logs

## Maintenance

Regular maintenance tasks:
1. Monitor email logs for failures
2. Update email templates as needed
3. Verify SMTP settings periodically
4. Check spam score of email templates

## Best Practices

1. **Template Management**
   - Keep templates simple and mobile-friendly
   - Test templates in multiple email clients
   - Use variables consistently

2. **Error Handling**
   - Always log errors with context
   - Implement retry logic for transient failures
   - Notify admins of persistent issues

3. **Performance**
   - Use connection pooling
   - Implement rate limiting
   - Monitor email queue length
