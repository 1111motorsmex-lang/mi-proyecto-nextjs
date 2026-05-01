import App from '@/components/App';
import { EVENTS } from '@/lib/data';

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': EVENTS.slice(0, 20).map(e => ({
      '@type': 'Event',
      name: e.title,
      startDate: `${e.date}T${e.time}:00-07:00`,
      endDate: `${e.date}T${e.endTime}:00-07:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: e.city, addressRegion: 'Sonora', addressCountry: 'MX' } },
      image: e.image,
      description: e.description,
      organizer: { '@type': 'Organization', name: e.organizer },
      offers: { '@type': 'Offer', price: e.price, priceCurrency: 'MXN' },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <App />
    </>
  );
}
