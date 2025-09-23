import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV_CONFIG, { validateEnvConfig, logEnvConfig } from '../config/env';

// Initialize environment configuration
validateEnvConfig();
logEnvConfig();

// API Configuration from environment
export const API_CONFIG = {
    BASE_URL: ENV_CONFIG.getApiUrl(),
    TIMEOUT: ENV_CONFIG.API_TIMEOUT,
};

// Storage keys from environment
export const STORAGE_KEYS = ENV_CONFIG.STORAGE_KEYS;

// Common headers
const getHeaders = async (includeAuth = true) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (includeAuth) {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    return headers;
};

// API Response interface
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message: string;
    data?: T;
    errors?: string[];
}

// Generic API request function
export const apiRequest = async <T = any>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        body?: any;
        includeAuth?: boolean;
        timeout?: number;
    } = {}
): Promise<ApiResponse<T>> => {
    const {
        method = 'GET',
        body,
        includeAuth = true,
        timeout = API_CONFIG.TIMEOUT,
    } = options;

    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const headers = await getHeaders(includeAuth);

        const config: RequestInit = {
            method,
            headers,
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(body);
        }

        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
            const error = {
                message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                errors: responseData.errors,
            };
            throw error;
        }

        return responseData;
    } catch (error: any) {
        console.error('API Request Error:', error);

        if (error.name === 'AbortError') {
            const timeoutError = {
                message: 'Request timeout. Please check your internet connection.',
                code: 'TIMEOUT_ERROR',
            };
            throw timeoutError;
        }

        // Handle network errors
        if (error.message === 'Network request failed' || error.code === 'NETWORK_ERROR') {
            const networkError = {
                message: 'No internet connection. Please check your network.',
                code: 'NETWORK_ERROR',
            };
            throw networkError;
        }

        // Re-throw API errors with status codes
        if (error.status) {
            throw error;
        }

        // Generic error
        throw {
            message: error.message || 'An unexpected error occurred',
            code: 'GENERIC_ERROR',
        };
    }
};

// Token management
export const TokenManager = {
    async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    async setUser(user: any): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    async getUser(): Promise<any | null> {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    },

    async removeUser(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    },

    async clearAll(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.REFRESH_TOKEN,
        ]);
    },
};
