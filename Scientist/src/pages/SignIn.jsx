import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Mail, Building, Lock, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Changed back to support both email and orgId
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loginType, setLoginType] = useState('email'); // 'email', 'phone', or 'orgId'

  useEffect(() => {
    // Show success message if coming from signup
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-detect if input looks like email, phone, or org ID
    if (name === 'identifier') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
      
      if (emailRegex.test(value)) {
        setLoginType('email');
      } else if (phoneRegex.test(value.replace(/\s+/g, ''))) {
        setLoginType('phone');
      } else {
        setLoginType('orgId');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Identifier validation (email, phone, or org ID)
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email, Phone Number, or Organization ID is required';
    } else if (loginType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.identifier)) {
        newErrors.identifier = 'Please enter a valid email address';
      }
    } else if (loginType === 'phone') {
      const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
      if (!phoneRegex.test(formData.identifier.replace(/\s+/g, ''))) {
        newErrors.identifier = 'Please enter a valid Indian phone number';
      }
    } else if (formData.identifier.trim().length < 3) {
      newErrors.identifier = 'Organization ID must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await login({
        identifier: formData.identifier,
        password: formData.password
      });
      
      if (result.success) {
        // Redirect to the intended page or dashboard
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    alert('Forgot password functionality will be implemented here');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-slide-in-up">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-800">Welcome Back</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Sign in to your scientist account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email, Phone, or Organization ID Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-semibold text-slate-700">
                Email, Phone Number, or Organization ID
              </Label>
              <div className="relative">
                {loginType === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                ) : loginType === 'phone' ? (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                ) : (
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                )}
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Enter email, phone number, or organization ID"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className={`pl-11 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.identifier 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="text-sm text-red-600 font-medium">{errors.identifier}</p>
              )}
              <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  loginType === 'email' ? 'bg-blue-500' : 
                  loginType === 'phone' ? 'bg-green-500' : 'bg-purple-500'
                }`}></div>
                <p className="text-xs text-slate-500 font-medium">
                  {loginType === 'email' 
                    ? 'Detected as email address' 
                    : loginType === 'phone'
                    ? 'Detected as phone number'
                    : 'Detected as organization ID'
                  }
                </p>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-11 pr-12 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.password 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 font-medium">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-base pt-4">
              <span className="text-slate-600">Don't have an account? </span>
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
