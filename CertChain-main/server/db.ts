
import mongoose from 'mongoose';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('Using DATABASE_URL from environment');
  console.log(`   Connection: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
} else {
  console.log('DATABASE_URL not set in environment');
}

export async function initDb() {
  try {
    await mongoose.connect(dbUrl || 'mongodb+srv://charithareddy1074_db_user:12345678ch@cluster0.hgi5pa6.mongodb.net/certchain_db?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB database connected successfully');
    return true;
  } catch (err) {
    console.warn('Failed to connect to MongoDB:', (err as Error).message);
    console.warn('   Falling back to in-memory storage');
    return false;
  }
}

export const db = mongoose;
console.log('MongoDB connecting...');
