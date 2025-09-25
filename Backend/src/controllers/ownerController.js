const User = require('../models/User');

/**
 * Approve scientist account
 * PUT /api/owner/approve-scientist/:id
 */
const approveScientist = async (req, res) => {
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

        // Check if already approved
        if (scientist.isApproved) {
            return res.status(400).json({
                status: 'error',
                message: 'Scientist is already approved'
            });
        }

        // TODO: Add organization ownership validation
        // Verify that the requesting owner belongs to the same organization
        // if (req.user.organizationId !== scientist.organizationId) {
        //     return res.status(403).json({
        //         status: 'error',
        //         message: 'You can only approve scientists from your organization'
        //     });
        // }

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
                    // organizationId explicitly excluded in simplified system
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
};

/**
 * Disapprove scientist account
 * PUT /api/owner/disapprove-scientist/:id
 */
const disapproveScientist = async (req, res) => {
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

        // TODO: Add organization ownership validation
        // if (req.user.organizationId !== scientist.organizationId) {
        //     return res.status(403).json({
        //         status: 'error',
        //         message: 'You can only manage scientists from your organization'
        //     });
        // }

        // Disapprove the scientist
        scientist.isApproved = false;
        scientist.isActive = false; // Also deactivate the account
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
                    isApproved: scientist.isApproved,
                    isActive: scientist.isActive,
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
};

/**
 * Get pending scientists for approval
 * GET /api/owner/pending-scientists
 */
const getPendingScientists = async (req, res) => {
    try {
        // TODO: Filter by organization when owner authentication is implemented
        // const organizationId = req.user.organizationId;
        
        const pendingScientists = await User.find({
            role: 'scientist',
            isApproved: false,
            // isActive: true
            // organizationId: organizationId // Add this when owner auth is ready
        }).select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: pendingScientists,
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
};

/**
 * Get all scientists in organization
 * GET /api/owner/scientists
 */
const getOrganizationScientists = async (req, res) => {
    try {
        // TODO: Filter by organization when owner authentication is implemented
        // const organizationId = req.user.organizationId;
        
        const scientists = await User.find({
            role: 'scientist'
            // organizationId: organizationId // Add this when owner auth is ready
        }).select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            status: 'success',
            data: {
                scientists: scientists,
                count: scientists.length,
                approved: scientists.filter(s => s.isApproved).length,
                pending: scientists.filter(s => !s.isApproved).length
            }
        });

    } catch (error) {
        console.error('Get organization scientists error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get organization scientists'
        });
    }
};

module.exports = {
    approveScientist,
    disapproveScientist,
    getPendingScientists,
    getOrganizationScientists
};
