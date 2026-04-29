/**
 * Server-Side Pricing Calculation Library
 *
 * SECURITY: All pricing calculations MUST happen server-side to prevent tampering.
 * Never trust prices sent from the client.
 */

import Vehicle from '@/models/Vehicle';
import Location from '@/models/Location';
import InsurancePricing from '@/models/InsurancePricing';
import AddOnPricing from '@/models/AddOnPricing';
import mongoose from 'mongoose';

export interface PricingInput {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation?: string;
  rentalDays: number;
  cdwCoverage?: 'none' | 'basic' | 'full';
  addOns?: {
    additionalDriver?: boolean;
    wifiHotspot?: boolean;
    roadsideAssistance?: boolean;
    tireProtection?: boolean;
    personalAccident?: boolean;
    theftProtection?: boolean;
    extendedTheft?: boolean;
    interiorProtection?: boolean;
  };
}

export interface PricingResult {
  baseVehicleCost: number;
  cdwCost: number;
  addOnsCost: number;
  totalBeforeDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  totalAfterDiscount: number;
  priceBreakdown: {
    vehicleCostPerDay?: number;
    vehicleTotalCost: number;
    cdwCostPerDay?: number;
    cdwTotalCost: number;
    addOnsDetails: Array<{ name: string; price: number }>;
    addOnsTotalCost: number;
  };
}

/**
 * Calculate complete pricing for a booking
 * All calculations happen server-side with database prices
 */
export async function calculateBookingPrice(
  input: PricingInput
): Promise<PricingResult> {
  // Validate vehicle ID
  if (!mongoose.Types.ObjectId.isValid(input.vehicleId)) {
    throw new Error('Invalid vehicle ID');
  }

  // Fetch vehicle from database
  const vehicle = await Vehicle.findById(input.vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  // Calculate base vehicle cost
  const baseVehicleCost = await calculateVehicleCost(
    vehicle,
    input.pickupDate,
    input.rentalDays,
    input.pickupLocation,
    input.returnLocation
  );

  // Calculate CDW cost
  const cdwCost = await calculateCDWCost(
    vehicle,
    input.cdwCoverage || 'none',
    input.rentalDays
  );

  // Calculate add-ons cost
  const addOnsResult = await calculateAddOnsCost(
    vehicle,
    input.addOns || {},
    input.rentalDays
  );

  // Calculate discount
  const totalBeforeDiscount = baseVehicleCost + cdwCost + addOnsResult.total;
  const discountPercentage = vehicle.type === 'transfer' ? 10 : 15;
  const discountAmount = totalBeforeDiscount * (discountPercentage / 100);
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;

  return {
    baseVehicleCost,
    cdwCost,
    addOnsCost: addOnsResult.total,
    totalBeforeDiscount,
    discountPercentage,
    discountAmount,
    totalAfterDiscount,
    priceBreakdown: {
      vehicleCostPerDay: vehicle.type !== 'transfer' && input.rentalDays > 0
        ? baseVehicleCost / input.rentalDays
        : undefined,
      vehicleTotalCost: baseVehicleCost,
      cdwCostPerDay: vehicle.type !== 'transfer' && cdwCost > 0 && input.rentalDays > 0
        ? cdwCost / input.rentalDays
        : undefined,
      cdwTotalCost: cdwCost,
      addOnsDetails: addOnsResult.details,
      addOnsTotalCost: addOnsResult.total,
    },
  };
}

/**
 * Calculate driving distance between two locations using Google Maps API
 */
async function calculateDistanceKm(
  pickupLocation: string,
  returnLocation: string
): Promise<number | null> {
  try {
    const [fromLoc, toLoc] = await Promise.all([
      Location.findOne({ name: { $regex: new RegExp(`^${pickupLocation}$`, 'i') } }),
      Location.findOne({ name: { $regex: new RegExp(`^${returnLocation}$`, 'i') } }),
    ]);

    if (!fromLoc?.lat || !fromLoc?.lng || !toLoc?.lat || !toLoc?.lng) {
      return null;
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLoc.lat},${fromLoc.lng}&destinations=${toLoc.lat},${toLoc.lng}&mode=driving&units=metric&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const element = data.rows?.[0]?.elements?.[0];
    if (element?.status === 'OK') {
      return Math.round(element.distance.value / 1000);
    }
  } catch (err) {
    console.error('Distance calculation error:', err);
  }
  return null;
}

/**
 * Calculate vehicle base cost
 * For rentals: sum of daily rates with custom pricing
 * For transfers: km * pricePerKm (with trips[] override)
 */
async function calculateVehicleCost(
  vehicle: any,
  pickupDate: string,
  rentalDays: number,
  pickupLocation?: string,
  returnLocation?: string
): Promise<number> {
  // For transfer vehicles
  if (vehicle.type === 'transfer') {
    // 1. Check for matching trip override
    if (vehicle.trips && vehicle.trips.length > 0 && pickupLocation && returnLocation) {
      const matchingTrip = vehicle.trips.find(
        (trip: any) =>
          trip.from.toLowerCase() === pickupLocation.toLowerCase() &&
          trip.to.toLowerCase() === returnLocation.toLowerCase()
      );
      if (matchingTrip && matchingTrip.price > 0) {
        return matchingTrip.price;
      }
    }

    // 2. Calculate from km * pricePerKm
    if (vehicle.pricePerKm && pickupLocation && returnLocation) {
      const km = await calculateDistanceKm(pickupLocation, returnLocation);
      if (km && km > 0) {
        return Math.round(km * vehicle.pricePerKm * 100) / 100;
      }
    }

    // 3. Fallback to first trip price or dailyRate
    if (vehicle.trips && vehicle.trips.length > 0) {
      const price = vehicle.trips[0].price;
      if (price && price > 0) return price;
    }
    if (vehicle.dailyRate && vehicle.dailyRate > 0) {
      return vehicle.dailyRate;
    }
    throw new Error('Transfer vehicle has no pricing configured');
  }

  // For rental vehicles, calculate with custom pricing
  let total = 0;
  const pickupDateObj = new Date(pickupDate);

  for (let i = 0; i < rentalDays; i++) {
    const currentDate = new Date(pickupDateObj);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Check for custom pricing
    const customPrice = vehicle.customPricing?.find(
      (p: any) => p.date === dateStr
    );

    total += customPrice ? customPrice.price : vehicle.dailyRate;
  }

  return total;
}

/**
 * Calculate CDW insurance cost
 * Transfer vehicles don't have insurance
 */
async function calculateCDWCost(
  vehicle: any,
  coverage: 'none' | 'basic' | 'full',
  rentalDays: number
): Promise<number> {
  // Transfer vehicles have no insurance
  if (vehicle.type === 'transfer' || coverage === 'none') {
    return 0;
  }

  // Fetch insurance pricing from database based on vehicle's ACRISS code
  const acrissCode = vehicle.acrissCode || '';
  let insurancePricing = { dailyPrice: 5, fullCoveragePrice: 10 };
  if (acrissCode) {
    const dbPricing = await InsurancePricing.findOne({ acrissCode });
    if (dbPricing) {
      insurancePricing = {
        dailyPrice: dbPricing.dailyPrice,
        fullCoveragePrice: dbPricing.fullCoveragePrice || 10,
      };
    }
  }

  const dailyRate =
    coverage === 'basic'
      ? insurancePricing.dailyPrice
      : insurancePricing.fullCoveragePrice;

  return dailyRate * rentalDays;
}

/**
 * Calculate add-ons cost
 * Transfer vehicles have no add-ons
 */
async function calculateAddOnsCost(
  vehicle: any,
  addOns: any,
  rentalDays: number
): Promise<{ total: number; details: Array<{ name: string; price: number }> }> {
  // Transfer vehicles have no add-ons
  if (vehicle.type === 'transfer') {
    return { total: 0, details: [] };
  }

  // Fetch add-on pricing from database based on vehicle's ACRISS code
  const addOnAcrissCode = vehicle.acrissCode || '';
  let addOnsPricing: Record<string, number> = {
    additionalDriver: 4.75,
    wifiHotspot: 4.6,
    roadsideAssistance: 1.2,
    tireProtection: 1.99,
    personalAccident: 2.39,
    theftProtection: 5.99,
    extendedTheft: 10.95,
    interiorProtection: 2.1,
  };
  if (addOnAcrissCode) {
    const dbAddOns = await AddOnPricing.findOne({ acrissCode: addOnAcrissCode });
    if (dbAddOns) {
      addOnsPricing = {
        additionalDriver: dbAddOns.additionalDriver ?? 4.75,
        wifiHotspot: dbAddOns.wifiHotspot ?? 4.6,
        roadsideAssistance: dbAddOns.roadsideAssistance ?? 1.2,
        tireProtection: dbAddOns.tireProtection ?? 1.99,
        personalAccident: dbAddOns.personalAccident ?? 2.39,
        theftProtection: dbAddOns.theftProtection ?? 5.99,
        extendedTheft: dbAddOns.extendedTheft ?? 10.95,
        interiorProtection: dbAddOns.interiorProtection ?? 2.1,
      };
    }
  }

  const details: Array<{ name: string; price: number }> = [];
  let totalPerDay = 0;

  for (const [key, enabled] of Object.entries(addOns)) {
    if (enabled && addOnsPricing[key]) {
      const price = addOnsPricing[key];
      totalPerDay += price;
      details.push({
        name: key,
        price: price * rentalDays,
      });
    }
  }

  return {
    total: totalPerDay * rentalDays,
    details,
  };
}

/**
 * Validate pricing input
 */
export function validatePricingInput(input: PricingInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.vehicleId || !mongoose.Types.ObjectId.isValid(input.vehicleId)) {
    errors.push('Invalid vehicle ID');
  }

  if (!input.pickupDate || isNaN(new Date(input.pickupDate).getTime())) {
    errors.push('Invalid pickup date');
  }

  if (!input.returnDate || isNaN(new Date(input.returnDate).getTime())) {
    errors.push('Invalid return date');
  }

  if (input.rentalDays < 1 || input.rentalDays > 365) {
    errors.push('Invalid rental days');
  }

  if (!input.pickupLocation || input.pickupLocation.trim() === '') {
    errors.push('Pickup location is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
