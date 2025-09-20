const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated users
 * @param {String} userId - User ID from database
 * @param {String} role - User role (customer, scientist, owner)
 * @param {String} organizationId - Organization ID (for scientists/owners)
 * @returns {String} JWT token
 */
const generateToken = (userId, role, organizationId = null) => {
    const payload = {
        id: userId,
        role: role
    };

    // Add organizationId to payload if provided (for scientists/owners)
    if (organizationId) {
        payload.organizationId = organizationId;
    }

    // Generate token with 7 days expiration
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'SIH-Transportation-API',
        audience: 'SIH-Transportation-App'
    });

    return token;
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};
