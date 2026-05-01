import type { MetadataRoute } from 'next';
import { CITIES, CATEGORIES } from '@/lib/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quehacersonora.mx';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ];
  const cityUrls: MetadataRoute.Sitemap = CITIES.filter(c => c.id !== 'all').map(c => ({
    url: `${SITE_URL}/?city=${c.id}`, lastModified: now, changeFrequency: 'daily', priority: 0.9,
  }));
  const catUrls: MetadataRoute.Sitemap = CATEGORIES.filter(c => c.id !== 'all').map(c => ({
    url: `${SITE_URL}/?cat=${c.id}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7,
  }));
  return [...base, ...cityUrls, ...catUrls];
}
