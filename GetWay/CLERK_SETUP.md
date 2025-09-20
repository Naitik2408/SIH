# 🔐 Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the GetWay React Native app.

## 📋 Prerequisites

- Node.js installed
- Expo CLI installed (`npm install -g @expo/cli`)
- A Clerk account (free at [clerk.com](https://clerk.com))

## 🚀 Quick Setup

### 1. Create a Clerk Application

1. Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up or log in to your Clerk account
3. Click "Add application"
4. Choose a name for your app (e.g., "GetWay")
5. Select the authentication providers you want to enable:
   - **Email & Password** (recommended)
   - **Google** (optional)
   - **GitHub** (optional)
   - **Apple** (for iOS, optional)

### 2. Get Your API Keys

1. In your Clerk dashboard, go to **"API Keys"**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure Environment Variables

1. In your project root, copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your actual Clerk keys:
   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

### 4. Install Dependencies

The required dependencies are already in package.json. If you need to install them:

```bash
npm install --legacy-peer-deps
```

### 5. Run the App

```bash
npm start
```

## 🎯 Features

### Authentication Screens

- **Sign In**: Email/password authentication with error handling
- **Sign Up**: User registration with email verification
- **Email Verification**: Automatic verification code sending and validation

### User Management

- **Role-based Access**: Automatic role assignment (customer/owner)
- **Secure Sessions**: JWT tokens stored securely with Expo SecureStore
- **Logout**: Complete session cleanup

### Role Determination

The app automatically assigns user roles based on:

1. **User Metadata**: Set via Clerk dashboard or API
2. **Email Domain**: Admin domains like `@getway-admin.com`
3. **Specific Emails**: Predefined admin emails
4. **Default**: All other users become customers

## 🔧 Customization

### Adding Custom User Roles

Edit `/src/utils/auth.ts` to modify role determination logic:

```typescript
export const determineUserRole = (clerkUser: any): 'customer' | 'owner' => {
    // Add your custom logic here
    if (clerkUser.publicMetadata?.role === 'admin') {
        return 'owner';
    }
    
    // Check email domain
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    if (email.endsWith('@yourcompany.com')) {
        return 'owner';
    }
    
    return 'customer';
};
```

### Adding Social Login

1. In Clerk dashboard, enable social providers
2. Configure OAuth applications (Google, GitHub, etc.)
3. Add social login buttons to SignInScreen.tsx:

```typescript
import { useOAuth } from '@clerk/clerk-expo';

const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

// Add button
<TouchableOpacity onPress={() => startOAuthFlow()}>
    <Text>Sign in with Google</Text>
</TouchableOpacity>
```

## 🏗️ App Structure

```
src/
├── components/
│   └── AppContent.tsx          # Main app component with auth state
├── providers/
│   └── ClerkProvider.tsx       # Clerk provider configuration
├── screens/
│   └── auth/
│       ├── SignInScreen.tsx    # Sign in form
│       ├── SignUpScreen.tsx    # Sign up form with verification
│       └── index.ts            # Auth screen exports
├── utils/
│   └── auth.ts                 # Authentication utilities
└── App.tsx                     # Root component
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file to version control
2. **Token Storage**: Uses Expo SecureStore for secure token storage
3. **JWT Verification**: Server should verify JWT tokens on each request
4. **Role Validation**: Always validate user roles on the backend

## 🐛 Troubleshooting

### Common Issues

**"Missing Publishable Key" Error**
- Ensure `.env` file exists in project root
- Check that key starts with `pk_test_`
- Restart Expo development server

**Authentication Not Working**
- Verify internet connection
- Check Clerk dashboard for API key status
- Clear Expo cache: `expo start --clear`

**Role Assignment Issues**
- Check user metadata in Clerk dashboard
- Verify email domain logic in `auth.ts`
- Test with different email addresses

### Debug Mode

Add console logs to debug authentication flow:

```typescript
// In AppContent.tsx
console.log('Auth state:', { isSignedIn, isLoaded: authLoaded });
console.log('Clerk user:', clerkUser);
console.log('App user:', currentUser);
```

## 🚀 Next Steps

### Backend Integration

When you create your Node/Express backend:

1. Install Clerk Node SDK: `npm install @clerk/clerk-sdk-node`
2. Verify JWT tokens on protected routes
3. Create user profiles in MongoDB using `clerkUserId`

### Example Backend Middleware:

```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

app.get('/api/user-profile', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId; // Clerk user ID
    // Query MongoDB using userId
    const profile = await UserProfile.findOne({ clerkUserId: userId });
    res.json(profile);
});
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Expo + Clerk Guide](https://clerk.com/docs/quickstarts/expo)
- [React Native Best Practices](https://reactnative.dev/docs/security)

## 💡 Tips

- Test authentication with different email providers
- Use Clerk's user management dashboard for testing
- Set up webhook endpoints for user events
- Consider implementing password reset functionality
- Add biometric authentication for better UX
