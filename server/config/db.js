import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/** @type {mongoose.mongo.GridFSBucket | null} */
let gfsBucket = null;

/**
 * Connect to MongoDB and initialize GridFS bucket.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const db = conn.connection.db;

    // Initialize GridFS bucket once the connection is open
    gfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });

    console.log('GridFS bucket initialized');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Get the GridFS bucket instance.
 * @returns {mongoose.mongo.GridFSBucket}
 * @throws {Error} If GridFS bucket is not initialized
 */
const getGfsBucket = () => {
  if (!gfsBucket) {
    throw new Error('GridFS bucket not initialized. Ensure MongoDB is connected first.');
  }
  return gfsBucket;
};

export { connectDB, getGfsBucket };
