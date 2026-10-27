import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hit-rent.com';
  const lastModified = new Date();

  // Only public, indexable pages belong here. /search is a client-only
  // results page (noindex), admin pages redirect to /login.
  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];
}
