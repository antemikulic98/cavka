import { connectMongoDB } from '../lib/mongodb';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';

async function createSampleBooking() {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Find a random available vehicle
    const vehicle = await Vehicle.findOne({ status: 'available' });
    if (!vehicle) {
      console.error(
        'No available vehicles found. Please create some vehicles first.'
      );
      return;
    }

    console.log(`Found vehicle: ${vehicle.make} ${vehicle.model}`);

    // Create sample booking data
    const bookingData = {
      clientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        countryCode: '+1',
        phoneNumber: '555-123-4567',
        company: 'Sample Corp',
        flightNumber: 'AA1234',
      },
      vehicleId: vehicle._id,
      vehicleInfo: {
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        dailyRate: vehicle.dailyRate,
        currency: vehicle.currency,
      },
      pickupDate: new Date('2024-01-15'),
      returnDate: new Date('2024-01-18'),
      pickupLocation: 'Zagreb Airport',
      rentalDays: 3,
      cdwCoverage: 'full',
      addOns: {
        additionalDriver: true,
        wifiHotspot: true,
        roadsideAssistance: false,
        tireProtection: false,
        personalAccident: false,
        theftProtection: false,
        extendedTheft: false,
        interiorProtection: false,
      },
      pricing: {
        baseDailyRate: vehicle.dailyRate,
        cdwCost: 15,
        addOnsCost: 4.75 + 4.6, // additional driver + wifi
        totalDailyRate: vehicle.dailyRate + 15 + 4.75 + 4.6,
        totalCost: (vehicle.dailyRate + 15 + 4.75 + 4.6) * 3,
      },
    };

    // Create the booking
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    console.log('✅ Sample booking created successfully!');
    console.log(`📋 Booking Reference: ${savedBooking.bookingReference}`);
    console.log(
      `👤 Customer: ${savedBooking.clientInfo.firstName} ${savedBooking.clientInfo.lastName}`
    );
    console.log(
      `🚗 Vehicle: ${savedBooking.vehicleInfo.make} ${savedBooking.vehicleInfo.model}`
    );
    console.log(
      `📅 Dates: ${savedBooking.pickupDate.toDateString()} - ${savedBooking.returnDate.toDateString()}`
    );
    console.log(`💰 Total Cost: €${savedBooking.pricing.totalCost.toFixed(2)}`);
    console.log(`📧 Email for lookup: ${savedBooking.clientInfo.email}`);

    console.log('\n🔍 You can now test the booking lookup at /bookings using:');
    console.log(`   Email: ${savedBooking.clientInfo.email}`);
    console.log(`   Reference: ${savedBooking.bookingReference}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample booking:', error);
    process.exit(1);
  }
}

// Run the script
createSampleBooking();
