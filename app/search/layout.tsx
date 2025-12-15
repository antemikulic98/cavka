import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Available Cars | Find Your Perfect Rental Vehicle',
  description: 'Browse and search available rental cars in Croatia. Filter by location, dates, and vehicle type. Find the perfect car for your trip with HIT Rent a Car.',
  keywords: 'search rental cars, available cars croatia, car rental search, book car online, rent a car zagreb, rent a car split',
  openGraph: {
    title: 'Search Available Cars | HIT Rent a Car',
    description: 'Browse and search available rental cars in Croatia. Find the perfect car for your trip.',
    url: 'https://hit-rent.com/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

