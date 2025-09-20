const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware - protect routes
 * Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database and attach to request
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token is not valid. User not found.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'User account is deactivated.'
            });
        }

        // Attach user info to request
        req.user = {
            id: user._id,
            role: user.role,
            organizationId: user.organizationId
        };

        next();

    } catch (error) {
        console.error('Authentication error:', error);

        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token is not valid.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token has expired.'
            });
        }

        return res.status(401).json({
            status: 'error',
            message: 'Authentication failed.'
        });
    }
};

/**
 * Authorization middleware - check user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required.'
            });
        }

        // Check if user role is authorized
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Access forbidden. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

/**
 * Check if scientist is approved (for scientist-specific routes)
 */
const requireApproval = (req, res, next) => {
    if (req.user.role === 'scientist') {
        // We need to check the database for approval status
        User.findById(req.user.id)
            .then(user => {
                if (!user.isApproved) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Account pending approval by organization owner.'
                    });
                }
                next();
            })
            .catch(error => {
                console.error('Approval check error:', error);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to verify approval status.'
                });
            });
    } else {
        next();
    }
};

module.exports = {
    protect,
    authorizeRoles,
    requireApproval
};
