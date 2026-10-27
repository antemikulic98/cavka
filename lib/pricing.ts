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
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  /** Display-only; the charged day count is always recomputed from the dates */
  rentalDays?: number;
  /** The 10/15% discount is a pay-now incentive — pay_later gets none */
  paymentMethod?: 'pay_now' | 'pay_later';
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
 * Number of chargeable rental days derived from the dates themselves.
 * SECURITY: never trust a client-sent day count — it multiplies the price.
 * Mirrors the client display logic (ceil of the time difference, minimum 1).
 */
export function computeRentalDays(
  pickupDate: string,
  returnDate: string
): number {
  // Parse 'YYYY-MM-DD[THH:mm]' as UTC instants — local-time parsing makes a
  // rental spanning the DST fall-back weekend one hour "longer" and Math.ceil
  // then bills an extra day
  const toUtc = (s: string): number => {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return NaN;
    return Date.UTC(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4] || 0),
      Number(m[5] || 0)
    );
  };
  const diff = toUtc(returnDate) - toUtc(pickupDate);
  if (!Number.isFinite(diff) || diff <= 0) return 1;
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
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

  // Derive the day count from the dates — input.rentalDays is display-only
  const rentalDays = computeRentalDays(input.pickupDate, input.returnDate);

  // Calculate base vehicle cost
  const baseVehicleCost = await calculateVehicleCost(
    vehicle,
    input.pickupDate,
    rentalDays,
    input.pickupLocation,
    input.returnLocation,
    input.fromLat,
    input.fromLng,
    input.toLat,
    input.toLng
  );

  // Calculate CDW cost
  const cdwCost = await calculateCDWCost(
    vehicle,
    input.cdwCoverage || 'none',
    rentalDays
  );

  // Calculate add-ons cost
  const addOnsResult = await calculateAddOnsCost(
    vehicle,
    input.addOns || {},
    rentalDays
  );

  // Calculate discount — it's advertised as a pay-now incentive, so
  // pay-later bookings are charged the full amount they were shown
  const totalBeforeDiscount = baseVehicleCost + cdwCost + addOnsResult.total;
  const discountPercentage =
    input.paymentMethod === 'pay_now'
      ? vehicle.type === 'transfer'
        ? 10
        : 15
      : 0;
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
      vehicleCostPerDay: vehicle.type !== 'transfer' && rentalDays > 0
        ? baseVehicleCost / rentalDays
        : undefined,
      vehicleTotalCost: baseVehicleCost,
      cdwCostPerDay: vehicle.type !== 'transfer' && cdwCost > 0 && rentalDays > 0
        ? cdwCost / rentalDays
        : undefined,
      cdwTotalCost: cdwCost,
      addOnsDetails: addOnsResult.details,
      addOnsTotalCost: addOnsResult.total,
    },
  };
}

/**
 * Calculate driving distance using Google Maps API
 * Supports both direct coordinates and location name lookup
 */
// Croatia (with a little slack) — coordinates outside make no sense for us
function inServiceArea(lat: number, lng: number): boolean {
  return lat >= 42.0 && lat <= 46.9 && lng >= 13.0 && lng <= 19.7;
}

// Straight-line km between two points (haversine)
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Best-effort check that client-sent coordinates actually belong to the
 * address string they claim to be — geocode the name (OpenStreetMap/Photon)
 * and require the coords within 10 km. Returns true when the geocoder is
 * unavailable (we can't verify, don't block bookings on a third party).
 */
async function coordsMatchAddress(
  address: string,
  lat: number,
  lng: number
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(address.slice(0, 100))}&limit=3&lang=en`,
      { headers: { 'User-Agent': 'HitRentCroatia/1.0 (booking verify)' } }
    );
    if (!res.ok) return true;
    const data = await res.json();
    const candidates = (data.features || [])
      .map((f: any) => f.geometry?.coordinates)
      .filter((c: any) => Array.isArray(c) && c.length === 2);
    if (candidates.length === 0) return true; // nothing to compare against
    return candidates.some(
      (c: number[]) => haversineKm(lat, lng, c[1], c[0]) <= 10
    );
  } catch {
    return true;
  }
}

async function calculateDistanceKm(
  pickupLocation: string,
  returnLocation: string,
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number
): Promise<number | null> {
  try {
    let origins: string | null = null;
    let destinations: string | null = null;

    // SECURITY: our own DB locations win over client-sent coordinates —
    // otherwise two nearby coords buy any named route for a 1 km price
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [fromLoc, toLoc] = await Promise.all([
      Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(pickupLocation)}$`, 'i') } }),
      Location.findOne({ name: { $regex: new RegExp(`^${escapeRegex(returnLocation)}$`, 'i') } }),
    ]);

    if (fromLoc?.lat && fromLoc?.lng) {
      origins = `${fromLoc.lat},${fromLoc.lng}`;
    }
    if (toLoc?.lat && toLoc?.lng) {
      destinations = `${toLoc.lat},${toLoc.lng}`;
    }

    // For free-form addresses use client coords, but only after validating
    // they are in our service area and plausibly match the address text
    if (!origins && fromLat && fromLng) {
      if (!inServiceArea(fromLat, fromLng)) return null;
      if (!(await coordsMatchAddress(pickupLocation, fromLat, fromLng))) {
        console.warn('Pickup coords do not match address:', pickupLocation);
        return null;
      }
      origins = `${fromLat},${fromLng}`;
    }
    if (!destinations && toLat && toLng) {
      if (!inServiceArea(toLat, toLng)) return null;
      if (!(await coordsMatchAddress(returnLocation, toLat, toLng))) {
        console.warn('Return coords do not match address:', returnLocation);
        return null;
      }
      destinations = `${toLat},${toLng}`;
    }

    if (!origins || !destinations) {
      return null;
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&units=metric&key=${apiKey}`;
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
  returnLocation?: string,
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number
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
      const km = await calculateDistanceKm(pickupLocation, returnLocation, fromLat, fromLng, toLat, toLng);
      if (km && km > 0) {
        return Math.round(km * vehicle.pricePerKm * 100) / 100;
      }
    }

    // No trip override and no computable km price. Do NOT fall back to an
    // unrelated trip's price or the daily rate — that would silently charge
    // a wrong amount. The client shows "Price on request" for this case.
    throw new Error('TRANSFER_PRICE_UNAVAILABLE');
  }

  // For rental vehicles, calculate with custom pricing. Work in UTC from the
  // date part of the string so the priced calendar days don't shift by one
  // on servers running in a non-UTC timezone.
  let total = 0;
  const [year, month, day] = pickupDate.split('T')[0].split('-').map(Number);

  for (let i = 0; i < rentalDays; i++) {
    const dateStr = new Date(Date.UTC(year, month - 1, day + i))
      .toISOString()
      .split('T')[0];

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
  // Defaults MUST match the client fallback in BookingModal (basic CDW/TP is
  // included in the rate per Terms 4.2; full coverage default 15 EUR/day).
  const acrissCode = (vehicle.acrissCode || '').toString().trim().toUpperCase();
  let insurancePricing = { dailyPrice: 0, fullCoveragePrice: 15 };
  if (acrissCode) {
    const dbPricing = await InsurancePricing.findOne({ acrissCode });
    if (dbPricing) {
      insurancePricing = {
        dailyPrice: dbPricing.dailyPrice ?? 0,
        fullCoveragePrice: dbPricing.fullCoveragePrice ?? 15,
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
  const addOnAcrissCode = (vehicle.acrissCode || '').toString().trim().toUpperCase();
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

  if (!errors.length) {
    const pickup = new Date(input.pickupDate).getTime();
    const returnD = new Date(input.returnDate).getTime();

    // Transfers legitimately have returnDate === pickupDate (one-way)
    if (returnD < pickup) {
      errors.push('Return date must be on or after the pickup date');
    }

    // Allow a day of slack for timezone differences, nothing more
    if (pickup < Date.now() - 24 * 60 * 60 * 1000) {
      errors.push('Pickup date is in the past');
    }

    // The charged day count comes from the dates — validate that, not the
    // client-sent rentalDays (undefined would pass < / > comparisons anyway)
    if (computeRentalDays(input.pickupDate, input.returnDate) > 365) {
      errors.push('Rental period too long');
    }
  }

  if (
    input.cdwCoverage !== undefined &&
    !['none', 'basic', 'full'].includes(input.cdwCoverage)
  ) {
    errors.push('Invalid coverage option');
  }

  if (!input.pickupLocation || input.pickupLocation.trim() === '') {
    errors.push('Pickup location is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
