const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Disable SSL verification for development (if needed)
// Remove this in production
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload resume to Cloudinary with compression
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {string} candidateName - Candidate name for folder organization
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
const uploadResume = async (fileBuffer, fileName, candidateName) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `staffanchor/resumes/${candidateName.replace(/\s+/g, '_')}`,
      resource_type: 'raw', // For PDF, DOCX, etc.
      public_id: `${fileName.split('.')[0]}_${Date.now()}`,
      // Enable automatic optimization
      quality: 'auto:low', // Reduce quality for compression
      fetch_format: 'auto',
      flags: 'attachment', // Force download when accessed
    };

    // Upload from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            fileName: fileName,
            fileSize: result.bytes
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete resume from Cloudinary
 * @param {string} publicId - The public_id of the file to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteResume = async (publicId) => {
  try {
    if (!publicId) {
      console.log('No publicId provided for deletion');
      return { result: 'no_public_id' };
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });

    console.log('Cloudinary deletion result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadResume,
  deleteResume
};

