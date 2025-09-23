import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and verify token
    const initializeAuth = async () => {
      try {
        // Check if there's a saved user in localStorage first
        const savedUser = localStorage.getItem('scientistUser');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('scientistUser');
          }
        }

        if (authService.isAuthenticated()) {
          try {
            // Verify token with backend
            const response = await authService.verifyToken();
            if (response.status === 'success') {
              setUser(response.data.user);
            } else {
              // Token is invalid, clear auth data
              authService.clearAuthData();
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            // Don't clear user data on network errors, just log the error
            console.log('Continuing with cached user data due to network error');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't clear auth data on network errors during initialization
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.status === 'success') {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('scientistUser', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { 
        success: true, 
        message: response.message,
        data: response.data 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.',
        errors: error.errors
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      authService.clearAuthData();
    }
  };

  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.status === 'success') {
        setUser(response.data.user);
        localStorage.setItem('scientistUser', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch profile.' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    getProfile,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
