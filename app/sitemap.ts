import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hit-rent.com';
  const currentDate = new Date();

  return [
    // Homepage - Highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // Main car browsing and search pages
    {
      url: `${baseUrl}/browse-cars`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // User-related pages (login is robots-blocked, so it doesn't belong here)
    {
      url: `${baseUrl}/my-bookings`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },

    // Note: Individual vehicle pages would be added dynamically here
    // by fetching from the database in a production environment
  ];
}

