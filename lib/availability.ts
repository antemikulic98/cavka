/**
 * Shared availability helpers.
 *
 * Every place that decides whether a vehicle is free (public search, booking
 * creation, Stripe checkout, webhook/verify, admin status changes) must use
 * the same rules, otherwise a car can be sold twice or shown as taken while
 * it is free.
 */
import Booking from '@/models/Booking';
import BlockedDate from '@/models/BlockedDate';

/** Booking statuses that occupy the vehicle. */
export const BLOCKING_STATUSES = ['pending', 'confirmed', 'in_progress'] as const;

/**
 * A transfer is stored as a single instant (pickup === return). Treat the
 * vehicle as busy for this many hours on each side of the pickup so two
 * transfers 30 minutes apart on the same van collide.
 */
export const TRANSFER_BLOCK_HOURS = 5;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export interface Window {
  start: Date;
  end: Date;
}

/** The time span a booking occupies for conflict purposes. */
export function bookingWindow(
  vehicleType: string | undefined,
  pickupDate: Date,
  returnDate: Date
): Window {
  if (vehicleType === 'transfer') {
    return {
      start: new Date(pickupDate.getTime() - TRANSFER_BLOCK_HOURS * HOUR),
      end: new Date(pickupDate.getTime() + TRANSFER_BLOCK_HOURS * HOUR),
    };
  }
  return { start: pickupDate, end: returnDate };
}

/** Mongo filter matching bookings that overlap the window. */
export function conflictFilter(
  vehicleId: string,
  window: Window,
  excludeBookingId?: string
) {
  const filter: Record<string, unknown> = {
    vehicleId,
    status: { $in: [...BLOCKING_STATUSES] },
    pickupDate: { $lte: window.end },
    returnDate: { $gte: window.start },
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }
  return filter;
}

export async function findConflictingBookings(
  vehicleId: string,
  vehicleType: string | undefined,
  pickupDate: Date,
  returnDate: Date,
  options: { excludeBookingId?: string; select?: string; limit?: number } = {}
) {
  const window = bookingWindow(vehicleType, pickupDate, returnDate);
  let query = Booking.find(
    conflictFilter(vehicleId, window, options.excludeBookingId)
  );
  if (options.select) query = query.select(options.select);
  if (options.limit) query = query.limit(options.limit);
  return query;
}

/**
 * Admin-blocked period overlapping the window. Blocks are stored as
 * UTC-midnight instants, so endDate counts as covering its whole day.
 */
export async function findBlockedConflict(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date
) {
  return BlockedDate.findOne({
    vehicleId,
    startDate: { $lte: returnDate },
    endDate: { $gte: new Date(pickupDate.getTime() - DAY) },
  });
}

/** Vehicle statuses that can be booked at all. */
export function isVehicleBookable(status: string | undefined): boolean {
  return !status || status === 'Available' || status === 'Booked';
}
