import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Your Bookings | View & Track Your Reservations',
  description: 'Manage your car rental bookings with HIT Rent a Car. View booking details, track your reservation status, and download booking confirmations.',
  keywords: 'manage booking, car rental reservation, booking status, rental confirmation, hit rent a car booking',
  openGraph: {
    title: 'Manage Your Bookings | HIT Rent a Car',
    description: 'View and manage your car rental bookings. Track reservation status and download confirmations.',
    url: 'https://hit-rent.com/my-bookings',
  },
  robots: {
    index: false, // Don't index booking management page
    follow: true,
  },
};

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

