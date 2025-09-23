const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema for both customers and scientists
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/,
            'Please provide a valid Indian phone number'
        ]
    },
    role: {
        type: String,
        enum: {
            values: ['customer', 'scientist', 'owner'],
            message: 'Role must be either customer, scientist, or owner'
        },
        default: 'customer'
    },
    // Additional fields for scientists
    organizationId: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Only required if role is scientist
                if (this.role === 'scientist') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Organization ID is required for scientists'
        }
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    // Profile Information (for customers)
    profile: {
        age: {
            type: Number,
            min: [1, 'Age must be at least 1'],
            max: [120, 'Age cannot exceed 120']
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say'],
            lowercase: true
        },
        occupation: {
            type: String,
            enum: ['student', 'employee', 'homemaker', 'retired', 'self-employed', 'unemployed', 'other'],
            lowercase: true
        },
        householdSize: {
            type: Number,
            min: [1, 'Household size must be at least 1'],
            max: [50, 'Household size cannot exceed 50']
        },
        vehicleOwnership: {
            cars: {
                type: Number,
                default: 0,
                min: [0, 'Cannot have negative vehicles']
            },
            twoWheelers: {
                type: Number,
                default: 0,
                min: [0, 'Cannot have negative vehicles']
            },
            cycles: {
                type: Number,
                default: 0,
                min: [0, 'Cannot have negative vehicles']
            }
        },
        usesPublicTransport: {
            type: Boolean
        },
        incomeRange: {
            type: String,
            enum: ['below-25k', '25k-50k', '50k-100k', '100k-200k', '200k-500k', 'above-500k', 'prefer-not-to-say'],
            lowercase: true
        }
    },
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: function () {
            // Auto-approve customers, require approval for scientists
            return this.role === 'customer';
        }
    },
    lastLogin: {
        type: Date
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: {
        transform: function (doc, ret) {
            // Remove password from JSON output
            delete ret.password;
            return ret;
        }
    }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-update middleware to update the updatedAt field
userSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    return await this.save({ validateBeforeSave: false });
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};

// Static method to get user stats
userSchema.statics.getUserStats = async function () {
    try {
        const stats = await this.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: {
                            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
                        }
                    },
                    verified: {
                        $sum: {
                            $cond: [{ $eq: ['$isVerified', true] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        return stats;
    } catch (error) {
        throw new Error('Failed to get user statistics');
    }
};

// Virtual for full name (if needed for scientists with titles)
userSchema.virtual('displayName').get(function () {
    if (this.role === 'scientist' && this.designation) {
        return `${this.designation} ${this.name}`;
    }
    return this.name;
});

// Virtual to check if user is scientist
userSchema.virtual('isScientist').get(function () {
    return this.role === 'scientist';
});

// Virtual to check if user is customer
userSchema.virtual('isCustomer').get(function () {
    return this.role === 'customer';
});

// Model creation
const User = mongoose.model('User', userSchema);

module.exports = User;
