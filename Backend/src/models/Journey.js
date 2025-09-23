const mongoose = require('mongoose');

// Journey/Trip tracking schema for customer travel data
const journeySchema = new mongoose.Schema({
    tripId: {
        type: String,
        required: [true, 'Trip ID is required'],
        unique: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    status: {
        type: String,
        enum: {
            values: ['in_progress', 'completed'],
            message: 'Status must be either in_progress or completed'
        },
        required: [true, 'Status is required']
    },
    surveyData: {
        transportMode: {
            type: String,
            required: [true, 'Transport mode is required'],
            enum: ['Bus', 'Train', 'Auto/Taxi', 'Walking', 'Personal Vehicle', 'Metro', 'Bike', 'Car']
        },
        journeyPurpose: {
            type: String,
            required: [true, 'Journey purpose is required'],
            enum: ['Work/Office', 'Education', 'Shopping', 'Healthcare', 'Leisure/Entertainment', 'Personal']
        },
        routeSatisfaction: {
            type: String,
            required: [true, 'Route satisfaction is required'],
            enum: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
        },
        timeOfDay: {
            type: String,
            required: [true, 'Time of day is required'],
            enum: ['Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)', 'Night (8 PM+)']
        },
        travelCompanions: {
            type: String,
            required: [true, 'Travel companions info is required'],
            enum: ['Just me', '1 person', '2-3 people', '4-5 people', 'More than 5']
        }
    },
    tripDetails: {
        startTime: {
            type: Date,
            required: [true, 'Start time is required']
        },
        endTime: {
            type: Date,
            default: null
        },
        actualDuration: {
            type: Number,
            default: 0,
            min: [0, 'Duration cannot be negative']
        },
        actualDurationFormatted: {
            type: String,
            default: '0 min'
        },
        startLocation: {
            lat: {
                type: Number,
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            lng: {
                type: Number,
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            },
            address: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date
            }
        },
        endLocation: {
            lat: {
                type: Number,
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            lng: {
                type: Number,
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            },
            address: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date
            }
        }
    },
    gpsTrackingData: [{
        lat: {
            type: Number,
            required: [true, 'GPS latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        lng: {
            type: Number,
            required: [true, 'GPS longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        timestamp: {
            type: Date,
            required: [true, 'GPS timestamp is required']
        },
        speed: {
            type: Number,
            default: 0,
            min: [0, 'Speed cannot be negative']
        },
        accuracy: {
            type: Number,
            default: 0,
            min: [0, 'Accuracy cannot be negative']
        },
        heading: {
            type: Number,
            default: null,
            min: [0, 'Heading must be between 0 and 360'],
            max: [360, 'Heading must be between 0 and 360']
        }
    }],
    metadata: {
        appVersion: {
            type: String,
            default: '1.0.0'
        },
        deviceInfo: {
            platform: {
                type: String,
                enum: ['ios', 'android', 'web'],
                default: 'android'
            },
            model: {
                type: String,
                default: 'Unknown'
            },
            osVersion: {
                type: String,
                default: 'Unknown'
            }
        },
        networkType: {
            type: String,
            enum: ['wifi', 'cellular', 'unknown'],
            default: 'unknown'
        },
        batteryLevel: {
            type: Number,
            min: [0, 'Battery level must be between 0 and 100'],
            max: [100, 'Battery level must be between 0 and 100'],
            default: 100
        },
        dataCollectionConsent: {
            type: Boolean,
            default: true
        },
        privacyLevel: {
            type: String,
            enum: ['basic', 'detailed', 'anonymous'],
            default: 'basic'
        }
    },
    rewards: {
        pointsEarned: {
            type: Number,
            default: 0,
            min: [0, 'Points cannot be negative']
        },
        badgesUnlocked: [{
            type: String,
            trim: true
        }],
        milestoneReached: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better query performance
journeySchema.index({ userId: 1 });
journeySchema.index({ status: 1 });
journeySchema.index({ 'tripDetails.startTime': 1 });
journeySchema.index({ 'surveyData.transportMode': 1 });
journeySchema.index({ 'surveyData.journeyPurpose': 1 });
journeySchema.index({ createdAt: -1 });

// Virtual for calculating trip duration if end time exists
journeySchema.virtual('calculatedDuration').get(function() {
    if (this.tripDetails.endTime && this.tripDetails.startTime) {
        return this.tripDetails.endTime - this.tripDetails.startTime;
    }
    return null;
});

// Static method to find journeys by date range
journeySchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        'tripDetails.startTime': {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('userId', 'name email profile');
};

// Static method to find journeys by transport mode
journeySchema.statics.findByTransportMode = function(mode) {
    return this.find({
        'surveyData.transportMode': mode
    }).populate('userId', 'name email profile');
};

// Static method to get journey analytics
journeySchema.statics.getAnalytics = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$surveyData.transportMode',
                count: { $sum: 1 },
                avgDuration: { $avg: '$tripDetails.actualDuration' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

module.exports = mongoose.model('Journey', journeySchema);