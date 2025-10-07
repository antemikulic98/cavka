import dotenv from 'dotenv';
import { connectMongoDB } from '../lib/mongodb';
import Vehicle from '../models/Vehicle';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sampleVehicles = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Silver',
    licensePlate: 'ZG-1001-TC',
    category: 'Standard',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    airConditioning: true,
    passengerCapacity: 5,
    doorCount: 4,
    luggageCapacity: 473,
    features: [
      'Bluetooth',
      'GPS Navigation',
      'Backup Camera',
      'Cruise Control',
      'USB Ports',
    ],
    dailyRate: 65,
    currency: 'EUR',
    location: 'Zagreb Downtown',
    description:
      'Comfortable midsize sedan perfect for business trips and family outings.',
    status: 'Available',
  },
  {
    make: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    color: 'White',
    licensePlate: 'ZG-1002-VG',
    category: 'Compact',
    transmission: 'Manual',
    fuelType: 'Petrol',
    airConditioning: true,
    passengerCapacity: 5,
    doorCount: 5,
    luggageCapacity: 380,
    features: ['Bluetooth', 'USB Ports', 'Apple CarPlay', 'Android Auto'],
    dailyRate: 45,
    currency: 'EUR',
    location: 'Zagreb Downtown',
    description: 'Reliable and economical compact car, great for city driving.',
    status: 'Available',
  },
  {
    make: 'BMW',
    model: 'X3',
    year: 2023,
    color: 'Black',
    licensePlate: 'ZG-1003-BX',
    category: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    airConditioning: true,
    passengerCapacity: 5,
    doorCount: 5,
    luggageCapacity: 550,
    features: [
      'Leather Interior',
      'GPS Navigation',
      'Heated Seats',
      'Sunroof',
      'Premium Sound System',
      'Keyless Entry',
    ],
    dailyRate: 95,
    currency: 'EUR',
    location: 'Zagreb Airport',
    description: 'Premium SUV with excellent comfort and performance.',
    status: 'Available',
  },
  {
    make: 'Opel',
    model: 'Corsa',
    year: 2022,
    color: 'Blue',
    licensePlate: 'ZG-1004-OC',
    category: 'Economy',
    transmission: 'Manual',
    fuelType: 'Petrol',
    airConditioning: true,
    passengerCapacity: 5,
    doorCount: 5,
    luggageCapacity: 309,
    features: ['Bluetooth', 'USB Ports'],
    dailyRate: 35,
    currency: 'EUR',
    location: 'Split Downtown',
    description: 'Perfect economy car for budget-conscious travelers.',
    status: 'Available',
  },
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2023,
    color: 'Gray',
    licensePlate: 'ZG-1005-ME',
    category: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    airConditioning: true,
    passengerCapacity: 5,
    doorCount: 4,
    luggageCapacity: 540,
    features: [
      'Leather Interior',
      'GPS Navigation',
      'Heated Seats',
      'Premium Sound System',
      'Keyless Entry',
      'Wireless Charging',
    ],
    dailyRate: 120,
    currency: 'EUR',
    location: 'Zagreb Downtown',
    description: 'Luxury sedan with hybrid technology and premium features.',
    status: 'Available',
  },
];

function generateAcrissCode(vehicle: any): string {
  const categoryCode = vehicle.category.charAt(0).toUpperCase();
  const transmissionCode = vehicle.transmission === 'Automatic' ? 'A' : 'M';
  const fuelCode =
    vehicle.fuelType === 'Petrol'
      ? 'P'
      : vehicle.fuelType.charAt(0).toUpperCase();
  const acCode = vehicle.airConditioning ? 'A' : 'N';

  return `${categoryCode}${transmissionCode}${fuelCode}${acCode}`;
}

async function createSampleCars() {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Find a user to assign as the creator (use the first available user)
    const user = await User.findOne();
    if (!user) {
      console.error('No users found! Please create a user first.');
      process.exit(1);
    }

    console.log(
      `Creating sample vehicles (assigned to: ${user.fullName})...\n`
    );

    for (const vehicleData of sampleVehicles) {
      // Check if vehicle already exists
      const existingVehicle = await Vehicle.findOne({
        licensePlate: vehicleData.licensePlate,
      });

      if (existingVehicle) {
        console.log(
          `✓ Vehicle already exists: ${vehicleData.make} ${vehicleData.model} (${vehicleData.licensePlate})`
        );
        continue;
      }

      // Generate ACRISS code and add required fields
      const vehicleWithAcriss = {
        ...vehicleData,
        acrissCode: generateAcrissCode(vehicleData),
        images: [
          `/api/placeholder-${vehicleData.make.toLowerCase()}-${vehicleData.model.toLowerCase()}-1.jpg`,
          `/api/placeholder-${vehicleData.make.toLowerCase()}-${vehicleData.model.toLowerCase()}-2.jpg`,
        ],
        mainImage: `/api/placeholder-${vehicleData.make.toLowerCase()}-${vehicleData.model.toLowerCase()}-1.jpg`,
        addedBy: user._id,
      };

      // Create new vehicle
      const vehicle = new Vehicle(vehicleWithAcriss);
      await vehicle.save();

      console.log('✓ Vehicle created successfully:');
      console.log(`  ${vehicle.fullName}`);
      console.log(`  Category: ${vehicle.category}`);
      console.log(`  ACRISS: ${vehicle.acrissCode}`);
      console.log(`  Rate: ${vehicle.formattedDailyRate}/day`);
      console.log(`  License: ${vehicle.licensePlate}`);
      console.log(`  ID: ${vehicle._id}`);
      console.log('');
    }

    console.log('All sample vehicles processed successfully!');

    // Show summary
    const totalVehicles = await Vehicle.countDocuments();
    console.log(`\nTotal vehicles in database: ${totalVehicles}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample vehicles:', error);
    process.exit(1);
  }
}

// Run the script
createSampleCars();
