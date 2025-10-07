import { connectMongoDB } from '../lib/mongodb';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';

async function createSampleAdminBookings() {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Find available vehicles
    const vehicles = await Vehicle.find({ status: 'available' }).limit(3);
    if (vehicles.length === 0) {
      console.error(
        'No available vehicles found. Please create some vehicles first.'
      );
      return;
    }

    console.log(`Found ${vehicles.length} vehicles to create bookings for`);

    // Sample client data for different bookings
    const sampleClients = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        countryCode: '+1',
        phoneNumber: '555-123-4567',
        company: 'Tech Corp',
        flightNumber: 'AA1234',
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@example.com',
        countryCode: '+34',
        phoneNumber: '666-789-012',
        company: 'Design Studio',
        flightNumber: 'IB5678',
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        countryCode: '+44',
        phoneNumber: '20-7946-0958',
        flightNumber: 'BA9101',
      },
      {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@example.com',
        countryCode: '+49',
        phoneNumber: '30-12345678',
        company: 'Engineering GmbH',
      },
      {
        firstName: 'Luca',
        lastName: 'Rossi',
        email: 'luca.rossi@example.com',
        countryCode: '+39',
        phoneNumber: '06-12345678',
        flightNumber: 'AZ1213',
      },
    ];

    // Sample booking scenarios with different statuses and dates
    const bookingScenarios = [
      {
        pickupDate: new Date('2024-12-25'),
        returnDate: new Date('2024-12-30'),
        rentalDays: 5,
        status: 'confirmed',
        cdwCoverage: 'basic',
        addOns: {
          additionalDriver: false,
          wifiHotspot: true,
          roadsideAssistance: false,
          tireProtection: false,
          personalAccident: false,
          theftProtection: false,
          extendedTheft: false,
          interiorProtection: false,
        },
      },
      {
        pickupDate: new Date('2025-01-05'),
        returnDate: new Date('2025-01-12'),
        rentalDays: 7,
        status: 'in_progress',
        cdwCoverage: 'full',
        addOns: {
          additionalDriver: true,
          wifiHotspot: true,
          roadsideAssistance: true,
          tireProtection: false,
          personalAccident: true,
          theftProtection: false,
          extendedTheft: false,
          interiorProtection: false,
        },
      },
      {
        pickupDate: new Date('2025-01-15'),
        returnDate: new Date('2025-01-18'),
        rentalDays: 3,
        status: 'pending',
        cdwCoverage: 'basic',
        addOns: {
          additionalDriver: false,
          wifiHotspot: false,
          roadsideAssistance: false,
          tireProtection: true,
          personalAccident: false,
          theftProtection: true,
          extendedTheft: false,
          interiorProtection: true,
        },
      },
      {
        pickupDate: new Date('2024-12-01'),
        returnDate: new Date('2024-12-05'),
        rentalDays: 4,
        status: 'completed',
        cdwCoverage: 'full',
        addOns: {
          additionalDriver: false,
          wifiHotspot: false,
          roadsideAssistance: false,
          tireProtection: false,
          personalAccident: false,
          theftProtection: false,
          extendedTheft: false,
          interiorProtection: false,
        },
      },
      {
        pickupDate: new Date('2024-11-20'),
        returnDate: new Date('2024-11-25'),
        rentalDays: 5,
        status: 'cancelled',
        cdwCoverage: 'basic',
        addOns: {
          additionalDriver: false,
          wifiHotspot: true,
          roadsideAssistance: true,
          tireProtection: false,
          personalAccident: false,
          theftProtection: false,
          extendedTheft: false,
          interiorProtection: false,
        },
      },
    ];

    const createdBookings = [];

    // Create bookings
    for (
      let i = 0;
      i < Math.min(sampleClients.length, bookingScenarios.length);
      i++
    ) {
      const client = sampleClients[i];
      const scenario = bookingScenarios[i];
      const vehicle = vehicles[i % vehicles.length]; // Cycle through available vehicles

      // Calculate pricing
      const cdwCost = scenario.cdwCoverage === 'full' ? 15 : 0;

      const addOnsPricing = {
        additionalDriver: 4.75,
        wifiHotspot: 4.6,
        roadsideAssistance: 1.2,
        tireProtection: 1.99,
        personalAccident: 2.39,
        theftProtection: 5.99,
        extendedTheft: 10.95,
        interiorProtection: 2.1,
      };

      let addOnsCost = 0;
      for (const [addon, selected] of Object.entries(scenario.addOns)) {
        if (selected && addOnsPricing[addon as keyof typeof addOnsPricing]) {
          addOnsCost += addOnsPricing[addon as keyof typeof addOnsPricing];
        }
      }

      const totalDailyRate = vehicle.dailyRate + cdwCost + addOnsCost;
      const totalCost = totalDailyRate * scenario.rentalDays;

      const bookingData = {
        clientInfo: client,
        vehicleId: vehicle._id,
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category,
          dailyRate: vehicle.dailyRate,
          currency: vehicle.currency,
        },
        pickupDate: scenario.pickupDate,
        returnDate: scenario.returnDate,
        pickupLocation: 'Zagreb Airport',
        rentalDays: scenario.rentalDays,
        cdwCoverage: scenario.cdwCoverage,
        addOns: scenario.addOns,
        pricing: {
          baseDailyRate: vehicle.dailyRate,
          cdwCost,
          addOnsCost,
          totalDailyRate,
          totalCost,
        },
        status: scenario.status,
      };

      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      createdBookings.push(savedBooking);

      console.log(
        `✅ Created booking ${savedBooking.bookingReference} (${scenario.status}) for ${client.firstName} ${client.lastName}`
      );
    }

    console.log(
      `\n🎉 Successfully created ${createdBookings.length} sample bookings!`
    );
    console.log('\n📊 Booking Summary:');

    const statusCounts = createdBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} booking(s)`);
    });

    console.log('\n🔍 You can now test the admin booking management:');
    console.log('   1. Go to the dashboard (/dashboard)');
    console.log('   2. Click "All Bookings" in the navigation');
    console.log('   3. View, filter, sort, and manage all bookings');
    console.log('   4. Try updating booking statuses');
    console.log('   5. Use search and filters to find specific bookings');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample bookings:', error);
    process.exit(1);
  }
}

// Run the script
createSampleAdminBookings();
