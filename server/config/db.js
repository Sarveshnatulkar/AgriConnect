const mongoose = require("mongoose");

/**
 * Connects to MongoDB Atlas using the URI from environment variables.
 * Called once at server startup. If connection fails, the process exits
 * to prevent the server from running without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
