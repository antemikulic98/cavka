import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectMongoDB } from '../lib/mongodb';
import Location from '../models/Location';

const defaultLocations = [
  { name: 'Zagreb Downtown', city: 'Zagreb', type: 'both', order: 1 },
  { name: 'Zagreb Airport', city: 'Zagreb', type: 'both', order: 2 },
  { name: 'Split Downtown', city: 'Split', type: 'both', order: 3 },
  { name: 'Split Airport', city: 'Split', type: 'both', order: 4 },
  { name: 'Dubrovnik Downtown', city: 'Dubrovnik', type: 'both', order: 5 },
  { name: 'Dubrovnik Airport', city: 'Dubrovnik', type: 'both', order: 6 },
  { name: 'Rijeka Downtown', city: 'Rijeka', type: 'both', order: 7 },
  { name: 'Pula Downtown', city: 'Pula', type: 'both', order: 8 },
  { name: 'Zadar Downtown', city: 'Zadar', type: 'both', order: 9 },
];

async function migrateLocations() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectMongoDB();

    console.log('✅ Connected to MongoDB');
    console.log('📍 Starting location migration...\n');

    for (const locationData of defaultLocations) {
      const existing = await Location.findOne({ name: locationData.name });

      if (existing) {
        console.log(`⏭️  Skipping "${locationData.name}" (already exists)`);
      } else {
        const location = new Location({
          ...locationData,
          active: true,
        });
        await location.save();
        console.log(`✅ Added "${locationData.name}"`);
      }
    }

    console.log('\n🎉 Location migration completed!');
    console.log(`📊 Total locations in database: ${await Location.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateLocations();
