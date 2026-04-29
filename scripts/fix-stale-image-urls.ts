import dotenv from 'dotenv';
import { connectMongoDB } from '../lib/mongodb';
import Vehicle from '../models/Vehicle';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  console.log('=== Fix Stale Image URLs ===\n');

  await connectMongoDB();
  console.log('Connected to MongoDB\n');

  const vehicles = await Vehicle.find({
    images: { $exists: true, $not: { $size: 0 } },
  });

  console.log(`Found ${vehicles.length} vehicles with images array\n`);

  let totalFixed = 0;

  for (const vehicle of vehicles) {
    const name = `${vehicle.make} ${vehicle.vehicleModel} (${vehicle._id})`;
    let updated = false;

    if (vehicle.images && vehicle.images.length > 0) {
      const newImages: string[] = [];
      for (const url of vehicle.images) {
        if (url.includes('digitaloceanspaces.com') && /\.(jpg|jpeg|png|gif)$/i.test(url)) {
          const fixedUrl = url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
          newImages.push(fixedUrl);
          console.log(`  ${name}: ${url.split('/').pop()} -> ${fixedUrl.split('/').pop()}`);
          totalFixed++;
          updated = true;
        } else {
          newImages.push(url);
        }
      }
      vehicle.images = newImages;
    }

    if (updated) {
      await vehicle.save();
    }
  }

  console.log(`\nFixed ${totalFixed} stale image URLs`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});
