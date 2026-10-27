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
          '/browse-cars',
          '/vehicles',
          '/vehicle-order',
          '/settings/',
          '/analytics/',
          '/overbookings/',
          '/profile/',
          '/payment/',
          '/my-bookings',
          '/search',
        ],
      },
    ],
    sitemap: 'https://hit-rent.com/sitemap.xml',
  };
}
