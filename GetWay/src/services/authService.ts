import { apiRequest, TokenManager, ApiResponse } from './api';

// Authentication interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'customer' | 'scientist';
    organizationId?: string;
    // Profile data
    age?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    occupation?: 'student' | 'employee' | 'homemaker' | 'retired' | 'self-employed' | 'unemployed' | 'other';
    householdSize?: string;
    vehicleOwnership?: {
        cars: string;
        twoWheelers: string;
        cycles: string;
    };
    usesPublicTransport?: boolean;
    incomeRange?: 'below-25k' | '25k-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'above-500k' | 'prefer-not-to-say';
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'scientist' | 'owner';
    organizationId?: string;
    isApproved: boolean;
    lastLogin?: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export interface UserProfile {
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    occupation?: 'student' | 'employee' | 'homemaker' | 'retired' | 'self-employed' | 'unemployed' | 'other';
    householdSize?: number;
    householdIncome?: 'below-25k' | '25k-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'above-500k' | 'prefer-not-to-say';
    vehicleOwnership?: {
        cars?: number;
        twoWheelers?: number;
        cycles?: number;
    };
    usesPublicTransport?: boolean;
}

class AuthService {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response: ApiResponse<AuthResponse> = await apiRequest('/auth/login', {
                method: 'POST',
                body: credentials,
                includeAuth: false,
            });

            if (response.status === 'success' && response.data) {
                // Store token and user data
                await TokenManager.setToken(response.data.token);
                await TokenManager.setUser(response.data.user);

                return response.data;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    }

    /**
     * Register new user (customer)
     */
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            // Convert profile data to the format expected by backend
            const registerData = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone,
                role: userData.role || 'customer',
                organizationId: userData.organizationId,
                // Include profile data in the registration
                profile: {
                    age: userData.age ? parseInt(userData.age) : undefined,
                    gender: userData.gender,
                    occupation: userData.occupation,
                    householdSize: userData.householdSize ? parseInt(userData.householdSize) : undefined,
                    incomeRange: userData.incomeRange,
                    vehicleOwnership: userData.vehicleOwnership ? {
                        cars: parseInt(userData.vehicleOwnership.cars),
                        twoWheelers: parseInt(userData.vehicleOwnership.twoWheelers),
                        cycles: parseInt(userData.vehicleOwnership.cycles),
                    } : undefined,
                    usesPublicTransport: userData.usesPublicTransport,
                }
            };

            const response: ApiResponse<AuthResponse> = await apiRequest('/auth/register', {
                method: 'POST',
                body: registerData,
                includeAuth: false,
            });

            if (response.status === 'success' && response.data) {
                // For customers, store token and user data
                if (response.data.token) {
                    await TokenManager.setToken(response.data.token);
                    await TokenManager.setUser(response.data.user);
                }

                return response.data;
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            // Call logout endpoint if token exists
            const token = await TokenManager.getToken();
            if (token) {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
        } finally {
            // Always clear local storage
            await TokenManager.clearAll();
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<AuthUser> {
        try {
            const response: ApiResponse<{ user: AuthUser }> = await apiRequest('/auth/profile', {
                method: 'GET',
            });

            if (response.status === 'success' && response.data) {
                // Update stored user data
                await TokenManager.setUser(response.data.user);
                return response.data.user;
            } else {
                throw new Error(response.message || 'Failed to get profile');
            }
        } catch (error: any) {
            console.error('Get profile error:', error);
            throw new Error(error.message || 'Failed to get profile');
        }
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await TokenManager.getToken();
        return !!token;
    }

    /**
     * Get stored user data
     */
    async getCurrentUser(): Promise<AuthUser | null> {
        return await TokenManager.getUser();
    }

    /**
     * Refresh user data from server
     */
    async refreshUserData(): Promise<AuthUser> {
        return await this.getProfile();
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
