const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
    },
    fileFilter: fileFilter
});

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                status: 'error',
                message: 'Too many files. Only one file is allowed.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                status: 'error',
                message: 'Unexpected field name for file upload.'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            status: 'error',
            message: 'Only image files are allowed.'
        });
    }

    // Other errors
    return res.status(500).json({
        status: 'error',
        message: 'File upload error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
};

// Clean up uploaded file on error
const cleanupFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            // Silently handle file cleanup errors
        }
    }
};

module.exports = {
    upload,
    handleUploadError,
    cleanupFile
};