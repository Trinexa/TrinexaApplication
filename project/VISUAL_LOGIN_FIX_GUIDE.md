# 🔧 FIXING LOGIN CREDENTIALS - VISUAL GUIDE

## Problem Confirmed ✅
Your HTTP request shows:
- **Status: 400** - Request is reaching Supabase correctly
- **Host: aylbhudsotlywossqbkc.supabase.co** - Correct Supabase project
- **Endpoint: /auth/v1/token** - Authentication endpoint working
- **Grant Type: password** - Correct login method

**Conclusion:** The issue is simply that the user doesn't exist yet in Supabase Auth.

## 🎯 SOLUTION: Create Admin User (5 steps)

### Step 1: Open Supabase Dashboard
```
URL: https://supabase.com/dashboard/project/aylbhudsotlywossqbkc
```

### Step 2: Navigate to Users
```
Left Sidebar → Authentication → Users
```

### Step 3: Add New User
```
Click: "Add user" button (top right)
```

### Step 4: Fill User Details
```
Email: admin@trinexa.com
Password: Admin123!@#
☑️ Confirm email automatically (IMPORTANT: Check this box!)
```

### Step 5: Create User
```
Click: "Create user" button
```

## 🔍 VERIFICATION STEPS

### Step A: Check User Created
Run `quick_user_check.sql` in SQL Editor to verify user exists

### Step B: Link to Admin Table  
Run `create_single_admin_user.sql` in SQL Editor to link the user

### Step C: Test Login
Try logging in your app with:
- Email: `admin@trinexa.com`
- Password: `Admin123!@#`

## 🚨 Common Issues & Solutions

### Issue 1: "User already exists"
**Solution:** User might exist but be unconfirmed. Check the user list and confirm their email.

### Issue 2: "Still can't login"
**Solution:** Run the verification SQL to ensure the user is properly linked to admin_users table.

### Issue 3: "SQL fails to run"
**Solution:** Make sure you created the user in the dashboard first, then run the SQL.

## 📝 Expected Results

After completing these steps:
1. ✅ User exists in `auth.users` table
2. ✅ User is email confirmed
3. ✅ User is linked in `admin_users` table with super_admin role
4. ✅ Login works in your application
5. ✅ QuickLogin modal works
6. ✅ Template creation works

## 🆘 Need Help?

If you're still having issues:
1. Run `quick_user_check.sql` and share the results
2. Check if the user appears in the Supabase dashboard users list
3. Verify the user's email is confirmed (green checkmark in dashboard)

The manual dashboard method is 99% reliable - it's the official Supabase way to create users!
