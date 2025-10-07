import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectMongoDB } from '../lib/mongodb';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

async function createUser() {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    const usersData: CreateUserData[] = [
      {
        first_name: 'Ante',
        last_name: 'Mikulic',
        email: 'ante@hitrentacar.com',
        password: '12345678',
      },
      {
        first_name: 'Ivan',
        last_name: 'Cavka',
        email: 'cavka@hitrentacar.com',
        password: '12345678',
      },
    ];

    console.log('Creating users...\n');

    for (const userData of usersData) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`✓ User already exists: ${userData.email}`);
        continue;
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      console.log('✓ User created successfully:');
      console.log('  Name:', user.fullName);
      console.log('  Email:', user.email);
      console.log('  ID:', user._id);
      console.log('');
    }

    console.log('All users processed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

// Run the script
createUser();
