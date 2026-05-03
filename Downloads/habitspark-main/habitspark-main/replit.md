# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a cross-platform mobile habit tracker app (HabitSpark) built with Expo, a shared Express API server, and supporting libraries.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (API server)
- **Mobile local storage**: expo-sqlite (native) / AsyncStorage fallback (web)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Replit Gemini AI Integration (gemini-2.5-flash)

## Artifacts

### HabitSpark (`artifacts/habitspark`)
Cross-platform mobile habit tracker app built with Expo (React Native) + TypeScript.

**Features:**
- Home screen with habit list (checkbox, streak counter per habit)
- Add Habit floating button with modal dialog
- Freemium gate: max 3 habits free, "Upgrade to Premium" placeholder modal
- AI motivational message at top (Gemini API, cached in AsyncStorage once per day)
- AdMob banner placeholder at bottom
- Deep purple (#6750A4) Material-style UI

**Structure:**
- `app/(tabs)/index.tsx` — Main home screen
- `db/storage.ts` — expo-sqlite data layer (habits + daily_logs tables, streak calc)
- `hooks/useHabits.ts` — Habit state management
- `hooks/useMotivation.ts` — Gemini API call + AsyncStorage caching
- `components/HabitItem.tsx` — Animated habit row
- `components/AddHabitModal.tsx` — Add habit bottom sheet
- `components/PremiumModal.tsx` — Upgrade to premium modal
- `components/MotivationBanner.tsx` — AI motivation card
- `components/AdBanner.tsx` — Ad banner placeholder
- `constants/colors.ts` — Deep purple design tokens

### API Server (`artifacts/api-server`)
Express 5 API server with Gemini AI integration.

**Routes:**
- `GET /api/healthz` — Health check
- `GET /api/motivation?completed=N` — AI motivational message (Gemini 2.5 Flash)

### Canvas / Mockup Sandbox (`artifacts/mockup-sandbox`)
Vite-based design prototyping sandbox.

## Libraries

- `lib/api-spec` — OpenAPI spec (source of truth)
- `lib/api-client-react` — Generated React Query hooks
- `lib/api-zod` — Generated Zod schemas
- `lib/db` — Drizzle ORM schema + migrations
- `lib/integrations-gemini-ai` — Replit Gemini AI integration client

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables

- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Replit Gemini proxy URL (auto-provisioned)
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Replit Gemini API key (auto-provisioned)
- `EXPO_PUBLIC_DOMAIN` — Injected at runtime for API calls from the Expo app

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
