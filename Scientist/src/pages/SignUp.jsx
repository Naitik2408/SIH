import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, User, Mail, Phone, Building, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    orgId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Organization ID validation
    if (!formData.orgId.trim()) {
      newErrors.orgId = 'Organization ID is required';
    } else if (formData.orgId.trim().length < 3) {
      newErrors.orgId = 'Organization ID must be at least 3 characters';
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
      const result = await register(formData);
      
      if (result.success) {
        // Navigate to sign in page with success message
        navigate('/signin', { 
          state: { 
            message: result.message || 'Account created successfully! Please sign in.'
          }
        });
      } else {
        // Handle registration errors
        if (result.errors) {
          // Handle specific field errors from backend validation
          const backendErrors = {};
          if (Array.isArray(result.errors)) {
            result.errors.forEach(error => {
              if (error.includes('email')) backendErrors.email = error;
              else if (error.includes('password')) backendErrors.password = error;
              else if (error.includes('name')) backendErrors.name = error;
              else if (error.includes('phone')) backendErrors.mobile = error;
              else if (error.includes('organization')) backendErrors.orgId = error;
            });
          }
          setErrors(backendErrors);
        } else {
          setErrors({ submit: result.message });
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-slide-in-up">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Enter your details to create your scientist account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`pl-11 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 input-focus-ring ${
                    errors.name 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.name && <p className="text-sm text-red-600 font-medium">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-11 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.email 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-semibold text-slate-700">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`pl-11 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.mobile 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.mobile && <p className="text-sm text-red-600 font-medium">{errors.mobile}</p>}
            </div>

            {/* Organization ID Field */}
            <div className="space-y-2">
              <Label htmlFor="orgId" className="text-sm font-semibold text-slate-700">Organization ID</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="orgId"
                  name="orgId"
                  type="text"
                  placeholder="Enter your organization ID"
                  value={formData.orgId}
                  onChange={handleInputChange}
                  className={`pl-11 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.orgId 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
              </div>
              {errors.orgId && <p className="text-sm text-red-600 font-medium">{errors.orgId}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-11 pr-12 h-12 border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:border-red-500 bg-red-50' 
                      : 'border-slate-200 focus:border-blue-400 hover:border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
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
                  Creating Account...
                </div>
              ) : (
                'Sign Up'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-base pt-4">
              <span className="text-slate-600">Already have an account? </span>
              <Link 
                to="/signin" 
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
