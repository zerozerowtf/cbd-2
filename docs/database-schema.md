# Casa di Barbara - Database Schema Documentation

## Overview

This document provides a comprehensive overview of the database schema for the Casa di Barbara vacation rental management system. The database is implemented in PostgreSQL using Supabase and includes tables for managing bookings, guests, pricing, messaging, and content management.

## Table of Contents

1. [Booking System](#booking-system)
   - [bookings](#bookings)
   - [blocked_dates](#blocked_dates)
   - [guests](#guests)

2. [Pricing System](#pricing-system)
   - [pricing](#pricing)
   - [pricing_fees](#pricing_fees)
   - [pricing_discounts](#pricing_discounts)
   - [pricing_vouchers](#pricing_vouchers)
   - [payment_settings](#payment_settings)

3. [Messaging System](#messaging-system)
   - [messages](#messages)
   - [message_replies](#message_replies)

4. [Email System](#email-system)
   - [email_templates](#email_templates)
   - [email_template_parts](#email_template_parts)
   - [email_logs](#email_logs)
   - [smtp_settings](#smtp_settings)

5. [Content Management](#content-management)
   - [blog_posts](#blog_posts)
   - [blog_categories](#blog_categories)
   - [blog_posts_categories](#blog_posts_categories)
   - [events](#events)

6. [System Tables](#system-tables)
   - [users](#users)
   - [audit_log](#audit_log)
   - [rate_limits](#rate_limits)

7. [Views](#views)
   - [booking_details](#booking_details)

8. [Functions and Triggers](#functions-and-triggers)

## Booking System

### bookings

Stores all booking information including status, payment details, and guest preferences.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| start_date | date | Check-in date | `NOT NULL` |
| end_date | date | Check-out date | `NOT NULL` |
| num_adults | integer | Number of adult guests | `NOT NULL`, `CHECK (num_adults > 0 AND num_adults <= 5)` |
| num_children | integer | Number of child guests | `NOT NULL`, `DEFAULT 0`, `CHECK (num_children >= 0 AND num_children <= 3)` |
| special_requests | text | Special requests from guest | |
| status | text | Booking status | `NOT NULL`, `DEFAULT 'pending'`, `CHECK (status IN ('pending', 'confirmed', 'cancelled'))` |
| total_price | numeric(10,2) | Total booking price | `NOT NULL` |
| deposit_amount | numeric(10,2) | Deposit amount | `NOT NULL` |
| deposit_paid | boolean | Whether deposit is paid | `NOT NULL`, `DEFAULT false` |
| remaining_amount | numeric(10,2) | Remaining amount to pay | `NOT NULL` |
| remaining_paid | boolean | Whether remaining amount is paid | `NOT NULL`, `DEFAULT false` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |
| room_surcharge | numeric(10,2) | Extra room surcharge | `NOT NULL`, `DEFAULT 0.00` |
| guest_id | uuid | Reference to guest | `NOT NULL`, `REFERENCES guests(id)` |
| reference | text | Booking reference number | `UNIQUE` |
| selected_services | text[] | Selected optional services | `NOT NULL`, `DEFAULT '{}'` |
| deposit_paid_at | timestamptz | When deposit was paid | |
| remaining_paid_at | timestamptz | When remaining amount was paid | |
| deposit_due_date | date | Deadline for deposit payment | |
| remaining_due_date | date | Deadline for remaining payment | |
| manual_discount_percentage | numeric(5,2) | Manual discount percentage | `NOT NULL`, `DEFAULT 0`, `CHECK (manual_discount_percentage >= 0 AND manual_discount_percentage <= 100)` |
| manual_discount_reason | text | Reason for manual discount | |

**Indexes:**
- `bookings_pkey` (PRIMARY KEY)
- `bookings_reference_key` (UNIQUE)
- `idx_bookings_created_at` (created_at DESC)
- `idx_bookings_dates` (start_date, end_date)
- `idx_bookings_deposit_due` (deposit_due_date)
- `idx_bookings_guest_id` (guest_id)
- `idx_bookings_manual_discount` (manual_discount_percentage)
- `idx_bookings_reference` (reference)
- `idx_bookings_remaining_due` (remaining_due_date)
- `idx_bookings_selected_services` (selected_services)
- `idx_bookings_status` (status)

**Constraints:**
- `dates_check`: `CHECK (end_date > start_date)`
- `min_stay_check`: `CHECK (end_date - start_date >= 4)`
- `max_guests_check`: `CHECK (num_adults + num_children <= CASE WHEN room_surcharge > 0 THEN 6 ELSE 4 END)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `booking_reference_trigger`: Generates unique booking reference
- `calculate_payment_deadlines_trigger`: Sets payment deadlines based on settings
- `check_booking_overlap_trigger`: Prevents double bookings
- `log_booking_changes_trigger`: Logs booking changes and sends notifications
- `update_bookings_updated_at`: Updates the updated_at timestamp
- `update_guest_statistics_trigger`: Updates guest statistics
- `update_payment_status_trigger`: Updates payment status based on changes
- `validate_selected_services_trigger`: Ensures selected services exist

### blocked_dates

Stores dates when the property is unavailable for booking.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| start_date | date | Start of blocked period | `NOT NULL` |
| end_date | date | End of blocked period | `NOT NULL` |
| reason | text | Reason for blocking | |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |

**Indexes:**
- `blocked_dates_pkey` (PRIMARY KEY)
- `idx_blocked_dates_dates` (start_date, end_date)

**Constraints:**
- `dates_check`: `CHECK (end_date > start_date)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table

### guests

Stores guest information for bookings.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| first_name | text | Guest's first name | `NOT NULL` |
| last_name | text | Guest's last name | `NOT NULL` |
| email | text | Guest's email address | `NOT NULL`, `UNIQUE` |
| phone | text | Guest's phone number | |
| preferred_language | text | Preferred language for communications | `DEFAULT 'de'` |
| marketing_consent | boolean | Whether guest consents to marketing | `DEFAULT false` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |
| address_line_1 | text | Address line 1 | |
| city | text | City | |
| zip_code | text | Postal/ZIP code | |
| country | text | Country | |
| customer_number | integer | Customer number | `SERIAL` |
| notes | text | Admin notes about guest | |
| status | text | Guest status | `NOT NULL`, `DEFAULT 'active'`, `CHECK (status IN ('active', 'blocked'))` |
| last_contact | timestamptz | Date of last contact | |
| source | text | How guest found Casa di Barbara | |
| total_stays | integer | Number of completed stays | `DEFAULT 0` |
| total_revenue | numeric(10,2) | Total revenue from guest | `DEFAULT 0.00` |
| average_rating | numeric(3,2) | Average rating given by guest | `CHECK (average_rating >= 0 AND average_rating <= 5)` |

**Indexes:**
- `guests_pkey` (PRIMARY KEY)
- `guests_email_key` (UNIQUE)
- `idx_guests_city` (city)
- `idx_guests_customer_number` (customer_number)
- `idx_guests_email` (email)
- `idx_guests_last_contact` (last_contact)
- `idx_guests_names` (last_name, first_name)
- `idx_guests_status` (status)
- `idx_guests_total_revenue` (total_revenue)
- `idx_guests_total_stays` (total_stays)
- `idx_guests_zip_code` (zip_code)

**Constraints:**
- `guests_average_rating_check`: `CHECK (average_rating >= 0 AND average_rating <= 5)`
- `guests_email_key`: `UNIQUE (email)`
- `guests_status_check`: `CHECK (status IN ('active', 'blocked'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `update_guests_updated_at`: Updates the updated_at timestamp

## Pricing System

### pricing

Defines pricing periods with seasonal rates and stay requirements.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| start_date | date | Start of pricing period | `NOT NULL` |
| end_date | date | End of pricing period | `NOT NULL` |
| season_type | text | Season type | `NOT NULL`, `CHECK (season_type IN ('low', 'mid', 'high', 'holiday'))` |
| base_price | numeric(10,2) | Base price per night | `NOT NULL`, `CHECK (base_price > 0)` |
| room_surcharge | numeric(10,2) | Extra room surcharge | `NOT NULL`, `DEFAULT 30.00`, `CHECK (room_surcharge >= 0)` |
| min_nights | integer | Minimum nights required | `NOT NULL`, `CHECK (min_nights >= 3)` |
| max_nights | integer | Maximum nights allowed | `NOT NULL`, `CHECK (max_nights <= 28)` |
| description | text | Description of pricing period | |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `pricing_pkey` (PRIMARY KEY)
- `idx_pricing_dates` (start_date, end_date)
- `idx_pricing_season` (season_type)

**Constraints:**
- `dates_check`: `CHECK (end_date >= start_date)`
- `nights_check`: `CHECK (max_nights >= min_nights)`
- `pricing_base_price_check`: `CHECK (base_price > 0)`
- `pricing_max_nights_check`: `CHECK (max_nights <= 28)`
- `pricing_min_nights_check`: `CHECK (min_nights >= 3)`
- `pricing_room_surcharge_check`: `CHECK (room_surcharge >= 0)`
- `pricing_season_type_check`: `CHECK (season_type IN ('low', 'mid', 'high', 'holiday'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `log_pricing_changes_trigger`: Logs pricing changes
- `update_pricing_updated_at`: Updates the updated_at timestamp

### pricing_fees

Defines mandatory and optional fees for bookings.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| name | jsonb | Multilingual fee names | `NOT NULL` |
| type | text | Fee type | `NOT NULL`, `CHECK (type IN ('mandatory', 'optional'))` |
| amount | numeric(10,2) | Fee amount | `NOT NULL` |
| calculation_type | text | How fee is calculated | `NOT NULL`, `CHECK (calculation_type IN ('per_stay', 'per_night', 'per_person', 'per_person_night'))` |
| is_active | boolean | Whether fee is active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |
| payment_location | text | Where fee is paid | `NOT NULL`, `DEFAULT 'online'`, `CHECK (payment_location IN ('online', 'on_site'))` |

**Indexes:**
- `pricing_fees_pkey` (PRIMARY KEY)
- `idx_pricing_fees_active` (is_active)
- `idx_pricing_fees_payment_location` (payment_location)
- `idx_pricing_fees_type` (type)

**Constraints:**
- `pricing_fees_calculation_type_check`: `CHECK (calculation_type IN ('per_stay', 'per_night', 'per_person', 'per_person_night'))`
- `pricing_fees_payment_location_check`: `CHECK (payment_location IN ('online', 'on_site'))`
- `pricing_fees_type_check`: `CHECK (type IN ('mandatory', 'optional'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `check_mandatory_fees_trigger`: Ensures at least one mandatory fee is active
- `log_pricing_fees_changes_trigger`: Logs fee changes
- `update_pricing_fees_updated_at`: Updates the updated_at timestamp

### pricing_discounts

Defines discounts for long stays, early bookings, and last-minute bookings.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| type | text | Discount type | `NOT NULL`, `CHECK (type IN ('long_stay', 'early_bird', 'last_minute'))` |
| min_value | integer | Minimum value to qualify | `NOT NULL` |
| max_value | integer | Maximum value to qualify | |
| discount_percentage | numeric(5,2) | Discount percentage | `NOT NULL`, `CHECK (discount_percentage > 0 AND discount_percentage <= 100)` |
| is_active | boolean | Whether discount is active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `pricing_discounts_pkey` (PRIMARY KEY)
- `idx_pricing_discounts_active` (is_active)
- `idx_pricing_discounts_type` (type)

**Constraints:**
- `pricing_discounts_discount_percentage_check`: `CHECK (discount_percentage > 0 AND discount_percentage <= 100)`
- `pricing_discounts_type_check`: `CHECK (type IN ('long_stay', 'early_bird', 'last_minute'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `log_pricing_discounts_changes_trigger`: Logs discount changes
- `update_pricing_discounts_updated_at`: Updates the updated_at timestamp

### pricing_vouchers

Defines promotional vouchers and discount codes.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| code | text | Voucher code | `NOT NULL`, `UNIQUE` |
| description | text | Voucher description | |
| discount_type | text | Type of discount | `NOT NULL`, `CHECK (discount_type IN ('percentage', 'fixed'))` |
| discount_value | numeric(10,2) | Discount amount/percentage | `NOT NULL` |
| min_nights | integer | Minimum nights required | |
| max_nights | integer | Maximum nights allowed | |
| valid_from | date | Start of validity period | `NOT NULL` |
| valid_until | date | End of validity period | |
| max_uses | integer | Maximum number of uses | |
| times_used | integer | Number of times used | `NOT NULL`, `DEFAULT 0` |
| is_active | boolean | Whether voucher is active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `pricing_vouchers_pkey` (PRIMARY KEY)
- `pricing_vouchers_code_key` (UNIQUE)

**Constraints:**
- `pricing_vouchers_code_key`: `UNIQUE (code)`
- `pricing_vouchers_discount_type_check`: `CHECK (discount_type IN ('percentage', 'fixed'))`
- `valid_dates_check`: `CHECK (valid_until IS NULL OR valid_until >= valid_from)`
- `valid_nights_check`: `CHECK ((min_nights IS NULL AND max_nights IS NULL) OR (max_nights IS NULL) OR (max_nights >= min_nights))`

**Triggers:**
- `update_pricing_vouchers_updated_at`: Updates the updated_at timestamp

### payment_settings

Stores payment configuration including deposit percentage and bank details.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| deposit_percentage | integer | Deposit percentage | `NOT NULL`, `DEFAULT 50`, `CHECK (deposit_percentage BETWEEN 0 AND 100)` |
| deposit_due_days | integer | Days to pay deposit | `NOT NULL`, `DEFAULT 7` |
| remaining_due_days | integer | Days before arrival for remaining payment | `NOT NULL`, `DEFAULT 30` |
| bank_holder | text | Bank account holder | `NOT NULL`, `DEFAULT 'Robert Spennemann'` |
| bank_iban | text | Bank IBAN | `NOT NULL`, `DEFAULT 'DE967005 2060 0000 150813'` |
| bank_bic | text | Bank BIC | `NOT NULL`, `DEFAULT 'BYLADEM1LLD'` |
| is_active | boolean | Whether settings are active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `payment_settings_pkey` (PRIMARY KEY)
- `idx_payment_settings_active` (is_active)

**Constraints:**
- `payment_settings_deposit_percentage_check`: `CHECK (deposit_percentage BETWEEN 0 AND 100)`

**Triggers:**
- `ensure_single_active_settings_trigger`: Ensures only one active settings record

## Messaging System

### messages

Stores contact form messages and inquiries.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| name | text | Sender's name | `NOT NULL` |
| email | text | Sender's email | `NOT NULL` |
| subject | text | Message subject | `NOT NULL` |
| message | text | Message content | `NOT NULL` |
| language | text | Message language | `NOT NULL`, `DEFAULT 'de'` |
| is_read | boolean | Whether message is read | `NOT NULL`, `DEFAULT false` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |
| archived | boolean | Whether message is archived | `NOT NULL`, `DEFAULT false` |

**Indexes:**
- `messages_pkey` (PRIMARY KEY)
- `idx_messages_archived` (archived)
- `idx_messages_created` (created_at DESC)
- `idx_messages_created_at` (created_at DESC)
- `idx_messages_is_read` (is_read)

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `update_messages_updated_at`: Updates the updated_at timestamp

### message_replies

Stores replies to contact messages.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| message_id | uuid | Reference to original message | `REFERENCES messages(id) ON DELETE CASCADE` |
| content | text | Reply content | `NOT NULL` |
| sent_at | timestamptz | When reply was sent | `DEFAULT now()` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |

**Indexes:**
- `message_replies_pkey` (PRIMARY KEY)
- `idx_message_replies_message_id` (message_id)
- `idx_message_replies_sent_at` (sent_at DESC)

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table

## Email System

### email_templates

Stores email templates with multilingual content.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| name | text | Template name | `NOT NULL`, `UNIQUE` |
| type | text | Template type | `NOT NULL`, `CHECK (type IN ('booking', 'payment', 'info'))` |
| subject_de | text | German subject | `NOT NULL` |
| subject_en | text | English subject | `NOT NULL` |
| subject_fr | text | French subject | `NOT NULL` |
| subject_it | text | Italian subject | `NOT NULL` |
| body_de | text | German body | `NOT NULL` |
| body_en | text | English body | `NOT NULL` |
| body_fr | text | French body | `NOT NULL` |
| body_it | text | Italian body | `NOT NULL` |
| is_active | boolean | Whether template is active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `email_templates_pkey` (PRIMARY KEY)
- `email_templates_name_key` (UNIQUE)
- `idx_email_templates_active` (is_active)
- `idx_email_templates_name` (name)
- `idx_email_templates_type` (type)

**Constraints:**
- `email_templates_name_key`: `UNIQUE (name)`
- `email_templates_type_check`: `CHECK (type IN ('booking', 'payment', 'info'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `update_email_templates_updated_at`: Updates the updated_at timestamp

### email_template_parts

Stores reusable parts for email templates (headers, footers, etc.).

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| name | text | Part name | `NOT NULL`, `UNIQUE` |
| content_de | text | German content | `NOT NULL` |
| content_en | text | English content | `NOT NULL` |
| content_fr | text | French content | `NOT NULL` |
| content_it | text | Italian content | `NOT NULL` |
| is_active | boolean | Whether part is active | `NOT NULL`, `DEFAULT true` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `email_template_parts_pkey` (PRIMARY KEY)
- `email_template_parts_name_key` (UNIQUE)
- `idx_email_template_parts_active` (is_active)
- `idx_email_template_parts_name` (name)

**Constraints:**
- `email_template_parts_name_key`: `UNIQUE (name)`

**Triggers:**
- `update_email_template_parts_updated_at`: Updates the updated_at timestamp

### email_logs

Logs all sent emails for tracking and troubleshooting.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| template_id | uuid | Reference to template used | `REFERENCES email_templates(id)` |
| recipient_email | text | Recipient's email | `NOT NULL` |
| recipient_name | text | Recipient's name | |
| language | text | Email language | `NOT NULL`, `DEFAULT 'de'` |
| subject | text | Email subject | `NOT NULL` |
| body | text | Email body | `NOT NULL` |
| status | text | Sending status | `NOT NULL`, `CHECK (status IN ('sent', 'failed', 'bounced'))` |
| error_message | text | Error message if failed | |
| sent_at | timestamptz | When email was sent | `DEFAULT now()` |
| booking_id | uuid | Reference to booking | `REFERENCES bookings(id)` |
| message_id | uuid | Reference to message | `REFERENCES messages(id)` |

**Indexes:**
- `email_logs_pkey` (PRIMARY KEY)
- `idx_email_logs_booking_id` (booking_id)
- `idx_email_logs_created` (sent_at DESC)
- `idx_email_logs_status` (status)

**Constraints:**
- `email_logs_status_check`: `CHECK (status IN ('sent', 'failed', 'bounced'))`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table

### smtp_settings

Stores SMTP server configuration for sending emails.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| host | text | SMTP host | `NOT NULL` |
| port | integer | SMTP port | `NOT NULL` |
| username | text | SMTP username | `NOT NULL` |
| password | text | SMTP password | `NOT NULL` |
| from_email | text | From email address | `NOT NULL` |
| from_name | text | From name | `NOT NULL` |
| is_active | boolean | Whether settings are active | `NOT NULL`, `DEFAULT false` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |
| last_tested_at | timestamptz | When settings were last tested | |
| test_result | jsonb | Test result data | |

**Indexes:**
- `smtp_settings_pkey` (PRIMARY KEY)

**Triggers:**
- `update_smtp_settings_updated_at`: Updates the updated_at timestamp

## Content Management

### blog_posts

Stores blog posts with multilingual content.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| slug | text | URL-friendly identifier | `NOT NULL`, `UNIQUE` |
| title | jsonb | Multilingual titles | `NOT NULL` |
| excerpt | jsonb | Multilingual excerpts | `NOT NULL` |
| content | jsonb | Multilingual content | `NOT NULL` |
| cover_image | text | Cover image URL | |
| published_at | timestamptz | When post was published | |
| author_id | uuid | Reference to author | `REFERENCES auth.users(id)` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `blog_posts_pkey` (PRIMARY KEY)
- `blog_posts_slug_key` (UNIQUE)

**Constraints:**
- `blog_posts_slug_key`: `UNIQUE (slug)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `update_blog_posts_updated_at`: Updates the updated_at timestamp

### blog_categories

Stores blog categories with multilingual names.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| name | jsonb | Multilingual category names | `NOT NULL` |
| slug | text | URL-friendly identifier | `NOT NULL`, `UNIQUE` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |

**Indexes:**
- `blog_categories_pkey` (PRIMARY KEY)
- `blog_categories_slug_key` (UNIQUE)

**Constraints:**
- `blog_categories_slug_key`: `UNIQUE (slug)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table

### blog_posts_categories

Junction table linking blog posts to categories.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| post_id | uuid | Reference to blog post | `NOT NULL`, `REFERENCES blog_posts(id) ON DELETE CASCADE` |
| category_id | uuid | Reference to category | `NOT NULL`, `REFERENCES blog_categories(id) ON DELETE CASCADE` |

**Indexes:**
- `blog_posts_categories_pkey` (PRIMARY KEY)

**Constraints:**
- `blog_posts_categories_pkey`: `PRIMARY KEY (post_id, category_id)`

### events

Stores events and activities with multilingual content.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| title | jsonb | Multilingual event titles | `NOT NULL` |
| description | jsonb | Multilingual descriptions | `NOT NULL` |
| location | jsonb | Multilingual locations | `NOT NULL` |
| start_date | date | Event start date | `NOT NULL` |
| end_date | date | Event end date | `NOT NULL` |
| start_time | time | Event start time | |
| end_time | time | Event end time | |
| is_recurring | boolean | Whether event recurs | `DEFAULT false` |
| recurrence_pattern | text | Recurrence pattern | |
| recurrence_end_date | date | End of recurrence | |
| category | text | Event category | `NOT NULL`, `CHECK (category IN ('culture', 'sport', 'food', 'market', 'festival', 'other'))` |
| tags | text[] | Event tags | `DEFAULT '{}'` |
| external_url | text | External event URL | |
| cover_image | text | Cover image URL | |
| published_at | timestamptz | When event was published | |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `events_pkey` (PRIMARY KEY)

**Constraints:**
- `category_check`: `CHECK (category IN ('culture', 'sport', 'food', 'market', 'festival', 'other'))`
- `dates_check`: `CHECK (end_date >= start_date)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table
- `update_events_updated_at`: Updates the updated_at timestamp

## System Tables

### users

Stores user information and roles.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| first_name | text | User's first name | `NOT NULL` |
| last_name | text | User's last name | `NOT NULL` |
| email | text | User's email | `NOT NULL`, `UNIQUE` |
| role | text | User role | `NOT NULL`, `DEFAULT 'user'`, `CHECK (role IN ('user', 'admin'))` |
| is_active | boolean | Whether user is active | `NOT NULL`, `DEFAULT true` |
| last_login | timestamptz | Last login timestamp | |
| preferences | jsonb | User preferences | `DEFAULT '{}'` |
| created_at | timestamptz | Creation timestamp | `DEFAULT now()` |
| updated_at | timestamptz | Last update timestamp | `DEFAULT now()` |

**Indexes:**
- `users_pkey` (PRIMARY KEY)
- `users_email_key` (UNIQUE)
- `idx_users_active` (is_active)
- `idx_users_email` (email)
- `idx_users_last_login` (last_login)
- `idx_users_role` (role)

**Constraints:**
- `users_email_key`: `UNIQUE (email)`
- `users_role_check`: `CHECK (role IN ('user', 'admin'))`

**Triggers:**
- `update_users_updated_at`: Updates the updated_at timestamp

### audit_log

Tracks all changes to important tables for auditing purposes.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| table_name | text | Name of modified table | `NOT NULL` |
| record_id | uuid | ID of modified record | |
| action | text | Action performed | `NOT NULL` |
| old_data | jsonb | Previous data state | |
| new_data | jsonb | New data state | |
| user_id | text | User who made the change | |
| client_info | jsonb | Client information | |
| created_at | timestamptz | When change occurred | `DEFAULT now()` |

**Indexes:**
- `audit_log_pkey` (PRIMARY KEY)
- `idx_audit_log_action` (action)
- `idx_audit_log_created` (created_at DESC)
- `idx_audit_log_table` (table_name)
- `idx_audit_log_user` (user_id)

### rate_limits

Tracks rate limits and blocks for API endpoints.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | uuid | Primary key | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` |
| ip_address | text | IP address of client | `NOT NULL` |
| endpoint | text | API endpoint accessed | `NOT NULL` |
| attempts | integer | Number of attempts | `NOT NULL`, `DEFAULT 1` |
| blocked_until | timestamptz | When block expires | |
| first_attempt | timestamptz | First attempt timestamp | `NOT NULL`, `DEFAULT now()` |
| last_attempt | timestamptz | Last attempt timestamp | `NOT NULL`, `DEFAULT now()` |

**Indexes:**
- `rate_limits_pkey` (PRIMARY KEY)
- `rate_limits_ip_endpoint_key` (UNIQUE)
- `idx_rate_limits_attempts` (attempts)
- `idx_rate_limits_blocked` (blocked_until)
- `idx_rate_limits_cleanup` (last_attempt, blocked_until)
- `idx_rate_limits_endpoint` (endpoint)
- `idx_rate_limits_ip` (ip_address)

**Constraints:**
- `rate_limits_ip_endpoint_key`: `UNIQUE (ip_address, endpoint)`

**Triggers:**
- `audit_trigger`: Logs changes to the audit_log table

## Views

### booking_details

A view that combines booking and guest information for easier querying.

**Columns:**
- All columns from `bookings`
- `first_name` from `guests`
- `last_name` from `guests`
- `email` from `guests`
- `phone` from `guests`
- `preferred_language` from `guests`

**Dependencies:**
- `bookings` table
- `guests` table

## Functions and Triggers

### Key Functions

1. **auth.is_admin()**
   - Checks if the current user has admin role
   - Used in RLS policies to control access

2. **check_booking_overlap()**
   - Prevents double bookings
   - Validates stay duration against pricing rules
   - Sets payment deadlines

3. **log_booking_changes()**
   - Logs booking changes
   - Sends email notifications for status changes
   - Updates payment timestamps

4. **update_guest_statistics()**
   - Updates guest statistics when bookings change
   - Tracks total stays and revenue

5. **log_table_change()**
   - Generic function for audit logging
   - Records all changes to important tables

6. **calculate_payment_deadlines()**
   - Sets deposit and remaining payment deadlines
   - Uses settings from payment_settings table

7. **ensure_single_active_settings()**
   - Ensures only one active payment settings record

8. **update_payment_status()**
   - Updates payment status timestamps
   - Triggers email notifications

9. **set_booking_reference()**
   - Generates unique booking reference numbers
   - Format: CDB + YY + sequential number

10. **validate_selected_services()**
    - Ensures selected services exist in pricing_fees
    - Prevents invalid service selections

11. **update_updated_at()**
    - Updates the updated_at timestamp on record changes
    - Used by multiple tables

12. **sync_user_role_to_claims()**
    - Synchronizes user role to JWT claims
    - Ensures consistent role-based access

### Automated Processes

1. **Payment Reminders**
   - `send_payment_reminders()`: Sends reminders for upcoming payments
   - `handle_booking_cancellation()`: Cancels bookings with overdue payments

2. **Guest Communications**
   - `send_arrival_info()`: Sends arrival information 7 days before check-in
   - `send_post_stay_emails()`: Sends feedback request 1 day after check-out

3. **Rate Limiting**
   - `check_rate_limit()`: Checks if request is within rate limits
   - `reset_rate_limit()`: Resets rate limit after successful authentication
   - `cleanup_rate_limits()`: Removes expired rate limit records

## Row Level Security (RLS)

All tables have Row Level Security (RLS) enabled with the following general pattern:

1. **Public Read Access**
   ```sql
   CREATE POLICY "enable_read_for_all"
     ON table_name
     FOR SELECT
     TO public
     USING (true);
   ```

2. **Public Insert Access** (for bookings, messages, guests)
   ```sql
   CREATE POLICY "enable_insert_for_all"
     ON table_name
     FOR INSERT
     TO public
     WITH CHECK (true);
   ```

3. **Admin Full Access**
   ```sql
   CREATE POLICY "enable_admin_access"
     ON table_name
     FOR ALL
     TO authenticated
     USING (auth.is_admin())
     WITH CHECK (auth.is_admin());
   ```

This ensures that:
- Public users can view necessary data
- Public users can create bookings, messages, and guest profiles
- Only authenticated admins can manage all data
