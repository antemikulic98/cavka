/**
 * Server-Side Pricing Calculation Library
 *
 * SECURITY: All pricing calculations MUST happen server-side to prevent tampering.
 * Never trust prices sent from the client.
 */

import Vehicle from '@/models/Vehicle';
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
    input.rentalDays
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
      vehicleCostPerDay: vehicle.type !== 'transfer'
        ? baseVehicleCost / input.rentalDays
        : undefined,
      vehicleTotalCost: baseVehicleCost,
      cdwCostPerDay: vehicle.type !== 'transfer' && cdwCost > 0
        ? cdwCost / input.rentalDays
        : undefined,
      cdwTotalCost: cdwCost,
      addOnsDetails: addOnsResult.details,
      addOnsTotalCost: addOnsResult.total,
    },
  };
}

/**
 * Calculate vehicle base cost
 * For rentals: sum of daily rates with custom pricing
 * For transfers: fixed trip price
 */
async function calculateVehicleCost(
  vehicle: any,
  pickupDate: string,
  rentalDays: number
): Promise<number> {
  // For transfer vehicles, return trip price
  if (vehicle.type === 'transfer') {
    if (vehicle.trips && vehicle.trips.length > 0) {
      // Return first trip price (matching logic can be added later)
      return vehicle.trips[0].price;
    }
    return vehicle.dailyRate; // Fallback
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

  // Fetch insurance pricing from database (or use defaults)
  // TODO: Create InsurancePricing model and fetch from DB
  const insurancePricing = {
    dailyPrice: 5, // Basic CDW
    fullCoveragePrice: 10, // Full coverage
  };

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

  // Fetch add-on pricing from database (or use defaults)
  // TODO: Create AddOnPricing model and fetch from DB
  const addOnsPricing: Record<string, number> = {
    additionalDriver: 4.75,
    wifiHotspot: 4.6,
    roadsideAssistance: 1.2,
    tireProtection: 2.5,
    personalAccident: 3.0,
    theftProtection: 4.0,
    extendedTheft: 5.5,
    interiorProtection: 3.5,
  };

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
