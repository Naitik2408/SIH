// Main routes index - imports all route modules
const express = require('express');
const authRoutes = require('./authRoutes');
const ownerRoutes = require('./ownerRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/owner', ownerRoutes);
router.use('/users', userRoutes);

// API info route
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'SIH Transportation Analytics API',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                profile: 'GET /api/auth/profile',
                verifyToken: 'GET /api/auth/verify-token'
            },
            users: {
                profile: 'GET /api/users/me',
                updateProfile: 'PUT /api/users/me',
                organizationScientists: 'GET /api/users/organization-scientists (owner only)',
                stats: 'GET /api/users/stats (owner only)'
            },
            owner: {
                approveScientist: 'POST /api/owner/approve-scientist/:id',
                disapproveScientist: 'POST /api/owner/disapprove-scientist/:id',
                pendingScientists: 'GET /api/owner/pending-scientists',
                organizationScientists: 'GET /api/owner/scientists'
            },
            upcoming: {
                reports: '/api/reports (coming soon)',
                analytics: '/api/analytics (coming soon)',
                trips: '/api/trips (coming soon)'
            }
        }
    });
});

/*
Future routes to be implemented:
- /api/users (user management)
- /api/reports (report generation and management)
- /api/analytics (transportation analytics)
- /api/settings (user preferences)
- /api/trips (customer trip data)
- /api/notifications (system notifications)
*/

module.exports = router;
