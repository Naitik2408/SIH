const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware - verify JWT token
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token. User not found.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is deactivated.'
            });
        }

        // Add user to request object
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            isApproved: user.isApproved
        };

        next();

    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired.'
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Authentication failed.'
        });
    }
};

/**
 * Authorization middleware - check user roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Access denied. Please authenticate.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if scientist is approved
 */
const requireApproval = (req, res, next) => {
    if (req.user.role === 'scientist' && !req.user.isApproved) {
        return res.status(403).json({
            status: 'error',
            message: 'Account pending approval by organization owner.'
        });
    }
    next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                req.user = {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    organizationId: user.organizationId,
                    isApproved: user.isApproved
                };
            }
        }

        next();

    } catch (error) {
        // Don't fail on optional auth errors
        next();
    }
};

module.exports = {
    authenticateToken,
    authorize,
    requireApproval,
    optionalAuth
};
