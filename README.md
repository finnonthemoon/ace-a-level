# Ace A Level

Ace A Level is the multi-subject A-level study app from Ace It Studios. This repository starts from the proven ACE TMUA Expo foundation while keeping its product identity, local data, curriculum, and store configuration separate.

## Current foundation

- Expo SDK 57 and Expo Router
- Home, Learn, Practice, and Profile tabs
- First-launch subject selection
- Mathematics, Physics, Biology, Chemistry, Computer Science, and Economics registry
- Subject-aware topic outlines
- A-level-specific AsyncStorage namespace
- Configuration points for the existing Supabase and RevenueCat projects
- A non-destructive Supabase migration using dedicated `a_level_*` tables

Lesson content, practice banks, authentication UI, cloud synchronisation, purchases, and production branding are the next implementation phases.

## Run locally

```bash
npm install
cp .env.example .env.local
npm start
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run web:export
```

## Architecture

- `src/product` owns qualification and subject configuration.
- `src/contexts/CourseContext.tsx` owns the local study-plan state.
- `src/lib/supabase.ts` points at the shared Supabase project while using a separate local auth key.
- `src/services/revenuecat.ts` points at a new app inside the shared RevenueCat project.
- `supabase/migrations` contains reviewed changes to apply to the shared database; migrations are never applied merely by running the app.

See [docs/SHARED_SERVICES_SETUP.md](docs/SHARED_SERVICES_SETUP.md) before connecting production services.
