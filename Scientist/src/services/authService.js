// API Configuration and Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Response Type
class ApiResponse {
  constructor(status, message, data = null, errors = null) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Helper function to make HTTP requests
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return new ApiResponse(data.status, data.message, data.data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    throw new ApiError(
      'Network error. Please check your connection and try again.',
      0
    );
  }
};

// Authentication API Service
export const authService = {
  /**
   * Register a new scientist user
   * @param {Object} userData - User registration data
   * @returns {Promise<ApiResponse>}
   */
  register: async (userData) => {
    const response = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.mobile, // Backend expects 'phone', frontend has 'mobile'
        role: 'scientist',
        organizationId: userData.orgId
      }),
    });
    return response;
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<ApiResponse>}
   */
  login: async (credentials) => {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: credentials.identifier || credentials.email, // Support both formats
        password: credentials.password
      }),
    });

    // Store token if login successful
    if (response.status === 'success' && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response;
  },

  /**
   * Logout user
   * @returns {Promise<ApiResponse>}
   */
  logout: async () => {
    try {
      const response = await makeRequest('/auth/logout', {
        method: 'POST',
      });
      
      // Always clear local storage, even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('scientistUser');
      
      return response;
    } catch (error) {
      // Clear local storage even if logout API fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('scientistUser');
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<ApiResponse>}
   */
  getProfile: async () => {
    const response = await makeRequest('/auth/profile');
    return response;
  },

  /**
   * Verify token validity
   * @returns {Promise<ApiResponse>}
   */
  verifyToken: async () => {
    const response = await makeRequest('/auth/verify-token');
    return response;
  },

  /**
   * Check if user is authenticated (has valid token)
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get stored auth token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Clear authentication data
   */
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('scientistUser');
  }
};

// Export the ApiError class for error handling in components
export { ApiError };

export default authService;