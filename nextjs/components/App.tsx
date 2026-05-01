'use client';
import { useState, useEffect, useMemo } from 'react';
import { CITIES, CATEGORIES, EVENTS, getCity, type SonoraEvent, type CityId, type CategoryId } from '@/lib/data';
import { TODAY, MONTH_NAMES, MONTH_SHORT, WEEKDAYS, parseDate, sameDay, applyDateFilter, relativeDayLabel, type DateFilter } from '@/lib/dates';

const CAT_COLOR: Record<string, string> = {
  musica: '#C8102E', cultura: '#8E2C8E', deportes: '#006847',
  gastronomia: '#E85D2C', familia: '#2D5DA0', gobierno: '#1A1A1A',
};

export default function App() {
  const [cityId, setCityId] = useState<CityId>('all');
  const [catId, setCatId] = useState<CategoryId>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [search, setSearch] = useState('');
  const [calMonth, setCalMonth] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [openEvent, setOpenEvent] = useState<SonoraEvent | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem('qhs:favs') || '[]');
      const c = localStorage.getItem('qhs:city') as CityId | null;
      if (Array.isArray(f)) setFavs(f);
      if (c) setCityId(c);
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('qhs:favs', JSON.stringify(favs)); }, [favs]);
  useEffect(() => { localStorage.setItem('qhs:city', cityId); }, [cityId]);

  const toggleFav = (id: string) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const filtered = useMemo(() => {
    let r = EVENTS;
    if (cityId !== 'all') r = r.filter(e => e.city === cityId);
    if (catId !== 'all') r = r.filter(e => e.category === catId);
    r = applyDateFilter(r, dateFilter, calMonth);
    if (selectedDay) r = r.filter(e => sameDay(parseDate(e.date), selectedDay));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return r.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  }, [cityId, catId, dateFilter, search, selectedDay, calMonth]);

  const eventsForCalendar = useMemo(() => {
    return EVENTS.filter(e => cityId === 'all' || e.city === cityId);
  }, [cityId]);

  const activeCity = getCity(cityId);
  const cityCount = (id: CityId) => id === 'all' ? EVENTS.length : EVENTS.filter(e => e.city === id).length;

  return (
    <>
      <Header favCount={favs.length} onOpenFavs={() => setDrawerOpen(true)} />
      <CityStrip cityId={cityId} setCityId={(id) => { setCityId(id); setSelectedDay(null); }} cityCount={cityCount} />
      {cityId === 'all' ? <Hero setCityId={setCityId} cityCount={cityCount} /> : <CityBanner city={activeCity} count={cityCount(cityId)} />}

      <div className="container">
        <Filters
          dateFilter={dateFilter} setDateFilter={(f) => { setDateFilter(f); setSelectedDay(null); }}
          catId={catId} setCatId={setCatId}
          search={search} setSearch={setSearch}
        />
        <div className="main-grid">
          <div>
            <h2 className="section-title">
              {selectedDay ? `Eventos del ${selectedDay.getDate()} de ${MONTH_NAMES[selectedDay.getMonth()].toLowerCase()}` : 'Próximos eventos'}
              <small>{filtered.length} {filtered.length === 1 ? 'evento' : 'eventos'}</small>
            </h2>
            {selectedDay && (
              <button className="pill" style={{ marginBottom: 16 }} onClick={() => setSelectedDay(null)}>← Limpiar día</button>
            )}
            <div className="events-grid">
              {filtered.length === 0 ? (
                <div style={{ padding: 40, background: '#fff', borderRadius: 16, textAlign: 'center', color: '#6B6B6B' }}>
                  No hay eventos con esos filtros. Prueba quitando alguno.
                </div>
              ) : filtered.map(e => (
                <EventCard key={e.id} event={e} fav={favs.includes(e.id)} onToggleFav={() => toggleFav(e.id)} onOpen={() => setOpenEvent(e)} />
              ))}
            </div>
          </div>
          <aside>
            <Calendar
              month={calMonth} setMonth={setCalMonth}
              selectedDay={selectedDay} setSelectedDay={setSelectedDay}
              events={eventsForCalendar}
            />
          </aside>
        </div>
      </div>

      <Footer />

      {openEvent && <EventModal event={openEvent} fav={favs.includes(openEvent.id)} onToggleFav={() => toggleFav(openEvent.id)} onClose={() => setOpenEvent(null)} />}
      {drawerOpen && <FavoritesDrawer favs={favs} onClose={() => setDrawerOpen(false)} onOpenEvent={(e) => { setDrawerOpen(false); setOpenEvent(e); }} onRemove={toggleFav} />}
    </>
  );
}

function Header({ favCount, onOpenFavs }: { favCount: number; onOpenFavs: () => void }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">
          <div className="logo-mark">QS</div>
          <div className="logo-text">QUÉ HACER<br /><span>SONORA</span></div>
        </div>
        <button className="fav-btn" onClick={onOpenFavs}>♥ Favoritos {favCount > 0 && <span style={{ background: '#F4A100', color: '#1A1A1A', padding: '0 8px', borderRadius: 999 }}>{favCount}</span>}</button>
      </div>
    </header>
  );
}

function CityStrip({ cityId, setCityId, cityCount }: { cityId: CityId; setCityId: (id: CityId) => void; cityCount: (id: CityId) => number }) {
  return (
    <div className="city-strip">
      <div className="container city-strip-inner">
        {CITIES.map(c => (
          <button key={c.id} className={`city-chip ${cityId === c.id ? 'active' : ''}`} onClick={() => setCityId(c.id)}>
            {c.id !== 'all' && <span className="city-chip-dot" style={{ background: c.color }} />}
            {c.short} <span className="city-chip-count">({cityCount(c.id)})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Hero({ setCityId, cityCount }: { setCityId: (id: CityId) => void; cityCount: (id: CityId) => number }) {
  return (
    <section className="hero">
      <div className="container">
        <h1>QUÉ HACER<br /><span className="accent">EN SONORA</span></h1>
        <p>La agenda completa de las 6 ciudades sonorenses. Música, cultura, deporte y mucho más.</p>
        <div className="city-cards">
          {CITIES.filter(c => c.id !== 'all').map(c => (
            <button key={c.id} className="city-card" style={{ borderTopColor: c.accent }} onClick={() => setCityId(c.id)}>
              <div className="city-card-name">{c.name}</div>
              <div className="city-card-tag">{c.tagline}</div>
              <div className="city-card-count">{cityCount(c.id)} eventos</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CityBanner({ city, count }: { city: ReturnType<typeof getCity>; count: number }) {
  return (
    <section className="city-banner">
      <div className="city-banner-stripe" style={{ background: city.color }} />
      <div className="container" style={{ paddingLeft: 32 }}>
        <h2 style={{ color: city.color }}>{city.name}</h2>
        <p>{city.tagline} · <strong>{count} eventos</strong></p>
        {city.landmarks && (
          <div className="city-banner-landmarks">
            {city.landmarks.map(l => <span key={l}>📍 {l}</span>)}
          </div>
        )}
      </div>
    </section>
  );
}

function Filters({ dateFilter, setDateFilter, catId, setCatId, search, setSearch }: any) {
  const dateOpts: { id: DateFilter; label: string }[] = [
    { id: 'all', label: 'Todo' }, { id: 'today', label: 'Hoy' },
    { id: 'tomorrow', label: 'Mañana' }, { id: 'week', label: 'Esta semana' },
    { id: 'weekend', label: 'Fin de semana' }, { id: 'month', label: 'Este mes' },
  ];
  return (
    <div className="filters">
      <div className="filter-row">
        {dateOpts.map(d => (
          <button key={d.id} className={`pill ${dateFilter === d.id ? 'active' : ''}`} onClick={() => setDateFilter(d.id)}>{d.label}</button>
        ))}
      </div>
      <div className="filter-row">
        {CATEGORIES.map(c => (
          <button key={c.id} className={`pill cat ${catId === c.id ? 'active' : ''}`} data-cat={c.id} style={{ color: c.id === 'all' ? undefined : CAT_COLOR[c.id] }} onClick={() => setCatId(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="search-row">
        <input className="search-input" placeholder="Buscar por nombre, lugar o descripción…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
    </div>
  );
}

function Calendar({ month, setMonth, selectedDay, setSelectedDay, events }: any) {
  const y = month.getFullYear(), m = month.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = 0; i < startOffset; i++) days.push(new Date(y, m, -startOffset + i + 1));
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(y, m, d));
  while (days.length % 7 !== 0) days.push(new Date(y, m + 1, days.length - startOffset - lastDay.getDate() + 1));

  const eventsByDay = useMemo(() => {
    const map: Record<string, SonoraEvent[]> = {};
    events.forEach((e: SonoraEvent) => { (map[e.date] ||= []).push(e); });
    return map;
  }, [events]);

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <div className="calendar">
      <div className="cal-header">
        <div className="cal-month">{MONTH_NAMES[m]} {y}</div>
        <div className="cal-nav">
          <button onClick={() => setMonth(new Date(y, m - 1, 1))}>‹</button>
          <button onClick={() => setMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}>•</button>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map(w => <div key={w} className="cal-dow">{w}</div>)}
        {days.map((d, i) => {
          const inMonth = d.getMonth() === m;
          const key = fmt(d);
          const dayEvents = eventsByDay[key] || [];
          const isToday = sameDay(d, TODAY);
          const isSel = selectedDay && sameDay(d, selectedDay);
          return (
            <button key={i}
              className={`cal-day ${!inMonth ? 'outside' : ''} ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-events' : ''} ${isSel ? 'selected' : ''}`}
              onClick={() => dayEvents.length && setSelectedDay(isSel ? null : d)}
              disabled={!dayEvents.length && !inMonth}>
              <span>{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="cal-dots">
                  {[...new Set(dayEvents.map(e => e.category))].slice(0, 4).map(c => (
                    <span key={c} className="cal-dot" style={{ background: CAT_COLOR[c] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ event, fav, onToggleFav, onOpen }: { event: SonoraEvent; fav: boolean; onToggleFav: () => void; onOpen: () => void }) {
  const d = parseDate(event.date);
  const rel = relativeDayLabel(d);
  const city = getCity(event.city);
  return (
    <article className={`event-card ${event.featured ? 'featured' : ''}`} onClick={onOpen}>
      <div className="event-date">
        <div className="event-date-day">{d.getDate()}</div>
        <div className="event-date-mon">{MONTH_SHORT[d.getMonth()]}</div>
      </div>
      <div>
        {rel && <span className="event-rel">{rel}</span>}
        <div className="event-title">{event.title}</div>
        <div className="event-meta">
          <span className="event-meta-city"><span className="event-meta-city-dot" style={{ background: city.color }} />{city.short}</span>
          <span>📍 {event.venue}</span>
          <span>🕐 {event.time}</span>
          <span className={`event-cat-tag cat-${event.category}`}>{CATEGORIES.find(c => c.id === event.category)?.label}</span>
        </div>
      </div>
      <button className={`fav-toggle ${fav ? 'is-fav' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFav(); }} aria-label="Favorito">♥</button>
    </article>
  );
}

function EventModal({ event, fav, onToggleFav, onClose }: { event: SonoraEvent; fav: boolean; onToggleFav: () => void; onClose: () => void }) {
  const d = parseDate(event.date);
  const city = getCity(event.city);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <img className="modal-img" src={event.image} alt={event.title} />
        <div className="modal-body">
          <div className="modal-meta">
            <span className="modal-meta-item" style={{ background: city.color, color: 'white' }}>{city.name}</span>
            <span className={`event-cat-tag cat-${event.category}`} style={{ padding: '6px 12px', borderRadius: 999 }}>{CATEGORIES.find(c => c.id === event.category)?.label}</span>
          </div>
          <h3>{event.title}</h3>
          <div className="modal-meta">
            <span className="modal-meta-item">📅 {d.getDate()} de {MONTH_NAMES[d.getMonth()].toLowerCase()}</span>
            <span className="modal-meta-item">🕐 {event.time} – {event.endTime}</span>
            <span className="modal-meta-item">📍 {event.venue}</span>
            <span className="modal-meta-item">🎟 {event.price}</span>
          </div>
          <p className="modal-desc">{event.description}</p>
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 20 }}>Organiza: <strong>{event.organizer}</strong></p>
          <div className="modal-actions">
            <button className="btn-primary">Ver más detalles</button>
            <button className="btn-secondary" onClick={onToggleFav}>{fav ? '♥ Guardado' : '♡ Guardar'}</button>
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesDrawer({ favs, onClose, onOpenEvent, onRemove }: any) {
  const items = EVENTS.filter(e => favs.includes(e.id));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>♥ Mis favoritos</h3>
          <button onClick={onClose} style={{ fontSize: 24 }}>×</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">Aún no guardas eventos.<br />Toca el corazón en cualquier evento.</div>
          ) : items.map((e: SonoraEvent) => (
            <EventCard key={e.id} event={e} fav onToggleFav={() => onRemove(e.id)} onOpen={() => onOpenEvent(e)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Qué Hacer Sonora</h4>
          <p>La agenda viva de eventos del estado. Hermosillo, Cd. Obregón, Nogales, Guaymas, Puerto Peñasco y Agua Prieta.</p>
        </div>
        <div>
          <h4>Ciudades</h4>
          <ul>
            {CITIES.filter(c => c.id !== 'all').map(c => <li key={c.id}><a href={`/?city=${c.id}`}>{c.name}</a></li>)}
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>¿Organizas un evento?<br />Escríbenos a:<br /><a href="mailto:hola@quehacersonora.mx">hola@quehacersonora.mx</a></p>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 Qué Hacer Sonora · Hecho con ♥ en el desierto</div>
    </footer>
  );
}
