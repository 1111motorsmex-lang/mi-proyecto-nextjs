# Qué Hacer Sonora — Next.js

Agenda viva de eventos en Sonora. Cubre las 6 ciudades principales (Hermosillo, Cd. Obregón, Nogales, Guaymas, Puerto Peñasco, Agua Prieta) con calendario, filtros, favoritos persistentes y modal de detalle.

Stack: **Next.js 14 (App Router) + TypeScript + React 18**. Sin dependencias de UI: CSS plano, fuentes desde Google Fonts.

---

## 🚀 Cómo correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. (Opcional) Editar .env.local con tu URL final

# 4. Correr en desarrollo
npm run dev
# → http://localhost:3000

# 5. Build de producción
npm run build
npm start
```

Requiere **Node.js ≥ 18.17**.

---

## 📦 Deploy en Vercel

1. Sube el repo a GitHub.
2. Ve a [vercel.com/new](https://vercel.com/new) → importa el repo.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SITE_URL` = `https://tu-dominio.com`
   - `NEXT_PUBLIC_SITE_NAME` = `Qué Hacer Sonora` (opcional)
   - `NEXT_PUBLIC_CONTACT_EMAIL` = tu correo (opcional)
4. Click **Deploy**.

`vercel.json` ya viene configurado con headers de seguridad. Next detecta el framework automáticamente — no hace falta configurar build command.

### Deploy con CLI

```bash
npm i -g vercel
vercel        # primer deploy preview
vercel --prod # producción
```

---

## 🗂 Estructura

```
nextjs/
├── app/
│   ├── layout.tsx          # Root layout, metadata global, fuentes, JSON-LD
│   ├── page.tsx            # Home (server component) → renderiza <App />
│   ├── globals.css         # Sistema de diseño (tokens, componentes)
│   ├── sitemap.ts          # /sitemap.xml dinámico
│   ├── robots.ts           # /robots.txt dinámico
│   └── manifest.json       # PWA manifest
├── components/
│   └── App.tsx             # Cliente. Header, Hero, Calendar, Filters, Cards, Modal, Drawer
├── lib/
│   ├── data.ts             # CITIES, CATEGORIES, EVENTS (69 eventos)
│   └── dates.ts            # Helpers de fecha y filtrado
├── public/                 # (vacío) — agregar og-image.png, favicon.ico, icon-192/512.png
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 🔍 SEO

- **Metadata API** de Next 14 con OpenGraph + Twitter Cards
- **JSON-LD** `WebSite` con SearchAction en `<head>` global
- **JSON-LD** `Event` (Schema.org) en home — los primeros 20 eventos como datos estructurados
- `sitemap.xml` con URL raíz + cada ciudad + cada categoría
- `robots.txt` con sitemap declarado
- `manifest.json` para PWA / instalación en Android
- `lang="es-MX"` y `metadataBase` desde `NEXT_PUBLIC_SITE_URL`

### Assets que debes agregar a `/public/`

- `og-image.png` (1200×630) — preview de redes sociales
- `favicon.ico`
- `apple-touch-icon.png` (180×180)
- `icon-192.png`, `icon-512.png` — para PWA

---

## 🧩 Cambios típicos

- **Eventos**: editá `lib/data.ts` → arreglo `EVENTS`. Cada evento tiene `city`, `category`, `date` (YYYY-MM-DD), etc.
- **Ciudades / categorías**: mismo archivo, arreglos `CITIES` / `CATEGORIES`.
- **Paleta**: variables CSS al inicio de `app/globals.css` (`--rojo`, `--verde`, etc.)
- **Conectar a un CMS**: reemplazá el import de `EVENTS` en `app/page.tsx` por un fetch a Supabase / Sanity / Notion. Tip: convertí `Page` en `async function` y hacé el fetch ahí mismo (server component).

---

## 📝 Notas

- `TODAY` está fijo en `2026-05-04` en `lib/dates.ts` para que la demo siempre tenga eventos relativos. Cambiá a `new Date()` para producción.
- Los favoritos viven en `localStorage` con la clave `qhs:favs`.
- La ciudad seleccionada persiste en `qhs:city`.
