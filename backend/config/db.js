const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log(`Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('All MongoDB connection attempts failed. Server will continue without DB.');
        // Do NOT call process.exit — let the server keep running
        // API calls that need DB will fail gracefully with 500 errors
      }
    }
  }
};

module.exports = connectDB;