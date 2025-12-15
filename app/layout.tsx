import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'HIT Rent a Car | Rent a Car Croatia | Car Rental & Transfer Services',
    template: '%s | HIT Rent a Car Croatia',
  },
  description: 'HIT Rent a Car - Premium car rental and transfer services in Croatia. Rent quality vehicles at competitive prices in Zagreb, Split, Dubrovnik & more. Book online today!',
  keywords: [
    'rent a car croatia',
    'car rental croatia',
    'hit rent a car',
    'rent a car zagreb',
    'rent a car split',
    'rent a car dubrovnik',
    'airport car rental croatia',
    'cheap car rental croatia',
    'car hire croatia',
    'transfer services croatia',
    'airport transfer split',
    'airport transfer zagreb',
    'najam auta hrvatska',
    'rent a car hrvatska',
  ],
  authors: [{ name: 'HIT Rent a Car' }],
  creator: 'HIT Rent a Car',
  publisher: 'HIT Rent a Car',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hit-rent.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'hr': '/hr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hit-rent.com',
    siteName: 'HIT Rent a Car',
    title: 'HIT Rent a Car | Premium Car Rental & Transfer Services in Croatia',
    description: 'Rent quality vehicles at competitive prices. Car rental and transfer services in Zagreb, Split, Dubrovnik and across Croatia. Book online today!',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HIT Rent a Car - Car Rental Croatia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HIT Rent a Car | Car Rental & Transfer Services Croatia',
    description: 'Premium car rental and transfer services in Croatia. Book online today!',
    images: ['/img/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'travel',
};

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CarRental',
  name: 'HIT Rent a Car',
  description: 'Premium car rental and transfer services in Croatia',
  url: 'https://hit-rent.com',
  logo: 'https://hit-rent.com/img/logo.svg',
  image: 'https://hit-rent.com/img/og-image.jpg',
  telephone: '+385 1 234 5678',
  email: 'info@hit-rent.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'HR',
    addressRegion: 'Croatia',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '45.815',
    longitude: '15.9819',
  },
  areaServed: [
    {
      '@type': 'Country',
      name: 'Croatia',
    },
  ],
  priceRange: '€€',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  sameAs: [
    'https://www.facebook.com/hitrentacar',
    'https://www.instagram.com/hitrentacar',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '150',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#166534" />
        <meta name="geo.region" content="HR" />
        <meta name="geo.placename" content="Croatia" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
