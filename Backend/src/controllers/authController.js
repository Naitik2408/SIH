const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * Register new user (customer or scientist)
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role = 'customer', organizationId } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Validate scientist requirements
        if (role === 'scientist' && !organizationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Organization ID is required for scientists'
            });
        }

        // Check if organizationId is unique (for scientists)
        if (role === 'scientist' && organizationId) {
            const isOrgIdUnique = await User.isOrgIdUnique(organizationId.trim());
            if (!isOrgIdUnique) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Organization ID already exists. Please choose a different one.'
                });
            }
        }

        // Check if phone number is unique (if provided)
        if (phone) {
            const isPhoneUnique = await User.isPhoneUnique(phone.trim());
            if (!isPhoneUnique) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Phone number already exists. Please use a different phone number.'
                });
            }
        }

        // Create user data
        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role
        };

        // Add optional fields
        if (phone) userData.phone = phone.trim();
        if (organizationId) userData.organizationId = organizationId.trim();

        // Create new user
        const user = new User(userData);
        await user.save();

        // Response based on role
        if (role === 'scientist') {
            // Scientists need approval
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful. Pending approval from organization owner.',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        organizationId: user.organizationId,
                        isApproved: user.isApproved
                    }
                }
            });
        } else {
            // Customers are auto-approved, generate token
            const token = generateToken(user._id, user.role);
            
            return res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        isApproved: user.isApproved
                    },
                    token
                }
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: messages
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Registration failed. Please try again.'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password, identifier } = req.body;
        
        // Support both old format (email) and new format (identifier)
        const loginIdentifier = identifier || email;

        // Validation
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email/Phone/Organization ID and password are required'
            });
        }

        // Find user with password field (supports email, phone, and organizationId)
        const user = await User.findByIdentifierWithPassword(loginIdentifier.toLowerCase());
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email/phone/organization ID or password'
            });
        }

        // Verify password
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check approval status for scientists
        if (user.role === 'scientist' && !user.isApproved) {
            return res.status(403).json({
                status: 'error',
                message: 'Your account is pending approval by the organization owner.'
            });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate token
        const token = generateToken(user._id, user.role, user.organizationId);

        // Success response
        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId,
                    isApproved: user.isApproved,
                    lastLogin: user.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Login failed. Please try again.'
        });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // Note: With JWT, logout is handled client-side by removing the token
        // In a more advanced setup, you could maintain a blacklist of tokens
        
        return res.status(200).json({
            status: 'success',
            message: 'Logout successful. Please remove the token from client storage.'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Logout failed. Please try again.'
        });
    }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    organizationId: user.organizationId,
                    department: user.department,
                    designation: user.designation,
                    isActive: user.isActive,
                    isVerified: user.isVerified,
                    isApproved: user.isApproved,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile
};
