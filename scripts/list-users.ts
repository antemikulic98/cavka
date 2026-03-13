/**
 * List all users in the database
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Simple User schema for querying
const UserSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  role: String,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    console.log('🔍 Listing all users from the database...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all users
    const users = await User.find({}).select('-password').lean();

    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      return;
    }

    console.log(`📊 Found ${users.length} user(s):\n`);
    console.log('═══════════════════════════════════════════════════════════════');

    users.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}`);
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`   ID:         ${user._id}`);
      console.log(`   Email:      ${user.email}`);
      console.log(`   Name:       ${user.first_name || 'N/A'} ${user.last_name || 'N/A'}`);
      console.log(`   Role:       ${user.role || 'N/A'}`);
      console.log(`   Created:    ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
      console.log(`   Updated:    ${user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Total users: ${users.length}\n`);

  } catch (error) {
    console.error('\n❌ Error listing users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
listUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
