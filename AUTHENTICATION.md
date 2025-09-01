# Authentication System Documentation

## 🔐 How Authentication Works (Fixed Implementation)

### Architecture Overview

```
[User] → [Supabase Auth] → [Database Profile Tables]
         (Handles passwords)  (Stores profile data)
```

### Key Components

1. **Supabase Auth System**
   - Handles all password authentication securely
   - Encrypts and stores passwords
   - Manages sessions and tokens
   - Returns authenticated user with ID

2. **Database Profile Tables**
   - `admin_users` - Admin profiles (NO passwords)
   - `users` - Regular user profiles (NO passwords)
   - Linked to Supabase Auth via user ID

### Authentication Flow

#### 1. User Registration
```typescript
// Step 1: Create auth user (password handled by Supabase)
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Step 2: Create profile record (NO password stored)
await supabase.from('users').insert({
  id: data.user.id,        // Link to auth user
  email: 'user@example.com',
  full_name: 'John Doe',
  role: 'user'
});
```

#### 2. User Login
```typescript
// Step 1: Authenticate with Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Step 2: Get user profile from database
const profile = await supabase.from('users')
  .select('*')
  .eq('id', data.user.id)
  .single();
```

### Database Schema

#### Admin Users Table
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY,              -- Links to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table  
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,              -- Links to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Setup Process

#### Using AdminSetup Component (`/admin/setup`)

1. **Complete Setup** - Automatically creates:
   - Admin: `admin@trinexa.com` / `admin123`
   - Demo User: `demo@user.com` / `demo123`

2. **Test Authentication** - Validates:
   - Admin login flow
   - User login flow
   - Session management

#### Manual Setup Functions

```typescript
// Create admin user
import { createAdminUser } from './utils/setupAdmin';
await createAdminUser('admin@company.com', 'securePassword');

// Create regular user  
import { createRegularUser } from './utils/setupAdmin';
await createRegularUser('user@company.com', 'password', 'Full Name');
```

### Security Benefits

1. **No Password Storage** - Passwords never stored in your database
2. **Encrypted Sessions** - Supabase handles token management
3. **Role-based Access** - Profile tables control permissions
4. **Session Validation** - Built-in token expiration

### Common Issues & Solutions

#### Issue: "Invalid login credentials" (400 error)
**Cause**: No Supabase Auth user exists
**Solution**: Run setup process to create auth users

#### Issue: "Admin account not found"
**Cause**: Profile record missing in admin_users table
**Solution**: Ensure both auth user AND profile record are created

#### Issue: "Database access denied"
**Cause**: RLS policies blocking access
**Solution**: Check Row Level Security settings in Supabase

### Testing Authentication

1. Navigate to `/admin/setup`
2. Click "🚀 Complete Setup"
3. Use test buttons to verify authentication
4. Use created credentials to login

### Production Considerations

1. **Email Confirmation**: Enable in Supabase for production
2. **Password Policies**: Configure in Supabase Auth settings
3. **MFA**: Enable multi-factor authentication
4. **Rate Limiting**: Configure login attempt limits
5. **Session Duration**: Set appropriate token expiration
