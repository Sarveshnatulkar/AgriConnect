const cloudinary = require("cloudinary").v2;

/**
 * Configures Cloudinary using credentials from environment variables.
 * This module is required wherever image uploads are handled.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
