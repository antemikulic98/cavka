import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/login',
          '/bookings',
          '/vehicles/',
          '/settings/',
          '/analytics/',
          '/overbookings/',
          '/profile/',
        ],
      },
    ],
    sitemap: 'https://hit-rent.com/sitemap.xml',
  };
}

