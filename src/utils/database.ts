
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectToMongoDB = async () => {
    const DB_URL = process.env.MONGODB_URI!;
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }

}


export default connectToMongoDB;