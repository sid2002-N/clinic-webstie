# HabitSpark — Implemented Features

## App Overview
Cross-platform mobile habit tracker built with Expo (React Native) + TypeScript, with a Node.js/Express API backend. Uses a deep purple Material-style design (#6750A4).

---

## What Was Built

### 1. Expo Mobile App (`artifacts/habitspark`)
- Bootstrapped as an Expo artifact in the pnpm monorepo with TypeScript and expo-router
- Configured splash screen color (#6750A4), app icon slot, and base path routing

### 2. Local Database (expo-sqlite)
- `db/storage.ts` — SQLite-backed data layer with two tables:
  - `habits` — stores habit name and creation date
  - `daily_logs` — stores per-habit daily completion records
- Self-initializing on first use (no race condition on native)
- Full web guard — all SQLite calls are no-ops on web (Platform.OS check)
- Functions: `getAllHabits`, `addHabit`, `deleteHabit`, `toggleHabitToday`, `isHabitCompletedToday`, `calculateStreak`, `getCompletedCountToday`

### 3. Streak Counter
- `calculateStreak(habitId)` computes consecutive completed days in descending order
- Handles both "completed today" and "completed yesterday but not yet today" streak states
- Displayed as a gold lightning bolt + number on each habit row

### 4. Habit List with Checkboxes
- `components/HabitItem.tsx` — animated habit row with:
  - Tap to toggle completion (checkbox with scale animation)
  - Streak badge (hidden at 0)
  - Long-press to trigger delete confirmation alert

### 5. Add Habit Modal
- `components/AddHabitModal.tsx` — bottom sheet modal with text input and submit button
- Floating action button (+) on the home screen opens it

### 6. Freemium Gate
- `FREE_HABIT_LIMIT = 3` constant in the home screen
- Attempting to add a 4th habit opens `PremiumModal` instead
- `components/PremiumModal.tsx` — "Upgrade to Premium" modal listing premium features (placeholder, no real payment)

### 7. AI Motivational Message (Gemini)
- **API route**: `GET /api/motivation?completed=N` on the Express server
  - Calls Gemini 2.5 Flash via Replit AI Integration
  - Returns a short motivational message tailored to how many habits were completed today
- **Client hook**: `hooks/useMotivation.ts`
  - Fetches from `/api/motivation` once per day
  - Caches the result in AsyncStorage under key `habitspark_motivation_v1` with today's date
  - Returns cached message on subsequent opens the same day
- `components/MotivationBanner.tsx` — displays the AI message with a loading skeleton state

### 8. AdMob Banner Placeholder
- `components/AdBanner.tsx` — styled "AD | Advertisement" bar at the bottom of the screen
- Placeholder only (expo-ads-admob is deprecated and requires a native build for real ads)

### 9. Home Screen (`app/(tabs)/index.tsx`)
- Purple header with app name, lightning bolt icon, and today's date
- Progress counter pill (completed / total habits today)
- Motivation banner at the top
- Habit list (empty state when no habits exist)
- Floating action button
- Ad banner pinned to the bottom

### 10. Design System
- `constants/colors.ts` — full Material You deep purple token set
- `useColors()` hook for consistent theming across all components
- Safe area insets respected throughout

### 11. API Server (`artifacts/api-server`)
- Express 5 server with OpenAPI-first contract
- Gemini integration via `lib/integrations-gemini-ai`
- `/api/motivation` route added to OpenAPI spec, codegen run to produce Zod schemas and React Query hooks

### 12. Bug Fixes
- Fixed `pRetry.AbortError` → named `AbortError` import in `lib/integrations-gemini-ai`
- Added `@types/node` devDependency to the Gemini lib
- Resolved `SharedArrayBuffer is not defined` crash on web by guarding all SQLite calls with `Platform.OS`
- Resolved "Call initDB() first" race condition on native by making the DB self-initializing
