import { Platform } from 'react-native';

// Environment configuration for GetWay app
export const ENV_CONFIG = {
    // API Configuration
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',

    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),

    // App Configuration
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'GetWay',
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    APP_ENVIRONMENT: process.env.EXPO_PUBLIC_APP_ENVIRONMENT || 'development',

    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: process.env.EXPO_PUBLIC_JWT_STORAGE_KEY || 'getway_auth_token',
        USER: process.env.EXPO_PUBLIC_USER_STORAGE_KEY || 'getway_user_data',
        REFRESH_TOKEN: process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY || 'getway_refresh_token',
    },

    // Demo Mode
    ENABLE_DEMO_MODE: process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true',
    DEMO_FALLBACK: process.env.EXPO_PUBLIC_DEMO_FALLBACK === 'true',

    // Feature Flags
    FEATURES: {
        LOCATION_TRACKING: process.env.EXPO_PUBLIC_ENABLE_LOCATION_TRACKING === 'true',
        OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
        BIOMETRIC_AUTH: process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true',
        DARK_MODE: process.env.EXPO_PUBLIC_ENABLE_DARK_MODE === 'true',
    },

    // Debug Configuration
    DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',

    // External Services (for future use)
    SERVICES: {
        GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
        ANALYTICS_ID: process.env.EXPO_PUBLIC_ANALYTICS_ID,
        SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    },

    // Helper functions
    isDevelopment: () => process.env.EXPO_PUBLIC_APP_ENVIRONMENT === 'development',
    isProduction: () => process.env.EXPO_PUBLIC_APP_ENVIRONMENT === 'production',

    // Get API URL based on platform and environment
    getApiUrl: () => {
        if (Platform.OS === 'ios') {
            return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
        } else if (Platform.OS === 'android') {
            return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000/api';
        }
        return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    },
};

// Validate required environment variables
export const validateEnvConfig = () => {
    const requiredVars = [
        'EXPO_PUBLIC_API_BASE_URL',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0 && ENV_CONFIG.isProduction()) {
        console.warn('Missing required environment variables:', missing);
    }
};

// Development helpers
export const logEnvConfig = () => {
    if (ENV_CONFIG.DEBUG_MODE) {
        console.log('🔧 Environment Configuration:', {
            API_BASE_URL: ENV_CONFIG.API_BASE_URL,
            APP_ENVIRONMENT: ENV_CONFIG.APP_ENVIRONMENT,
            FEATURES: ENV_CONFIG.FEATURES,
            PLATFORM: Platform.OS,
        });
    }
};

export default ENV_CONFIG;
