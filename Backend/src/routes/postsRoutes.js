const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/upload');
const {
    createPost,
    getPosts,
    getPostById,
    toggleLike,
    addComment,
    getTrendingPosts,
    updatePost,
    deletePost,
    getMyPosts
} = require('../controllers/postsController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/trending', getTrendingPosts);
router.get('/', getPosts);

// Protected routes (authentication required)
// Get current user's posts (must be before /:id route)
router.get('/user/my-posts', protect, getMyPosts);

// Create a new post with optional image upload
router.post('/', 
    protect,
    upload.single('image'), 
    handleUploadError, 
    createPost
);

// Get single post by ID (after specific routes)
router.get('/:id', getPostById);

// Like/unlike a post
router.post('/:id/like', protect, toggleLike);

// Add comment to a post
router.post('/:id/comment', protect, addComment);

// Update a post (only by author)
router.put('/:id', protect, updatePost);

// Delete a post (only by author)
router.delete('/:id', protect, deletePost);

module.exports = router;