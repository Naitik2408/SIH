import { Alert } from 'react-native';

// Error types
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    errors?: string[];
}

// Common error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials.',
    EMAIL_EXISTS: 'An account with this email already exists.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. Please contact support.',
    NOT_FOUND: 'The requested resource was not found.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Error handler utility
export class ErrorHandler {
    static handle(error: any, showAlert = true): string {
        let message = ERROR_MESSAGES.GENERIC_ERROR;

        if (error?.message) {
            // Use the error message if it's meaningful
            if (error.message.includes('network') || error.message.includes('fetch')) {
                message = ERROR_MESSAGES.NETWORK_ERROR;
            } else if (error.message.includes('timeout')) {
                message = ERROR_MESSAGES.TIMEOUT_ERROR;
            } else if (error.message.includes('Invalid email or password')) {
                message = ERROR_MESSAGES.INVALID_CREDENTIALS;
            } else if (error.message.includes('already exists')) {
                message = ERROR_MESSAGES.EMAIL_EXISTS;
            } else if (error.message.includes('validation')) {
                message = ERROR_MESSAGES.VALIDATION_ERROR;
            } else {
                message = error.message;
            }
        }

        // Handle HTTP status codes
        if (error?.status) {
            switch (error.status) {
                case 400:
                    message = error.message || ERROR_MESSAGES.VALIDATION_ERROR;
                    break;
                case 401:
                    message = ERROR_MESSAGES.INVALID_CREDENTIALS;
                    break;
                case 403:
                    message = ERROR_MESSAGES.FORBIDDEN;
                    break;
                case 404:
                    message = ERROR_MESSAGES.NOT_FOUND;
                    break;
                case 409:
                    message = ERROR_MESSAGES.EMAIL_EXISTS;
                    break;
                case 500:
                    message = ERROR_MESSAGES.SERVER_ERROR;
                    break;
                default:
                    message = error.message || ERROR_MESSAGES.GENERIC_ERROR;
            }
        }

        if (showAlert) {
            Alert.alert('Error', message);
        }

        return message;
    }

    static handleValidation(errors: string[]): string {
        const message = errors.length > 1
            ? `Please fix the following issues:\n${errors.map(err => `• ${err}`).join('\n')}`
            : errors[0] || ERROR_MESSAGES.VALIDATION_ERROR;

        return message;
    }
}

// Network status utility
export class NetworkUtils {
    static async checkConnection(): Promise<boolean> {
        try {
            // Simple connectivity check
            const response = await fetch('https://www.google.com', {
                method: 'HEAD',
                cache: 'no-cache',
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    static async waitForConnection(timeout = 10000): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (await this.checkConnection()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return false;
    }
}

// Validation utilities
export class ValidationUtils {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone: string): boolean {
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
        return phoneRegex.test(phone);
    }

    static isValidPassword(password: string): { valid: boolean; message?: string } {
        if (!password) {
            return { valid: false, message: 'Password is required' };
        }
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        return { valid: true };
    }

    static validateSignupData(data: any): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.name?.trim()) {
            errors.push('Name is required');
        }

        if (!data.email && !data.phone) {
            errors.push('Email or phone number is required');
        }

        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Please enter a valid phone number');
        }

        const passwordValidation = this.isValidPassword(data.password);
        if (!passwordValidation.valid) {
            errors.push(passwordValidation.message!);
        }

        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
