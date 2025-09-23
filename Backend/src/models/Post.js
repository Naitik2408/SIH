const mongoose = require('mongoose');

// Post Schema for community posts
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true,
        maxlength: [500, 'Content cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['travel-tips', 'route-updates', 'community', 'safety', 'experiences'],
            message: 'Category must be one of: travel-tips, route-updates, community, safety, experiences'
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    authorDetails: {
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['customer', 'scientist', 'owner'],
            required: true
        }
    },
    keywords: [{
        type: String,
        trim: true,
        maxlength: [50, 'Keyword cannot exceed 50 characters']
    }],
    image: {
        url: {
            type: String,
            default: null
        },
        publicId: {
            type: String,
            default: null
        }
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userDetails: {
            name: {
                type: String,
                required: true
            },
            role: {
                type: String,
                enum: ['customer', 'scientist', 'owner'],
                required: true
            }
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [300, 'Comment cannot exceed 300 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    reportedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            required: true
        },
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    views: {
        type: Number,
        default: 0
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
    return this.comments ? this.comments.length : 0;
});

// Virtual for formatted date
postSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
});

// Indexes for better performance
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isActive: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ keywords: 1 });

// Pre-save middleware to update lastActivityAt
postSchema.pre('save', function(next) {
    if (this.isModified('likes') || this.isModified('comments')) {
        this.lastActivityAt = new Date();
    }
    next();
});

// Static method to get posts with pagination and filters
postSchema.statics.getPostsWithFilters = async function(options = {}) {
    const {
        page = 1,
        limit = 10,
        category,
        author,
        keywords,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeInactive = false
    } = options;

    const skip = (page - 1) * limit;
    const query = {};

    // Add filters
    if (!includeInactive) {
        query.isActive = true;
    }

    if (category) {
        query.category = category;
    }

    if (author) {
        query.author = author;
    }

    if (keywords && keywords.length > 0) {
        query.keywords = { $in: keywords };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'popularity') {
        // Sort by likes + comments + views
        sortOptions['likeCount'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'activity') {
        sortOptions['lastActivityAt'] = sortOrder === 'desc' ? -1 : 1;
    } else {
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // If pinned posts should be shown first
    if (sortBy !== 'pinned') {
        sortOptions['isPinned'] = -1;
    }

    const posts = await this.find(query)
        .populate('author', 'name role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await this.countDocuments(query);

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    };
};

// Static method to get trending posts
postSchema.statics.getTrendingPosts = async function(limit = 5) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return await this.find({
        isActive: true,
        createdAt: { $gte: oneDayAgo }
    })
    .populate('author', 'name role')
    .sort({ 
        likeCount: -1, 
        commentCount: -1, 
        views: -1 
    })
    .limit(limit)
    .lean();
};

// Instance method to check if user has liked the post
postSchema.methods.isLikedByUser = function(userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Instance method to toggle like
postSchema.methods.toggleLike = async function(userId) {
    const existingLikeIndex = this.likes.findIndex(
        like => like.user.toString() === userId.toString()
    );

    if (existingLikeIndex > -1) {
        // Unlike
        this.likes.splice(existingLikeIndex, 1);
    } else {
        // Like
        this.likes.push({ user: userId });
    }

    return await this.save();
};

// Instance method to add comment
postSchema.methods.addComment = async function(userId, userDetails, content) {
    this.comments.push({
        user: userId,
        userDetails,
        content
    });

    return await this.save();
};

// Instance method to increment views
postSchema.methods.incrementViews = async function() {
    this.views += 1;
    return await this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;