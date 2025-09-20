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

        // Verify organization ownership - scientist must belong to owner's organization
        if (scientist.organizationId !== req.user.organizationId) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only approve scientists from your organization'
            });
        }

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
                    organizationId: scientist.organizationId,
                    department: scientist.department,
                    designation: scientist.designation,
                    isApproved: scientist.isApproved,
                    approvedAt: new Date()
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

        // Verify organization ownership - scientist must belong to owner's organization
        if (scientist.organizationId !== req.user.organizationId) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only manage scientists from your organization'
            });
        }

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
                    organizationId: scientist.organizationId,
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
 * @desc    Get pending scientists for approval in owner's organization
 * @access  Private (Owner only)
 */
router.get('/pending-scientists', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // Get pending scientists from the same organization as the owner
        const pendingScientists = await User.find({
            role: 'scientist',
            organizationId: req.user.organizationId,
            isApproved: false,
            isActive: true
        })
        .select('name email organizationId department designation createdAt')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: pendingScientists.map(scientist => ({
                    id: scientist._id,
                    name: scientist.name,
                    email: scientist.email,
                    organizationId: scientist.organizationId,
                    department: scientist.department,
                    designation: scientist.designation,
                    createdAt: scientist.createdAt
                })),
                count: pendingScientists.length,
                organizationId: req.user.organizationId
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
 * @desc    Get all scientists in owner's organization
 * @access  Private (Owner only)
 */
router.get('/scientists', protect, authorizeRoles('owner'), async (req, res) => {
    try {
        // Get all scientists from the same organization as the owner
        const scientists = await User.find({
            role: 'scientist',
            organizationId: req.user.organizationId
        })
        .select('name email organizationId department designation isApproved isActive createdAt')
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
                    organizationId: scientist.organizationId,
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
                },
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

module.exports = router;
