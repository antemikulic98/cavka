import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectMongoDB } from '../lib/mongodb';
import Vehicle from '../models/Vehicle';

async function checkSwift() {
  try {
    await connectMongoDB();

    const vehicles = await Vehicle.find({
      make: { $regex: /suzuki/i }
    }).lean();

    console.log('Suzuki vehicles found:', vehicles.length);
    vehicles.forEach((v: any) => {
      console.log('---');
      console.log('Make/Model:', v.make, v.vehicleModel);
      console.log('Type:', v.type);
      console.log('Location:', v.location);
      console.log('Status:', v.status);
      console.log('ACRISS Code:', v.acrissCode);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSwift();
