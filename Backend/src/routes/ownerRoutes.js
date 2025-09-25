const express = require('express');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/owner/approve-scientist/:id
 * @desc    Approve scientist account
 * @access  Private (Owner only)
 */
router.post('/approve-scientist/:id', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        const { id } = req.params;

        // Find the scientist
        const scientist = await User.findById(id);
        
        if (!scientist) {
            return res.status(404).json({
                status: 'error',
                message: 'Scientist not found'
            });
        }

        // Verify it's a scientist
        if (scientist.role !== 'scientist') {
            return res.status(400).json({
                status: 'error',
                message: 'User is not a scientist'
            });
        }

        // Organization restriction removed - owner can now approve scientists from any organization
        // Previous restriction: scientist.organizationId !== req.user.organizationId

        // Check if already approved
        if (scientist.isApproved) {
            return res.status(400).json({
                status: 'error',
                message: 'Scientist is already approved'
            });
        }

        // Approve the scientist
        scientist.isApproved = true;
        await scientist.save();

        return res.status(200).json({
            status: 'success',
            message: 'Scientist approved successfully',
            data: {
                scientist: {
                    id: scientist._id,
                    name: scientist.name,
                    email: scientist.email,
                    department: scientist.department,
                    designation: scientist.designation,
                    isApproved: scientist.isApproved,
                    approvedAt: new Date()
                    // organizationId field explicitly excluded in simplified system
                }
            }
        });

    } catch (error) {
        console.error('Approve scientist error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to approve scientist'
        });
    }
});

/**
 * @route   POST /api/owner/disapprove-scientist/:id
 * @desc    Disapprove scientist account
 * @access  Private (Owner only)
 */
router.post('/disapprove-scientist/:id', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Find the scientist
        const scientist = await User.findById(id);
        
        if (!scientist) {
            return res.status(404).json({
                status: 'error',
                message: 'Scientist not found'
            });
        }

        // Verify it's a scientist
        if (scientist.role !== 'scientist') {
            return res.status(400).json({
                status: 'error',
                message: 'User is not a scientist'
            });
        }

        // Organization restriction removed - owner can now disapprove scientists from any organization
        // Previous restriction: scientist.organizationId !== req.user.organizationId

        // Disapprove the scientist
        scientist.isApproved = false;
        await scientist.save();

        return res.status(200).json({
            status: 'success',
            message: 'Scientist disapproved successfully',
            data: {
                scientist: {
                    id: scientist._id,
                    name: scientist.name,
                    email: scientist.email,
                    department: scientist.department,
                    designation: scientist.designation,
                    isApproved: scientist.isApproved,
                    disapprovedAt: new Date(),
                    reason: reason || 'Not specified'
                }
            }
        });

    } catch (error) {
        console.error('Disapprove scientist error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to disapprove scientist'
        });
    }
});

/**
 * @route   GET /api/owner/pending-scientists
 * @desc    Get all pending scientists for approval
 * @access  Private (Owner only)
 */
router.get('/pending-scientists', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // Get all pending scientists (unified - no organization filtering)
        const pendingScientists = await User.find({
            role: 'scientist',
            isApproved: false,
            isActive: true
        })
        .select('name email department designation createdAt')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: pendingScientists.map(scientist => ({
                    id: scientist._id,
                    name: scientist.name,
                    email: scientist.email,
                    department: scientist.department,
                    designation: scientist.designation,
                    createdAt: scientist.createdAt
                })),
                count: pendingScientists.length
            }
        });

    } catch (error) {
        console.error('Get pending scientists error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get pending scientists'
        });
    }
});

/**
 * @route   GET /api/owner/scientists
 * @desc    Get all scientists in the system
 * @access  Private (Owner only)
 */
router.get('/scientists', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // Get all scientists (unified - no organization divisions)
        const scientists = await User.find({
            role: 'scientist'
        })
        .select('name email department designation isApproved isActive createdAt')
        .sort({ createdAt: -1 });

        const approvedCount = scientists.filter(s => s.isApproved).length;
        const pendingCount = scientists.filter(s => !s.isApproved).length;
        const activeCount = scientists.filter(s => s.isActive).length;

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: scientists.map(scientist => ({
                    id: scientist._id,
                    name: scientist.name,
                    email: scientist.email,
                    department: scientist.department,
                    designation: scientist.designation,
                    isApproved: scientist.isApproved,
                    isActive: scientist.isActive,
                    createdAt: scientist.createdAt
                })),
                stats: {
                    total: scientists.length,
                    approved: approvedCount,
                    pending: pendingCount,
                    active: activeCount
                }
            }
        });

    } catch (error) {
        console.error('Get scientists error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get scientists'
        });
    }
});

module.exports = router;
