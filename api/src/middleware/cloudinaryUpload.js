/**
 * Cloudinary Upload Middleware
 *
 * Handles uploading files from memory to Cloudinary
 * Returns secure URLs for uploaded images
 */

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a single file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from Multer
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path (default: 'uploads')
 * @param {string} options.transformation - Image transformation settings
 * @param {string} options.resourceType - Resource type (default: 'image')
 * @returns {Promise<Object>} - Upload result with secure_url
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      folder = 'uploads',
      transformation,
      resourceType = 'image',
    } = options;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      // Auto-optimize images
      quality: 'auto',
      fetch_format: 'auto',
    };

    // Add transformation if provided
    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of Multer file objects with buffers
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleToCloudinary = async (files, options = {}) => {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`📤 Uploading ${files.length} file(s) to Cloudinary...`);

  const uploadPromises = files.map((file) => {
    return uploadToCloudinary(file.buffer, {
      ...options,
      // Use original filename (without extension) as public_id
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
    });
  });

  const results = await Promise.all(uploadPromises);
  console.log(`✅ All ${results.length} files uploaded to Cloudinary`);

  return results;
};

/**
 * Middleware to upload files to Cloudinary after Multer processing
 * Adds cloudinaryUrl and cloudinaryResult to req.file/req.files
 *
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder (default: 'uploads')
 * @param {Object} options.transformation - Image transformation settings
 */
const cloudinaryUploadMiddleware = (options = {}) => {
  return async (req, res, next) => {
    try {
      console.log('\n📤 Cloudinary Upload Middleware');

      // Handle single file (req.file)
      if (req.file && req.file.buffer) {
        console.log(`   Uploading single file: ${req.file.originalname}`);

        const result = await uploadToCloudinary(req.file.buffer, options);

        // Attach Cloudinary info to req.file
        req.file.cloudinaryUrl = result.secure_url;
        req.file.cloudinaryPublicId = result.public_id;
        req.file.cloudinaryResult = result;

        console.log(`   ✅ URL: ${result.secure_url}`);
      }

      // Handle multiple files (req.files array)
      if (req.files && Array.isArray(req.files)) {
        console.log(`   Uploading ${req.files.length} files`);

        const results = await uploadMultipleToCloudinary(req.files, options);

        // Attach Cloudinary info to each file
        req.files.forEach((file, index) => {
          file.cloudinaryUrl = results[index].secure_url;
          file.cloudinaryPublicId = results[index].public_id;
          file.cloudinaryResult = results[index];
        });

        // Store all URLs in a convenient array
        req.cloudinaryUrls = results.map((r) => r.secure_url);

        console.log(`   ✅ ${results.length} URLs generated`);
      }

      // Handle multiple files (req.files object with field names)
      if (
        req.files &&
        typeof req.files === 'object' &&
        !Array.isArray(req.files)
      ) {
        req.cloudinaryUrls = {};

        for (const fieldName in req.files) {
          const filesArray = req.files[fieldName];
          if (Array.isArray(filesArray)) {
            console.log(
              `   Uploading ${filesArray.length} file(s) for field '${fieldName}'`
            );

            const results = await uploadMultipleToCloudinary(
              filesArray,
              options
            );

            filesArray.forEach((file, index) => {
              file.cloudinaryUrl = results[index].secure_url;
              file.cloudinaryPublicId = results[index].public_id;
              file.cloudinaryResult = results[index];
            });

            req.cloudinaryUrls[fieldName] = results.map((r) => r.secure_url);
          }
        }
      }

      console.log('✅ Cloudinary upload complete\n');
      next();
    } catch (error) {
      console.error('❌ Cloudinary upload middleware error:', error);
      return res.status(500).json({
        error: 'Upload failed',
        message: `Failed to upload to Cloudinary: ${error.message}`,
      });
    }
  };
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of public_ids
 * @returns {Promise<Array>} - Array of deletion results
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  const deletePromises = publicIds.map((publicId) =>
    deleteFromCloudinary(publicId)
  );
  return await Promise.all(deletePromises);
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} - Extracted public_id
 */
const extractPublicId = (cloudinaryUrl) => {
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
  // Extract: folder/image
  const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return matches ? matches[1] : null;
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  cloudinaryUploadMiddleware,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId,
};
