const express = require('express');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private (All authenticated users)
 */
router.get('/me', protect, async (req, res) => {
    try {
        // Get user from database with all necessary fields
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Return user profile based on role
        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        // Add role-specific fields
        if (user.role === 'scientist' || user.role === 'owner') {
            userProfile.organizationId = user.organizationId;
            userProfile.department = user.department;
            userProfile.designation = user.designation;
            userProfile.isApproved = user.isApproved;
        }

        return res.status(200).json({
            status: 'success',
            data: {
                user: userProfile
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get user profile'
        });
    }
});

/**
 * @route   GET /api/users/organization-scientists
 * @desc    Get all scientists in owner's organization
 * @access  Private (Owner only)
 */
router.get('/organization-scientists', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // Get all scientists from the same organization as the owner
        const scientists = await User.find({
            role: 'scientist',
            organizationId: req.user.organizationId
        })
        .select('name email department designation isApproved isActive createdAt lastLogin')
        .sort({ createdAt: -1 });

        // Format the response
        const formattedScientists = scientists.map(scientist => ({
            id: scientist._id,
            name: scientist.name,
            email: scientist.email,
            department: scientist.department,
            designation: scientist.designation,
            isApproved: scientist.isApproved,
            isActive: scientist.isActive,
            createdAt: scientist.createdAt,
            lastLogin: scientist.lastLogin
        }));

        // Calculate statistics
        const stats = {
            total: scientists.length,
            approved: scientists.filter(s => s.isApproved).length,
            pending: scientists.filter(s => !s.isApproved).length,
            active: scientists.filter(s => s.isActive).length,
            recentlyActive: scientists.filter(s => {
                if (!s.lastLogin) return false;
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(s.lastLogin) > weekAgo;
            }).length
        };

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: formattedScientists,
                stats: stats,
                organizationId: req.user.organizationId
            }
        });

    } catch (error) {
        console.error('Get organization scientists error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get organization scientists'
        });
    }
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private (All authenticated users)
 */
router.put('/me', protect, async (req, res) => {
    try {
        const { name, phone, department, designation } = req.body;
        
        // Get current user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        
        // Allow scientists and owners to update work-related fields
        if (user.role === 'scientist' || user.role === 'owner') {
            if (department) user.department = department.trim();
            if (designation) user.designation = designation.trim();
        }

        await user.save();

        // Return updated profile
        const updatedProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        if (user.role === 'scientist' || user.role === 'owner') {
            updatedProfile.organizationId = user.organizationId;
            updatedProfile.department = user.department;
            updatedProfile.designation = user.designation;
            updatedProfile.isApproved = user.isApproved;
        }

        return res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: updatedProfile
            }
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        
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
            message: 'Failed to update profile'
        });
    }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (for admins/owners)
 * @access  Private (Owner only)
 */
router.get('/stats', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // For owners, show stats for their organization
        const orgFilter = req.user.role === 'owner' ? { organizationId: req.user.organizationId } : {};

        const totalUsers = await User.countDocuments(orgFilter);
        const activeUsers = await User.countDocuments({ ...orgFilter, isActive: true });
        const customerCount = await User.countDocuments({ ...orgFilter, role: 'customer' });
        const scientistCount = await User.countDocuments({ ...orgFilter, role: 'scientist' });
        const ownerCount = await User.countDocuments({ ...orgFilter, role: 'owner' });
        const approvedScientists = await User.countDocuments({ 
            ...orgFilter, 
            role: 'scientist', 
            isApproved: true 
        });
        const pendingScientists = await User.countDocuments({ 
            ...orgFilter, 
            role: 'scientist', 
            isApproved: false 
        });

        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            ...orgFilter,
            createdAt: { $gte: thirtyDaysAgo }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    total: totalUsers,
                    active: activeUsers,
                    customers: customerCount,
                    scientists: scientistCount,
                    owners: ownerCount,
                    approvedScientists: approvedScientists,
                    pendingScientists: pendingScientists,
                    recentRegistrations: recentRegistrations
                },
                organizationId: req.user.organizationId || 'all'
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get user statistics'
        });
    }
});

module.exports = router;
