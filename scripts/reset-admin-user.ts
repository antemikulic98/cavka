/**
 * Reset Admin User - Delete old users and create new admin
 *
 * This script will:
 * 1. Delete existing users (john.doe@example.com, ante@hitrentacar.com, cavka@hitrentacar.com)
 * 2. Create new admin user: ivan@hitrent.com with password 123Cavka!
 *
 * IMPORTANT: This only affects the users collection - all other data remains intact
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: { type: String },
  last_name: { type: String },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetAdminUser() {
  try {
    console.log('🔧 Starting admin user reset...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Backup current users (just log them)
    console.log('📋 Current users in database:');
    const currentUsers = await User.find({}).select('-password').lean();
    currentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.first_name} ${user.last_name}`);
    });
    console.log('');

    // Step 2: Delete old users
    console.log('🗑️  Deleting existing users...');
    const usersToDelete = [
      'john.doe@example.com',
      'ante@hitrentacar.com',
      'cavka@hitrentacar.com'
    ];

    for (const email of usersToDelete) {
      const result = await User.deleteOne({ email });
      if (result.deletedCount > 0) {
        console.log(`   ✅ Deleted: ${email}`);
      } else {
        console.log(`   ⚠️  Not found: ${email}`);
      }
    }
    console.log('');

    // Step 3: Create new admin user
    console.log('👤 Creating new admin user...');

    const newAdminEmail = 'ivan@hitrent.com';
    const newAdminPassword = '123Cavka!';

    // Check if user already exists
    const existingUser = await User.findOne({ email: newAdminEmail });
    if (existingUser) {
      console.log(`⚠️  User ${newAdminEmail} already exists. Deleting old one first...`);
      await User.deleteOne({ email: newAdminEmail });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);

    // Create user
    const newAdmin = new User({
      email: newAdminEmail,
      password: hashedPassword,
      first_name: 'Ivan',
      last_name: 'Cavka',
      role: 'admin',
    });

    await newAdmin.save();
    console.log(`✅ Admin user created successfully!\n`);

    // Step 4: Verify
    console.log('🔍 Verifying new user...');
    const verifyUser = await User.findOne({ email: newAdminEmail }).select('-password');
    if (verifyUser) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ NEW ADMIN USER DETAILS:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`   Email:      ${verifyUser.email}`);
      console.log(`   Password:   123Cavka!`);
      console.log(`   Name:       ${verifyUser.first_name} ${verifyUser.last_name}`);
      console.log(`   Role:       ${verifyUser.role}`);
      console.log(`   Created:    ${verifyUser.createdAt}`);
      console.log('═══════════════════════════════════════════════════════════════');
    }

    // Final count
    const finalCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${finalCount}`);

    // Check other collections to ensure nothing was deleted
    console.log('\n🔍 Verifying other collections are intact...');
    const db = mongoose.connection.db;
    if (db) {
      const vehiclesCount = await db.collection('vehicles').countDocuments();
      const bookingsCount = await db.collection('bookings').countDocuments();
      const locationsCount = await db.collection('locations').countDocuments();

      console.log(`   ✅ Vehicles:  ${vehiclesCount} documents`);
      console.log(`   ✅ Bookings:  ${bookingsCount} documents`);
      console.log(`   ✅ Locations: ${locationsCount} documents`);
    }

    console.log('\n✅ Admin user reset completed successfully!');
    console.log('\n💡 You can now login with:');
    console.log('   Email:    ivan@hitrent.com');
    console.log('   Password: 123Cavka!\n');

  } catch (error) {
    console.error('\n❌ Error resetting admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the script
resetAdminUser()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
