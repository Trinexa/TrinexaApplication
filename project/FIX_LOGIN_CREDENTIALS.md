# SOLUTION: Fix "Invalid login credentials" Error

## Problem
You're getting "Invalid login credentials" because the admin users don't exist in Supabase Auth yet.

## ✅ EASY SOLUTION (Manual Method)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/aylbhudsotlywossqbkc
2. Click on "Authentication" in the left sidebar
3. Click on "Users" tab

### Step 2: Create Admin Users
Click "Add user" and create these 3 users:

**User 1 - Super Admin:**
```
Email: admin@trinexa.com
Password: Admin123!@#
✓ Confirm email automatically
```

**User 2 - Content Admin:**
```
Email: content@trinexa.com
Password: Content123!@#
✓ Confirm email automatically
```

**User 3 - HR Admin:**
```
Email: hr@trinexa.com
Password: HR123!@#
✓ Confirm email automatically
```

### Step 3: Link Users to Admin Table
1. Go to "SQL Editor" in Supabase dashboard
2. Copy and paste this SQL:

```sql
-- Link auth users to admin_users table
DELETE FROM admin_users WHERE email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com');

INSERT INTO admin_users (id, email, role)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@trinexa.com' THEN 'super_admin'
    WHEN au.email = 'content@trinexa.com' THEN 'content_admin'
    WHEN au.email = 'hr@trinexa.com' THEN 'recruitment_admin'
  END as role
FROM auth.users au
WHERE au.email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com');
```

3. Click "Run" to execute the SQL

### Step 4: Test Login
Now you can login with:
- **Email:** admin@trinexa.com
- **Password:** Admin123!@#

## 🔍 Verify Setup
Run this SQL to check if everything is set up correctly:

```sql
SELECT 
  au.email,
  au.role,
  auth_user.email_confirmed_at IS NOT NULL as email_confirmed
FROM admin_users au
LEFT JOIN auth.users auth_user ON au.id = auth_user.id
WHERE au.email IN ('admin@trinexa.com', 'content@trinexa.com', 'hr@trinexa.com');
```

## 🎉 After Setup
Once complete, you should be able to:
1. Login at `/admin/login`
2. Create message templates
3. Access all admin features
4. Use the QuickLogin modal

## Alternative Methods
If the manual method doesn't work:
1. Use `create_admin_users_step_by_step.sql`
2. Use `create_admin_users_with_service_role.js` (requires service role key)

The manual method is the most reliable and straightforward approach!
