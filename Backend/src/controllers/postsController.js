const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

/**
 * Create a new post
 * POST /api/posts
 */
const createPost = async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            keywords = []
        } = req.body;

        // Validation
        if (!title || !content || !category) {
            return res.status(400).json({
                status: 'error',
                message: 'Title, content, and category are required'
            });
        }

        // Validate category
        const validCategories = ['travel-tips', 'route-updates', 'community', 'safety', 'experiences'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid category provided'
            });
        }

        // Get user details for author
        const user = await User.findById(req.user.id).select('name role');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Prepare post data
        const postData = {
            title: title.trim(),
            content: content.trim(),
            category,
            author: req.user.id,
            authorDetails: {
                name: user.name,
                role: user.role
            },
            keywords: keywords.map(keyword => keyword.trim()).filter(Boolean)
        };

        // Handle image upload if present
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'posts',
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto' },
                        { format: 'auto' }
                    ]
                });

                postData.image = {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to upload image'
                });
            }
        }

        // Create the post
        const post = new Post(postData);
        await post.save();

        // Populate author details and return
        await post.populate('author', 'name role');

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully',
            data: {
                post: {
                    id: post._id,
                    title: post.title,
                    content: post.content,
                    category: post.category,
                    author: post.authorDetails.name,
                    authorRole: post.authorDetails.role,
                    keywords: post.keywords,
                    image: post.image.url || null,
                    likeCount: post.likeCount,
                    commentCount: post.commentCount,
                    createdAt: post.createdAt,
                    formattedDate: post.formattedDate
                }
            }
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Get all posts with filters and pagination
 * GET /api/posts
 */
const getPosts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            keywords,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            author
        } = req.query;

        // Parse keywords if provided
        let keywordArray = [];
        if (keywords) {
            keywordArray = typeof keywords === 'string' ? 
                keywords.split(',').map(k => k.trim()).filter(Boolean) : 
                keywords;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category,
            keywords: keywordArray,
            sortBy,
            sortOrder,
            author
        };

        const result = await Post.getPostsWithFilters(options);

        // Format posts for frontend
        const formattedPosts = result.posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            author: post.authorDetails.name,
            authorRole: post.authorDetails.role,
            keywords: post.keywords,
            image: post.image?.url || null,
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            views: post.views || 0,
            isNew: (Date.now() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000, // New if less than 24 hours
            hasImage: !!post.image?.url,
            imageUrl: post.image?.url || null,
            date: post.createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
            createdAt: post.createdAt,
            isPinned: post.isPinned || false
        }));

        res.status(200).json({
            status: 'success',
            message: 'Posts retrieved successfully',
            data: {
                posts: formattedPosts,
                pagination: result.pagination
            }
        });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Get a single post by ID
 * GET /api/posts/:id
 */
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
            .populate('author', 'name role')
            .populate('comments.user', 'name role');

        if (!post || !post.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Increment views
        await post.incrementViews();

        // Format post for frontend
        const formattedPost = {
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            author: post.authorDetails.name,
            authorRole: post.authorDetails.role,
            keywords: post.keywords,
            image: post.image?.url || null,
            likes: post.likeCount,
            comments: post.commentCount,
            views: post.views,
            isNew: (Date.now() - new Date(post.createdAt).getTime()) < 24 * 60 * 60 * 1000,
            hasImage: !!post.image?.url,
            imageUrl: post.image?.url || null,
            date: post.createdAt.toISOString().split('T')[0],
            createdAt: post.createdAt,
            isPinned: post.isPinned,
            isLikedByUser: req.user ? post.isLikedByUser(req.user.id) : false,
            commentsData: post.comments.map(comment => ({
                id: comment._id,
                content: comment.content,
                author: comment.userDetails.name,
                authorRole: comment.userDetails.role,
                createdAt: comment.createdAt
            }))
        };

        res.status(200).json({
            status: 'success',
            message: 'Post retrieved successfully',
            data: { post: formattedPost }
        });

    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Toggle like on a post
 * POST /api/posts/:id/like
 */
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post || !post.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        const wasLiked = post.isLikedByUser(req.user.id);
        await post.toggleLike(req.user.id);

        res.status(200).json({
            status: 'success',
            message: wasLiked ? 'Post unliked successfully' : 'Post liked successfully',
            data: {
                isLiked: !wasLiked,
                likeCount: post.likeCount
            }
        });

    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Add comment to a post
 * POST /api/posts/:id/comment
 */
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Comment content is required'
            });
        }

        const post = await Post.findById(id);
        if (!post || !post.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Get user details
        const user = await User.findById(req.user.id).select('name role');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Add comment
        await post.addComment(req.user.id, {
            name: user.name,
            role: user.role
        }, content.trim());

        res.status(201).json({
            status: 'success',
            message: 'Comment added successfully',
            data: {
                commentCount: post.commentCount
            }
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Get trending posts
 * GET /api/posts/trending
 */
const getTrendingPosts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const posts = await Post.getTrendingPosts(parseInt(limit));

        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            author: post.authorDetails.name,
            likes: post.likeCount,
            comments: post.commentCount,
            views: post.views,
            createdAt: post.createdAt
        }));

        res.status(200).json({
            status: 'success',
            message: 'Trending posts retrieved successfully',
            data: { posts: formattedPosts }
        });

    } catch (error) {
        console.error('Get trending posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Update a post (only by author)
 * PUT /api/posts/:id
 */
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, keywords } = req.body;

        const post = await Post.findById(id);
        if (!post || !post.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only update your own posts'
            });
        }

        // Update fields
        if (title) post.title = title.trim();
        if (content) post.content = content.trim();
        if (keywords) post.keywords = keywords.map(keyword => keyword.trim()).filter(Boolean);

        await post.save();

        res.status(200).json({
            status: 'success',
            message: 'Post updated successfully',
            data: {
                post: {
                    id: post._id,
                    title: post.title,
                    content: post.content,
                    keywords: post.keywords
                }
            }
        });

    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Delete a post (only by author)
 * DELETE /api/posts/:id
 */
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post || !post.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only delete your own posts'
            });
        }

        // Soft delete
        post.isActive = false;
        await post.save();

        // Delete image from cloudinary if exists
        if (post.image?.publicId) {
            try {
                await cloudinary.uploader.destroy(post.image.publicId);
            } catch (deleteError) {
                console.error('Error deleting image from cloudinary:', deleteError);
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

/**
 * Get posts by current user
 * GET /api/posts/my-posts
 */
const getMyPosts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            author: req.user.id,
            sortBy,
            sortOrder,
            includeInactive: false
        };

        const result = await Post.getPostsWithFilters(options);

        const formattedPosts = result.posts.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content,
            category: post.category,
            keywords: post.keywords,
            image: post.image?.url || null,
            likes: post.likeCount || 0,
            comments: post.commentCount || 0,
            views: post.views || 0,
            createdAt: post.createdAt,
            isPinned: post.isPinned || false
        }));

        res.status(200).json({
            status: 'success',
            message: 'Your posts retrieved successfully',
            data: {
                posts: formattedPosts,
                pagination: result.pagination
            }
        });

    } catch (error) {
        console.error('Get my posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    toggleLike,
    addComment,
    getTrendingPosts,
    updatePost,
    deletePost,
    getMyPosts
};