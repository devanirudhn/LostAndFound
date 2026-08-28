const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.DB_URL;

  if (!uri) {
    console.error('❌ DB_URL environment variable is not set.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
