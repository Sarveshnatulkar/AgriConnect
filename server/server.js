const dotenv = require("dotenv");
dotenv.config(); // Must be called before importing anything that uses process.env

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

/**
 * Entry point for the AgriConnect backend server.
 *
 * Startup sequence:
 * 1. Load environment variables
 * 2. Connect to MongoDB Atlas
 * 3. Start the HTTP server
 *
 * Why is dotenv.config() called here and not in app.js?
 * server.js is the true entry point. Calling dotenv here ensures env vars
 * are available to every module that gets required after this point.
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
  });
};

startServer();
