/**
 * Fix Insurance Pricing Collection Indexes
 *
 * This script removes the incorrect 'category_1' index from the insurancepricing collection
 * and ensures only the correct 'acrissCode_1' index exists.
 *
 * Problem: An old/incorrect index 'category_1' was created which causes duplicate key errors
 * when trying to save insurance pricing.
 *
 * Usage: npx tsx scripts/fix-insurance-indexes.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fixInsuranceIndexes() {
  try {
    console.log('🔧 Starting insurance pricing index fix...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get the collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('insurancepricings');

    // List all current indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });
    console.log('');

    // Check if the problematic 'category_1' index exists
    const hasCategoryIndex = indexes.some((idx) => idx.name === 'category_1');

    if (hasCategoryIndex) {
      console.log('🗑️  Removing incorrect "category_1" index...');
      try {
        await collection.dropIndex('category_1');
        console.log('✅ Successfully removed "category_1" index\n');
      } catch (error: any) {
        console.error('❌ Error removing index:', error.message);
        throw error;
      }
    } else {
      console.log('ℹ️  No "category_1" index found (already removed or never existed)\n');
    }

    // Verify correct indexes exist
    console.log('🔍 Verifying correct indexes...');
    const finalIndexes = await collection.indexes();

    const hasAcrissCodeIndex = finalIndexes.some(
      (idx) => idx.name === 'acrissCode_1' && idx.unique === true
    );

    if (hasAcrissCodeIndex) {
      console.log('✅ Correct "acrissCode_1" unique index exists');
    } else {
      console.log('⚠️  Warning: "acrissCode_1" unique index not found');
      console.log('   This index should be automatically created by Mongoose');
    }

    console.log('\n📋 Final indexes:');
    finalIndexes.forEach((index) => {
      const uniqueStr = index.unique ? ' (unique)' : '';
      console.log(`   - ${index.name}${uniqueStr}:`, JSON.stringify(index.key));
    });

    // Check for any documents with 'category' field (old/bad data)
    console.log('\n🔍 Checking for documents with "category" field...');
    const docsWithCategory = await collection
      .find({ category: { $exists: true } })
      .toArray();

    if (docsWithCategory.length > 0) {
      console.log(`⚠️  Found ${docsWithCategory.length} documents with "category" field:`);
      docsWithCategory.forEach((doc) => {
        console.log(`   - ID: ${doc._id}, category: ${doc.category}`);
      });
      console.log('\n❓ Do you want to remove these documents? (They are likely test data)');
      console.log('   Run: db.insurancepricings.deleteMany({ category: { $exists: true } })');
    } else {
      console.log('✅ No documents with "category" field found');
    }

    console.log('\n✨ Index fix completed successfully!');
    console.log('\n💡 You can now try saving insurance pricing again.');

  } catch (error) {
    console.error('\n❌ Error fixing indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the fix
fixInsuranceIndexes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
