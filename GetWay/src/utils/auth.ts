import { User } from '../types';

/**
 * Determines the user role based on Clerk user data
 * This function can be extended to support more complex role logic
 */
export const determineUserRole = (clerkUser: any): 'customer' | 'owner' => {
    // Method 1: Check user metadata (set during onboarding or admin assignment)
    if (clerkUser.publicMetadata?.role === 'owner') {
        return 'owner';
    }
    
    // Method 2: Check email domain for admin users
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    if (email.endsWith('@getway-admin.com') || email.endsWith('@admin.getway.com')) {
        return 'owner';
    }
    
    // Method 3: Check for specific admin emails (for demo/testing)
    const adminEmails = [
        'admin@getway.com',
        'owner@getway.com',
        'manager@getway.com'
    ];
    if (adminEmails.includes(email.toLowerCase())) {
        return 'owner';
    }
    
    // Default to customer for all other users
    return 'customer';
};

/**
 * Converts a Clerk user to our app's User type
 */
export const createAppUser = (clerkUser: any): User => {
    return {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        role: determineUserRole(clerkUser),
    };
};

/**
 * Sets user role in Clerk metadata (for admin use)
 * This would typically be called from an admin interface or during onboarding
 */
export const setUserRole = async (clerkUser: any, role: 'customer' | 'owner') => {
    try {
        await clerkUser.update({
            publicMetadata: {
                ...clerkUser.publicMetadata,
                role: role,
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        return false;
    }
};

/**
 * Authentication error messages for better UX
 */
export const getAuthErrorMessage = (error: any): string => {
    if (!error?.errors || !Array.isArray(error.errors) || error.errors.length === 0) {
        return 'An unexpected error occurred. Please try again.';
    }
    
    const errorCode = error.errors[0]?.code;
    const errorMessage = error.errors[0]?.message;
    
    switch (errorCode) {
        case 'form_identifier_not_found':
            return 'No account found with this email address.';
        case 'form_password_incorrect':
            return 'Incorrect password. Please try again.';
        case 'form_password_pwned':
            return 'This password has been compromised. Please choose a different password.';
        case 'form_password_length_too_short':
            return 'Password must be at least 8 characters long.';
        case 'form_identifier_exists':
            return 'An account with this email already exists.';
        case 'verification_failed':
            return 'Verification failed. Please check your code and try again.';
        case 'verification_expired':
            return 'Verification code has expired. Please request a new one.';
        default:
            return errorMessage || 'An error occurred. Please try again.';
    }
};
