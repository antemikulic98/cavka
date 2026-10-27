import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins } from 'next/font/google';
import './globals.css';
import CookieBanner from './components/CookieBanner';

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
    default: 'Hit Rent Croatia | Car Rental & Transfers in Split',
    template: '%s | Hit Rent Croatia',
  },
  description: 'Hit Rent Croatia - car rental at Split Airport and Split city, plus private transfers along the Dalmatian coast. Family-owned service, quality vehicles, competitive prices. Book online!',
  keywords: [
    'family rent a car croatia',
    'rent a car croatia',
    'car rental croatia',
    'family car rental',
    'rent a car split',
    'airport car rental croatia',
    'cheap car rental croatia',
    'affordable car rental croatia',
    'car hire croatia',
    'transfer services croatia',
    'airport transfer split',
    'najam auta hrvatska',
    'rent a car hrvatska',
    'family owned car rental',
    'croatia road trip car rental',
    'dalmatian coast car rental',
  ],
  authors: [{ name: 'Hit Rent Croatia' }],
  creator: 'Hit Rent Croatia',
  publisher: 'Hit Rent Croatia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hit-rent.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hit-rent.com',
    siteName: 'Hit Rent Croatia',
    title: 'Hit Rent | Premium Car Rental & Transfer Services in Croatia',
    description: 'Your trusted family-owned car rental service in Split, Croatia. Quality vehicles at competitive prices, airport pickup and private transfers along the Dalmatian coast. Book online today!',
    images: [
      {
        url: '/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hit Rent Croatia - Premium Car Rental Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hit Rent Croatia | Premium Car Rental & Transfer Services',
    description: 'Your trusted family-owned car rental service in Croatia. Premium vehicles, personal service, competitive prices. Book online today!',
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

// BreadcrumbList Schema for navigation
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://hit-rent.com',
    },
  ],
};

// LocalBusiness Schema with multiple locations
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://hit-rent.com/#localbusiness',
  name: 'Hit Rent Croatia',
  image: 'https://hit-rent.com/img/og-image.jpg',
  telephone: '+385 91 722 4138',
  email: 'info@hit-rent.com',
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Split',
    addressRegion: 'Splitsko-dalmatinska županija',
    addressCountry: 'HR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.5081,
    longitude: 16.4402,
  },
  url: 'https://hit-rent.com',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  ],
};

// Main CarRental Schema for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CarRental',
  '@id': 'https://hit-rent.com/#organization',
  name: 'Hit Rent Croatia',
  alternateName: 'Hit Rent',
  legalName: 'Turist ekspert d.o.o.',
  description: 'Family-owned car rental and private transfer service based in Split, Croatia. Quality vehicles, personal service and competitive prices at Split Airport and along the Dalmatian coast.',
  url: 'https://hit-rent.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://hit-rent.com/img/logo.svg',
    width: 250,
    height: 60,
  },
  image: 'https://hit-rent.com/img/og-image.jpg',
  telephone: '+385 91 722 4138',
  email: 'info@hit-rent.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'HR',
    addressRegion: 'Splitsko-dalmatinska županija',
    addressLocality: 'Split',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '43.5081',
    longitude: '16.4402',
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Split',
    },
    {
      '@type': 'Airport',
      name: 'Split Airport',
      iataCode: 'SPU',
    },
    {
      '@type': 'City',
      name: 'Trogir',
    },
    {
      '@type': 'City',
      name: 'Makarska',
    },
    {
      '@type': 'Country',
      name: 'Croatia',
    },
  ],
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  sameAs: ['https://www.instagram.com/hit_rentacar'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Car Rental Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Car Rental',
          description: 'Rent quality vehicles for your trip in Croatia',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Airport Transfer',
          description: 'Reliable airport transfer services across Croatia',
        },
      },
    ],
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#166534" />
        <meta name="geo.region" content="HR" />
        <meta name="geo.placename" content="Split, Croatia" />
        <meta name="geo.position" content="43.5081;16.4402" />
        <meta name="ICBM" content="43.5081, 16.4402" />

        {/* Main Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />

        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        {children}
        <CookieBanner />
        {/* Unregister stale service workers that break font/image loading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  registrations.forEach(function(registration) {
                    registration.unregister();
                  });
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    names.forEach(function(name) { caches.delete(name); });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
