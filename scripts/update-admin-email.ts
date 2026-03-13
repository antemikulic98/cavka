/**
 * Update admin email from ivan@hitrent.com to ivan@hit-rent.com
 */

import mongoose from 'mongoose';
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

async function updateAdminEmail() {
  try {
    console.log('📧 Updating admin email...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find user with old email
    const oldEmail = 'ivan@hitrent.com';
    const newEmail = 'ivan@hit-rent.com';

    console.log(`🔍 Looking for user with email: ${oldEmail}`);
    const user = await User.findOne({ email: oldEmail });

    if (!user) {
      console.log(`❌ User with email ${oldEmail} not found!`);
      return;
    }

    console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);
    console.log(`\n📝 Updating email from ${oldEmail} to ${newEmail}...`);

    // Update email
    user.email = newEmail;
    user.updatedAt = new Date();
    await user.save();

    console.log('✅ Email updated successfully!\n');

    // Verify
    console.log('🔍 Verifying update...');
    const verifyUser = await User.findOne({ email: newEmail }).select('-password');

    if (verifyUser) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ UPDATED ADMIN USER:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`   Email:      ${verifyUser.email}`);
      console.log(`   Password:   123Cavka!`);
      console.log(`   Name:       ${verifyUser.first_name} ${verifyUser.last_name}`);
      console.log(`   Role:       ${verifyUser.role}`);
      console.log(`   Updated:    ${verifyUser.updatedAt}`);
      console.log('═══════════════════════════════════════════════════════════════');
    }

    console.log('\n💡 You can now login with:');
    console.log('   Email:    ivan@hit-rent.com');
    console.log('   Password: 123Cavka!\n');

  } catch (error) {
    console.error('\n❌ Error updating email:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the script
updateAdminEmail()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
