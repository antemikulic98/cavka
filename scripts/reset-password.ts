import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectMongoDB } from '../lib/mongodb';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function resetPassword() {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB\n');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--list') {
      // List all users
      console.log('📋 All users in database:\n');
      const users = await User.find({}, 'first_name last_name email createdAt');
      
      if (users.length === 0) {
        console.log('No users found in database.');
      } else {
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
          console.log('');
        });
      }
      
      console.log('----------------------------------------');
      console.log('To reset a password, run:');
      console.log('yarn tsx scripts/reset-password.ts <email> <new-password>');
      console.log('\nExample:');
      console.log('yarn tsx scripts/reset-password.ts ante@hitrentacar.com novaSifra123');
      
    } else if (args.length === 2) {
      // Reset password
      const [email, newPassword] = args;
      
      if (newPassword.length < 6) {
        console.log('❌ Password must be at least 6 characters long.');
        process.exit(1);
      }
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log(`❌ User with email "${email}" not found.`);
        console.log('\nRun without arguments to see all users:');
        console.log('yarn tsx scripts/reset-password.ts');
        process.exit(1);
      }
      
      // Update password (will be hashed by pre-save hook)
      user.password = newPassword;
      await user.save();
      
      console.log('✅ Password reset successfully!');
      console.log(`   User: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   New password: ${newPassword}`);
      
    } else {
      console.log('Usage:');
      console.log('  List all users:     yarn tsx scripts/reset-password.ts');
      console.log('  Reset password:     yarn tsx scripts/reset-password.ts <email> <new-password>');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
resetPassword();

