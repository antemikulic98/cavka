// Test script to verify booking creation API
async function testBookingCreation() {
  const testBooking = {
    clientInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      countryCode: '+1',
      phoneNumber: '555-TEST-123',
    },
    vehicleId: '507f1f77bcf86cd799439011', // Placeholder ID - replace with actual
    pickupDate: new Date('2024-02-01').toISOString(),
    returnDate: new Date('2024-02-05').toISOString(),
    pickupLocation: 'Test Location',
    rentalDays: 4,
    cdwCoverage: 'basic',
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
  };

  try {
    console.log('🧪 Testing booking creation API...');

    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Booking API test PASSED!');
      console.log('📋 Booking Reference:', data.booking.bookingReference);
      console.log(
        '💰 Total Cost: €' + data.booking.pricing.totalCost.toFixed(2)
      );
    } else {
      console.log('❌ Booking API test FAILED:');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:');
    console.log(error);
  }
}

// Note: This is a manual test script
// Run this after starting your development server:
// 1. yarn dev (in terminal)
// 2. node -e "$(cat scripts/test-booking-api.ts)"
console.log('📝 Test script loaded. Call testBookingCreation() to run test.');
export { testBookingCreation };
