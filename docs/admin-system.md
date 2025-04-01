# Admin System Documentation

## Overview

The admin system in Casa di Barbara uses Supabase's Row Level Security (RLS) policies and JWT claims to manage access control. This document explains how the system works and how to maintain it.

## Admin Role Management

### User Setup

Admin users are identified by the `role` claim in their JWT token. This can be set in multiple locations:

```sql
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'first_name', 'Robert',
    'last_name', 'Spennemann'
  ),
  raw_app_meta_data = jsonb_build_object(
    'role', 'admin',
    'claims', jsonb_build_object('role', 'admin')
  )
WHERE email = 'admin@example.com';
```

### Admin Check Function

The system uses a centralized admin check function:

```sql
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
DECLARE
  claims jsonb;
BEGIN
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  
  RETURN coalesce(
    claims->>'role' = 'admin' OR
    claims->'app_metadata'->>'role' = 'admin' OR
    claims->'user_metadata'->>'role' = 'admin',
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security (RLS) Policies

### Standard Policy Pattern

Each table follows this pattern for RLS policies:

1. Public read access:
```sql
CREATE POLICY "enable_read_for_all"
  ON table_name
  FOR SELECT
  TO public
  USING (true);
```

2. Admin full access:
```sql
CREATE POLICY "enable_admin_access"
  ON table_name
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM auth.is_admin()))
  WITH CHECK ((SELECT is_admin FROM auth.is_admin()));
```

### Tables with RLS

The following tables have RLS enabled:

1. Pricing System
   - `pricing`
   - `pricing_fees`
   - `pricing_discounts`

2. Booking System
   - `bookings`
   - `blocked_dates`

3. Messaging System
   - `messages`
   - `message_replies`

4. Email System
   - `email_templates`

### Special Cases

Some tables have additional policies for public insert access:

```sql
CREATE POLICY "enable_insert_for_all"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);
```

This is used for tables like `bookings` and `messages` where non-authenticated users need to create records.

## Frontend Integration

### Checking Admin Status

The frontend uses the `useAuth` hook to check admin status:

```typescript
const { isAuthenticated, user } = useAuth();
const isAdmin = user?.role === 'admin';
```

### Protected Routes

Admin routes are protected using the `PrivateRoute` component:

```typescript
<Route
  path="/admin/*"
  element={
    <PrivateRoute>
      <AdminLayout />
    </PrivateRoute>
  }
/>
```

## Maintenance

### Adding New Tables

When adding new tables that need admin access:

1. Enable RLS:
```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

2. Create standard policies:
```sql
-- Public read access
CREATE POLICY "enable_read_for_all"
  ON new_table
  FOR SELECT
  TO public
  USING (true);

-- Admin full access
CREATE POLICY "enable_admin_access"
  ON new_table
  FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM auth.is_admin()))
  WITH CHECK ((SELECT is_admin FROM auth.is_admin()));
```

### Troubleshooting

Common issues and solutions:

1. Admin can't modify data:
   - Check if user has proper role in JWT claims
   - Verify RLS policies are correctly created
   - Test admin check function directly

2. Public can't read data:
   - Verify "enable_read_for_all" policy exists
   - Check RLS is enabled on the table
   - Ensure no conflicting policies exist

3. JWT claims not updating:
   - Force refresh the session
   - Update both user_metadata and app_metadata
   - Clear browser storage and re-login

## Security Considerations

1. Always use the `auth.is_admin()` function for admin checks
2. Never bypass RLS with service_role key in frontend code
3. Keep admin role assignment in secure backend processes
4. Regularly audit admin access and permissions
5. Monitor failed admin access attempts

## Performance

The system includes optimized indexes for common queries:

```sql
CREATE INDEX IF NOT EXISTS idx_pricing_dates ON pricing(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pricing_season ON pricing(season_type);
CREATE INDEX IF NOT EXISTS idx_pricing_fees_active ON pricing_fees(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_fees_type ON pricing_fees(type);
```

Consider adding additional indexes based on query patterns.
