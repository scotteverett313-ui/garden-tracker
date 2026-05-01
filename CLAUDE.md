# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npm run preview   # preview production build locally
```

No test runner is configured. There is no lint step.

To deploy: push to GitHub, Vercel auto-detects Vite and deploys on push. The app is designed to be installed as an iPhone PWA via Safari → Add to Home Screen.

## Environment Variables

Create a `.env.local` for local dev:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Both are optional — the app works fully offline with localStorage only when they're absent. The `supabase` client in `src/supabase.js` returns `null` if either var is missing and all db functions no-op gracefully.

The Supabase Edge Function (`supabase/functions/scan-seed/index.ts`) also requires `ANTHROPIC_API_KEY` set as a Supabase secret — this is the proxy that routes Claude API calls from the browser.

## Architecture

### Data persistence — dual-layer write-through

All writes go to **both** localStorage and Supabase simultaneously. On startup, Supabase is the source of truth if it has data; otherwise localStorage is used and synced up. This means the app works offline and syncs when connectivity is available.

The three persistence paths:
- **Plants** → `supabase.plants` table (each row: `id`, `user_id`, `data` JSONB) + `localStorage["garden_plants"]`
- **Seeds** → `supabase.seeds` table (same shape) + `localStorage["seed_library"]`
- **Everything else** (frost dates, zones, user plant DB) → `supabase.app_data` table (key/value JSONB store) + individual localStorage keys

All Supabase helpers are in `src/supabase.js`. The App-level save helpers (`savePlants`, `saveSeeds`, `saveZones`, etc.) are defined in `src/App.jsx` and passed down as props — components never call Supabase directly.

### State management — all in App.jsx, passed as props

There is no global state library. `App.jsx` is the single source of truth for `plants`, `seeds`, `zones`, `frostDates`, `userDB`, and auth state. All mutations flow through handler functions defined in App and passed down as props (`onUpdate`, `onDelete`, `onAdd`, etc.).

### Plant data model

Each plant object stored in the `plants` array:

```js
{
  id: string,           // generateId() — timestamp+random base36
  name: string,
  variety: string,
  zone: string,         // matches a zone.name from the zones array
  status: string,       // one of STATUSES[].label (see constants.js)
  dateStarted: string,  // ISO date "YYYY-MM-DD"
  dtm: number,          // days to maturity
  quantity: number,
  water: string,        // "Low" | "Moderate" | "Regular" | "High"
  sun: string,          // "Full Sun" | "Partial Shade" | "Full Shade"
  about: string,
  notes: string,
  imageUrl: string,     // base64 data URL (compressed) or /icons/*.png path
  favorite: boolean,
  careLog: [{ id, type, date, note }],   // care history entries
  companions: { good: string[], bad: string[] },
  wateringReminder: { intervalDays: number }
}
```

### Add Plant flow — multi-step modal in App.jsx

The `addFlow` state in App drives a multi-step picker:
1. `"choose"` — shows 4 options: database search, seed scan, transplant, manual
2. `"db"` → `DBSearchPicker` → sets `prefillPlant`, advances to `"manual"`
3. `"scan"` → `SeedScanPicker` (calls Claude vision) → saves to seed library → advances to `"manual"`
4. `"transplant"` / `"manual"` → `AddPlantModal` with `prefill` and `isTransplant` flag

### Claude AI integration

`src/claude.js` exports `callClaude(messages, options)` — it POSTs to the Supabase Edge Function at `/functions/v1/scan-seed`, which proxies to `api.anthropic.com/v1/messages`. The browser never holds the Anthropic API key. Currently used only for seed packet image scanning (`SeedScanPicker`).

### Routing / screens

The app has no router. Screen flow is controlled by boolean state in App.jsx:

```
OnboardingScreen → AuthScreen → SignupFlow → WelcomeScreen (splash) → Main app
```

After onboarding is complete (`localStorage["onboarding_complete"]`), the app boots directly to the WelcomeScreen splash, then the main tabbed layout.

The main layout is a 5-tab shell (My Garden, Seeds, Calendar, Harvest, Profile) that renders as:
- **Mobile** (`< 768px`): bottom nav bar + sticky frost bar header
- **Wide** (`≥ 768px`): left sidebar with nav + frost bar

Tab content is rendered by files in `src/tabs/`. The tab transition animation (slide up) is a GSAP tween on `tabContentRef` in App.jsx.

### Design system

`src/design-tokens.css` is the single source of truth for all colors, typography, spacing, radius, and shadow values. Always use CSS variables (`var(--color-green)`, `var(--radius-card)`, etc.) rather than hardcoded values. Inline styles are used throughout (no CSS modules or Tailwind).

The signature UI pattern is the **offset shadow card**: a `paddingBottom: 4` wrapper with an absolutely-positioned black `<div>` offset 4px down behind the main card/button element. This gives the "raised stamp" look. `CTAButton.jsx` implements this as a reusable component; apply the same pattern manually when building new interactive cards.

### Static data in constants.js

`PLANT_DB` — 30 built-in plants with dtm/water/sun/about (used for autocomplete and prefill).
`COMPANION_DB` — companion planting good/bad pairs.
`CALENDAR_DATA` — monthly indoor/transplant/direct-sow windows by crop.
`STATUSES` — the ordered lifecycle stages with icon paths and pastel colors.
`DEFAULT_ZONES` — the 4 default grow zones (Basement, Greenhouse, Raised Beds, In-Ground).
`ICON_LIBRARY` — 44 pixel-art plant icons in `/public/icons/` with name/tag matching for `getAutoIcon()`.

Users can add custom plants to `userDB` (persisted as `user_plant_db`); these merge with `PLANT_DB` in autocomplete but are never hardcoded.
