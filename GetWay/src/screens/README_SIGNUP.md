# Signup Screen Documentation

A comprehensive signup screen with a multi-step carousel for collecting user information and creating new accounts.

## Features

### 1. Initial Form
- **Email/Phone Input**: Users can enter either email or phone number
- **Password Fields**: Password and confirm password with validation
- **Validation**: Real-time validation for password matching and length
- **Continue Button**: Proceeds to carousel after validation

### 2. Multi-Step Carousel
A smooth, animated carousel with 8 steps collecting essential user information:

#### Step 1: Name
- Text input for user's full name
- Manual navigation using Next button
- Required field

#### Step 2: Age
- Numeric input for user's age
- Manual navigation using Next button
- Required field

#### Step 3: Gender
- Multiple choice selection:
  - Male
  - Female
  - Other
  - Prefer not to say
- Manual navigation using Next button
- Required field

#### Step 4: Occupation
- Multiple choice selection:
  - Student
  - Employee
  - Homemaker
  - Retired
  - Self-employed
  - Unemployed
  - Other
- Manual navigation using Next button
- Required field

#### Step 5: Household Size
- Numeric input for number of people in household
- Manual navigation using Next button
- Required field

#### Step 6: Vehicle Ownership
- Interactive counters for:
  - Cars (with car icon)
  - Two Wheelers (with bicycle icon)
  - Cycles (with bicycle icon)
- Plus/minus buttons to adjust counts
- Required field (can be 0)

#### Step 7: Public Transport Usage
- Yes/No selection with icons:
  - Yes (checkmark icon)
  - No (close icon)
- Manual navigation using Next button
- Required field

#### Step 8: Income Range (Optional)
- Multiple choice selection:
  - Below ₹25,000
  - ₹25,000 - ₹50,000
  - ₹50,000 - ₹1,00,000
  - ₹1,00,000 - ₹2,00,000
  - ₹2,00,000 - ₹5,00,000
  - Above ₹5,00,000
  - Prefer not to say
- "Skip this question" option
- Optional field

### 3. Navigation Features
- **Progress Bar**: Visual indicator showing current step and progress
- **Step Counter**: "X of Y" display
- **Back Navigation**: Arrow button to go to previous step
- **Close Button**: Option to exit signup process
- **Manual Navigation**: Users control progression with Next button

### 4. User Experience
- **Smooth Animations**: Fade transitions between steps
- **Responsive Design**: Works on different screen sizes
- **Keyboard Handling**: Proper keyboard avoidance
- **Toast Notifications**: Success/error messages instead of alerts
- **Visual Feedback**: Selected states and hover effects

### 5. Validation & Completion
- **Form Validation**: Checks all required fields before signup
- **Success Notification**: Toast message on successful account creation
- **Auto-Redirect**: Automatically navigates to home screen after success
- **Error Handling**: User-friendly error messages

## Technical Implementation

### State Management
```typescript
interface SignupData {
    emailOrPhone: string;
    password: string;
    confirmPassword: string;
    name: string;
    age: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
    occupation: 'student' | 'employee' | 'homemaker' | 'retired' | 'self-employed' | 'unemployed' | 'other' | '';
    householdSize: string;
    vehicleOwnership: {
        cars: string;
        twoWheelers: string;
        cycles: string;
    };
    usesPublicTransport: boolean | null;
    incomeRange: string;
}
```

### Carousel Steps Configuration
Each step is defined with:
- `id`: Unique identifier
- `title`: Main question text
- `subtitle`: Helper text
- `field`: Corresponding data field
- `type`: Input type (text, select, number, boolean, vehicles, income)
- `options`: Available choices for select types
- `required`: Whether field is mandatory

### Animation System
- Uses React Native Animated API
- Smooth fade transitions between steps
- Horizontal scrolling with pagination
- Progress bar animation

## Usage

```tsx
import SignupScreen from './screens/SignupScreen';

// In your app:
<SignupScreen 
    onSignupSuccess={() => {
        // Handle successful signup
        navigateToHome();
    }}
    onBack={() => {
        // Handle back to login
        navigateToLogin();
    }}
/>
```

## Integration

The signup screen integrates seamlessly with the existing app structure:
1. Called from login screen via "Sign Up" button
2. Collects comprehensive user profile data
3. Creates user account with proper typing
4. Redirects to customer dashboard on success
5. Provides option to return to login screen

## Components Used

- **Toast**: Custom notification component for user feedback
- **CustomBottomTabBar**: Consistent with app's navigation
- **Ionicons**: Vector icons for visual elements
- **KeyboardAvoidingView**: Proper keyboard handling
- **ScrollView**: Smooth scrolling experiences

The signup screen provides a modern, user-friendly onboarding experience that collects essential data for the GetWay platform while maintaining excellent UX principles.
