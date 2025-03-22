// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables again to be safe
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Fallback MongoDB URI in case environment variable fails
const fallbackURI = 'mongodb+srv://anujkumarsharma2023:mascssco@fastpy.qf9ces1.mongodb.net/todo-app?retryWrites=true&w=majority&appName=fastpy';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || fallbackURI;
    console.log("Attempting to connect to MongoDB with URI:", uri ? "URI is defined" : "URI is undefined");
    
    if (!uri) {
      throw new Error("MongoDB URI is not defined. Check your .env file.");
    }
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;