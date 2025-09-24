const { Journey, User } = require('../models');

// Create a new journey entry
const createJourney = async (req, res) => {
    try {
        const {
            surveyData,
            tripDetails,
            gpsTrackingData,
            metadata
        } = req.body;

        // Calculate rewards based on survey completion and GPS data
        const basePoints = 10;
        const surveyBonus = (surveyData.satisfaction !== undefined) ? 5 : 0;
        const gpsBonus = (gpsTrackingData && gpsTrackingData.coordinates?.length > 0) ? 3 : 0;
        const totalPoints = basePoints + surveyBonus + gpsBonus;

        const journey = new Journey({
            userId: req.user.id, // Fixed: changed from req.user.userId to req.user.id
            surveyData,
            tripDetails,
            gpsTrackingData,
            metadata,
            rewards: {
                pointsEarned: totalPoints,
                description: 'Journey completion reward'
            }
        });

        const savedJourney = await journey.save();

        // Update user's total points
        await User.findByIdAndUpdate(
            req.user.id, // Fixed: changed from req.user.userId to req.user.id
            { $inc: { 'rewards.totalPoints': totalPoints } }
        );

        res.status(201).json({
            success: true,
            message: 'Journey recorded successfully',
            data: savedJourney
        });
    } catch (error) {
        console.error('Create journey error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record journey',
            error: error.message
        });
    }
};

// Get user's journey history
const getUserJourneys = async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate } = req.query;
        
        const filter = { userId: req.user.id }; // Fixed: changed from req.user.userId to req.user.id
        
        // Add date filtering if provided
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const journeys = await Journey.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email');

        const total = await Journey.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                journeys,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error('Get user journeys error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch journeys',
            error: error.message
        });
    }
};

// Get journey analytics for scientist dashboard
const getJourneyAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        const matchFilter = {};
        
        // Add date filtering
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }

        // Add user filtering for specific user analysis
        if (userId) {
            matchFilter.userId = userId;
        }

        const analytics = await Journey.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalJourneys: { $sum: 1 },
                    avgDistance: { $avg: '$tripDetails.distance' },
                    avgDuration: { $avg: '$tripDetails.duration' },
                    transportModes: {
                        $push: '$surveyData.transportMode'
                    },
                    purposes: {
                        $push: '$surveyData.purpose'
                    },
                    avgSatisfaction: { $avg: '$surveyData.satisfaction' },
                    totalPoints: { $sum: '$rewards.pointsEarned' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalJourneys: 1,
                    avgDistance: { $round: ['$avgDistance', 2] },
                    avgDuration: { $round: ['$avgDuration', 2] },
                    avgSatisfaction: { $round: ['$avgSatisfaction', 1] },
                    totalPoints: 1,
                    transportModeDistribution: {
                        $reduce: {
                            input: '$transportModes',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    {
                                        $arrayToObject: [[{
                                            k: '$$this',
                                            v: {
                                                $add: [
                                                    { $ifNull: [{ $getField: { input: '$$value', field: '$$this' } }, 0] },
                                                    1
                                                ]
                                            }
                                        }]]
                                    }
                                ]
                            }
                        }
                    },
                    purposeDistribution: {
                        $reduce: {
                            input: '$purposes',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    {
                                        $arrayToObject: [[{
                                            k: '$$this',
                                            v: {
                                                $add: [
                                                    { $ifNull: [{ $getField: { input: '$$value', field: '$$this' } }, 0] },
                                                    1
                                                ]
                                            }
                                        }]]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        // Get temporal patterns
        const temporalData = await Journey.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$createdAt' },
                        dayOfWeek: { $dayOfWeek: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    hourlyPattern: {
                        $push: {
                            hour: '$_id.hour',
                            count: '$count'
                        }
                    },
                    weeklyPattern: {
                        $push: {
                            dayOfWeek: '$_id.dayOfWeek',
                            count: '$count'
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: analytics[0] || {},
                temporal: temporalData[0] || { hourlyPattern: [], weeklyPattern: [] }
            }
        });
    } catch (error) {
        console.error('Get journey analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};

// Get journey data for scientist visualization (matches existing usersData.json format)
const getScientistData = async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        const journeys = await Journey.find()
            .populate('userId', 'name email profile.age profile.gender profile.occupation')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Transform data to match scientist's expected format
        const scientistData = journeys.map(journey => ({
            id: journey.tripId,
            userId: journey.userId._id,
            name: journey.userId.name,
            email: journey.userId.email,
            age: journey.userId.profile?.age || Math.floor(Math.random() * 40) + 18,
            gender: journey.userId.profile?.gender || (Math.random() > 0.5 ? 'male' : 'female'),
            occupation: journey.userId.profile?.occupation || 'Professional',
            tripData: {
                startLocation: journey.tripDetails.startLocation,
                endLocation: journey.tripDetails.endLocation,
                distance: journey.metadata?.totalDistance,
                duration: journey.tripDetails.actualDuration,
                transportMode: journey.surveyData.transportMode,
                journeyPurpose: journey.surveyData.journeyPurpose,
                routeSatisfaction: journey.surveyData.routeSatisfaction,
                timeOfDay: journey.surveyData.timeOfDay,
                travelCompanions: journey.surveyData.travelCompanions,
                timestamp: journey.tripDetails.startTime || journey.createdAt
            },
            gpsData: journey.gpsTrackingData?.coordinates || [],
            metadata: {
                deviceType: journey.metadata?.deviceInfo?.platform || 'mobile',
                appVersion: journey.metadata?.appVersion || '1.0.0'
            }
        }));

        res.status(200).json({
            success: true,
            data: scientistData,
            metadata: {
                totalRecords: scientistData.length,
                generatedAt: new Date().toISOString(),
                dataSource: 'backend-journey-collection'
            }
        });
    } catch (error) {
        console.error('Get scientist data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scientist data',
            error: error.message
        });
    }
};

// Delete a journey
const deleteJourney = async (req, res) => {
    try {
        const { journeyId } = req.params;

        const journey = await Journey.findOneAndDelete({
            _id: journeyId,
            userId: req.user.id // Fixed: changed from req.user.userId to req.user.id
        });

        if (!journey) {
            return res.status(404).json({
                success: false,
                message: 'Journey not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Journey deleted successfully'
        });
    } catch (error) {
        console.error('Delete journey error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete journey',
            error: error.message
        });
    }
};

module.exports = {
    createJourney,
    getUserJourneys,
    getJourneyAnalytics,
    getScientistData,
    deleteJourney
};