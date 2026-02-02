import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectMongoDB } from '../lib/mongodb';
import Location from '../models/Location';

async function updateLocations() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectMongoDB();

    console.log('✅ Connected to MongoDB');
    console.log('📍 Updating locations with serviceType...\n');

    const result = await Location.updateMany(
      { serviceType: { $exists: false } },
      { $set: { serviceType: 'both' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} locations to have serviceType: 'both'`);

    const allLocations = await Location.find({});
    console.log('\n📊 All locations:');
    allLocations.forEach(loc => {
      console.log(`  - ${loc.name}: ${loc.serviceType || 'NOT SET'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Update error:', error);
    process.exit(1);
  }
}

updateLocations();
