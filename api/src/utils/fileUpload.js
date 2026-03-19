const multer = require('multer');
const path = require('path');

/**
 * Multer Configuration for File Uploads
 *
 * UPGRADED VERSION:
 * - Uses memory storage instead of disk storage
 * - Integrates with HEIC conversion middleware
 * - Integrates with Firebase Storage upload
 *
 * Files are now processed as: Upload → HEIC Conversion → Firebase Storage
 */

// Use memory storage - files will be in req.file.buffer or req.files[].buffer
const storage = multer.memoryStorage();

// File filter for image validation
const fileFilter = (req, file, cb) => {
  // Reject non-images early
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }

  // Supported file types (including HEIC/HEIF which will be auto-converted)
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic', // Auto-converted to JPEG
    'image/heif', // Auto-converted to JPEG
    'image/avif',
    'image/svg+xml',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const readableTypes = {
      'image/jpeg': 'JPEG',
      'image/jpg': 'JPG',
      'image/png': 'PNG',
      'image/webp': 'WebP',
      'image/gif': 'GIF',
      'image/heic': 'HEIC (auto-converts to JPEG)',
      'image/heif': 'HEIF (auto-converts to JPEG)',
      'image/avif': 'AVIF',
      'image/svg+xml': 'SVG',
    };
    const allowedNames = Object.values(readableTypes).join(', ');
    cb(
      new Error(`Only image files are allowed. Supported: ${allowedNames}`),
      false
    );
  }
};

// Configure multer with memory storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 4, // Maximum 4 files for arrays
    fields: 10, // Maximum 10 non-file fields
  },
  fileFilter: fileFilter,
});

// Multer error handler middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image size should not exceed 10MB per file',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 4 images allowed per upload',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: `Unexpected file field: ${error.field}. Expected field names: images, profileImage, or profilePicture`,
      });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        error: 'Too many parts',
        message: 'Request contains too many form fields',
      });
    }
  }

  if (error.message && error.message.includes('Only')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleMulterError,
};
