# Ballers - Sports Matching Mobile App

## Overview

A mobile app where users create sports matches, others request to join, get approved, then chat and play together.

## Target Market

- **Region**: Egypt only (initial launch)
- **Supported Cities**: Sheikh Zayed, New Cairo, and Maadi only (initial launch)
- **Platforms**: iOS + Android

### Supported Locations (Phase 1)

| City | Approximate Bounds |
|------|-------------------|
| Sheikh Zayed | 30.0°N - 30.1°N, 30.9°E - 31.0°E |
| New Cairo | 29.98°N - 30.08°N, 31.4°E - 31.55°E |
| Maadi | 29.95°N - 30.02°N, 31.23°E - 31.32°E |

**Location Enforcement:**
- Match creation restricted to supported city boundaries
- Map view defaults to user's nearest supported city
- Users outside supported areas can browse but must select a supported location for matches
- City expansion planned for future phases (6th of October, Heliopolis, etc.)

## Technology Stack

- **Frontend**: React Native with Expo (TypeScript)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth**: Email OTP (magic link)
- **State**: Zustand (UI state) + React Query (server state)
- **Maps**: react-native-maps + expo-location
- **Forms**: react-hook-form + zod

## Environments & Infrastructure

### Environment Setup

| Environment     | Purpose                             | Supabase Project |
| --------------- | ----------------------------------- | ---------------- |
| **Development** | Local development, testing features | `ballers-dev`    |
| **Production**  | Live app for users                  | `ballers-prod`   |

### Environment Files

```
/.env.development      # Local dev (default)
/.env.production       # Production (live)
/.env.local            # Local overrides (git-ignored)
```

### Environment Variables

```bash
# .env.development
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_SUPABASE_URL=https://xxx-dev.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=dev-maps-key

# .env.production
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SUPABASE_URL=https://xxx-prod.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=prod-maps-key
```

### Expo Build Profiles (eas.json)

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "production": {
      "env": { "APP_ENV": "production" },
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Database Migration System

### Supabase CLI Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project (run for each environment)
supabase link --project-ref <project-id>
```

### Migration Workflow

```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations locally
supabase db reset

# Push migrations to remote (staging/prod)
supabase db push

# Pull remote schema changes
supabase db pull

# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.types.ts
```

### Migration File Structure

```
/supabase
├── config.toml                    # Supabase config
├── seed.sql                       # Seed data for development
├── migrations/
│   ├── 20251231144955_initial_schema.sql
│   ├── 20251231145000_add_cities.sql
│   ├── 20251231145100_add_profiles.sql
│   ├── 20251231145200_add_matches.sql
│   ├── 20251231145300_add_chat.sql
│   ├── 20251231145400_add_ratings.sql
│   ├── 20251231145500_add_social.sql
│   ├── 20251231145600_add_rls_policies.sql
│   └── 20260101000000_email_auth.sql    # Email OTP auth migration
└── functions/
    ├── match-reminders/
    └── send-push/
```

### Migration Best Practices

1. **One concern per migration** - Each migration handles one feature/change
2. **Idempotent migrations** - Use `IF NOT EXISTS`, `IF EXISTS` clauses
3. **Reversible when possible** - Include rollback comments
4. **Test locally first** - Always run `supabase db reset` before pushing
5. **Never edit pushed migrations** - Create new migrations for changes

### Environment-Specific Commands

```bash
# Development (local)
supabase start                     # Start local Supabase
supabase db reset                  # Reset and apply all migrations
supabase gen types typescript --local > src/types/database.types.ts

# Production
supabase link --project-ref <prod-ref>
supabase db push                   # Apply pending migrations (careful!)
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/migrate-production.yml
name: Migrate Production DB
on:
  push:
    branches: [main]
    paths: ["supabase/migrations/**"]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.PRODUCTION_PROJECT_REF }}
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Core Features (Full MVP)

1. **Match Creation** - Any sport, location, date/time, skill level, max players
2. **Match Discovery** - Map view + list view, location-based, filterable
3. **Join Requests** - Request to join, creator approves/rejects
4. **Group Chat** - Real-time chat for approved participants only
5. **Scheduling** - Calendar view, reminders
6. **Ratings** - Rate players after match completion
7. **Friends** - Add other users as friends, see their matches
8. **Safety** - Block/report users, manual review

## Design Style

The app should have a **minimal, modern, clean, and luxurious** aesthetic. Use the `frontend-design` skill when implementing UI components to ensure high-quality, distinctive interfaces.

**Note:** The logo is not ready yet. Use a placeholder wherever the logo is needed in the design.

---

## Project Structure

```
/Ballers
├── .env.development              # Dev environment variables
├── .env.production               # Production environment variables
├── .env.local                    # Local overrides (git-ignored)
├── .gitignore
├── app.json                      # Expo config
├── eas.json                      # EAS Build profiles
├── package.json
├── tsconfig.json
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout
│   ├── (auth)/                   # Auth flow (public)
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Email input screen
│   │   ├── verify.tsx            # Check your email / verification
│   │   └── onboarding.tsx        # Profile setup (name, avatar, sports)
│   ├── (tabs)/                   # Main app (authenticated)
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── discover/             # Match discovery (map + list)
│   │   ├── calendar/             # Schedule view
│   │   ├── messages/             # Chat rooms
│   │   └── profile/              # User profile
│   └── match/                    # Match modals
│       ├── create.tsx
│       └── [matchId]/
├── src/
│   ├── components/               # UI components
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Libraries and utilities
│   │   └── validations/          # Zod schemas
│   │       └── auth.ts           # Auth form validations
│   ├── stores/                   # Zustand stores
│   ├── services/                 # Supabase API services
│   │   ├── supabase.ts           # Supabase client
│   │   └── auth.ts               # Auth service (Email OTP)
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts     # Auto-generated from Supabase
│   ├── utils/                    # Utilities
│   └── config/
│       └── env.ts                # Environment config helper
├── supabase/
│   ├── config.toml               # Supabase local config
│   ├── seed.sql                  # Dev seed data
│   ├── migrations/
│   │   ├── 20251231144955_initial_schema.sql
│   │   ├── 20251231145000_add_cities.sql
│   │   ├── 20251231145100_add_profiles.sql
│   │   ├── 20251231145200_add_matches.sql
│   │   ├── 20251231145300_add_chat.sql
│   │   ├── 20251231145400_add_ratings.sql
│   │   ├── 20251231145500_add_social.sql
│   │   ├── 20251231145600_add_rls_policies.sql
│   │   └── 20260101000000_email_auth.sql    # Email OTP auth migration
│   └── functions/
│       ├── match-reminders/
│       │   └── index.ts
│       └── send-push/
│           └── index.ts
└── .github/
    └── workflows/
                └── migrate-production.yml # Manual production migrations
```

---

## Database Schema (Key Tables)

### cities

- id (UUID), name, name_ar (Arabic name, optional)
- is_active (boolean) - can disable without deleting

Seeded with: Sheikh Zayed, New Cairo, Maadi

### sports

- id, name, icon, color
- is_active (for soft delete/disable)

Seeded with: Basketball, Soccer, Tennis, Volleyball, Running, Padel, Swimming, Golf, Badminton, Squash, Pickleball, Spikeball

### profiles

- id (UUID, references auth.users.id)
- email, display_name, avatar_url
- expo_push_token

**Link to auth.users**: A database trigger (`on_auth_user_created`) automatically creates a profile row when a user signs up. The `id` is the same as `auth.users.id`. For OAuth users (Google/Apple), the trigger extracts display_name and avatar_url from provider metadata.

### user_sports

- id, user_id, sport_id
- skill_level (enum: beginner/intermediate/advanced/pro)
- created_at

**Constraint**: User must have a skill level set for a sport before creating or requesting to join a match of that sport. Unique constraint on (user_id, sport_id).

### matches

- id, creator_id, title, description
- sport_id (references sports), skill_level (enum, nullable - open to all if null)
- city_id (references cities) - required, enforces supported locations
- location_name, location_url (Google Maps URL, optional)
- scheduled_at, duration_minutes
- max_players
- status (upcoming/in_progress/completed/cancelled)
- requires_approval

**Constraints**:
- A user can only have 1 active match (status = upcoming/in_progress) as creator at a time. Enforced via RLS policy to prevent spam.

### match_participants

- id, match_id, user_id
- status (pending/approved/rejected)
- request_message, joined_at

### chat_rooms

- id, match_id
- is_active, last_message_at

### chat_messages

- id, chat_room_id, sender_id
- content, message_type, created_at

### ratings

- id, match_id, rater_id, rated_user_id
- rating (1-5), review

### user_blocks

- blocker_id, blocked_id, reasons

### friendships

- id, requester_id, addressee_id
- status (pending/accepted/rejected)
- created_at, accepted_at

## Implementation Phases

### Phase 1: Foundation & Environment Setup ✅ COMPLETED

#### What Was Done

1. **Initialized Expo project with TypeScript**
   - Used `npx create-expo-app@latest . --template expo-template-blank-typescript`
   - Reason: Expo provides a managed workflow with easy access to native APIs, OTA updates, and simplified build process

2. **Installed all dependencies**
   - Core: `@supabase/supabase-js`, `react-native-url-polyfill`
   - Navigation: `expo-router`, `react-native-screens`, `react-native-safe-area-context`
   - Maps & Location: `react-native-maps`, `expo-location`
   - Notifications: `expo-notifications`, `expo-device`, `expo-constants`
   - UI: `react-native-gesture-handler`, `react-native-reanimated`, `expo-splash-screen`
   - Fonts: `@expo-google-fonts/manrope`, `@expo-google-fonts/plus-jakarta-sans`
   - State: `zustand`, `@tanstack/react-query`
   - Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
   - Utils: `date-fns`
   - Auth storage: `expo-secure-store`, `@react-native-async-storage/async-storage`
   - Reason: Each package serves a specific purpose in the app architecture

3. **Configured app.json**
   - Set `scheme: "ballers"` for deep linking
   - Set `userInterfaceStyle: "automatic"` for dark mode support
   - Added `bundleIdentifier` (iOS) and `package` (Android): `com.ballers.app`
   - Configured Google Maps API key placeholders
   - Added plugins: `expo-secure-store`, `expo-router`, `expo-location`, `expo-notifications`
   - Enabled `typedRoutes` experiment for type-safe routing
   - Set splash background to primary color `#0D9488`
   - Reason: Proper app configuration for both platforms with all required permissions

4. **Set up environment files**
   - `.env.development` - Dev Supabase URL and keys (placeholders)
   - `.env.production` - Prod Supabase URL and keys (placeholders)
   - Reason: Separate configs for dev/prod, using `EXPO_PUBLIC_` prefix for client-side access

5. **Configured EAS Build profiles (eas.json)**
   - `development` profile: Development client, internal distribution
   - `production` profile: Production build with channel for OTA updates
   - Reason: EAS Build handles native builds without local Xcode/Android Studio setup

6. **Created Supabase client (src/services/supabase.ts)**
   - Uses `expo-secure-store` for auth token storage (encrypted on device)
   - Configured with `autoRefreshToken`, `persistSession`
   - Set `detectSessionInUrl: true` (required for OAuth deep link callbacks)
   - Reason: Secure token storage is critical for mobile apps, SecureStore uses Keychain (iOS) and Keystore (Android)

7. **Created environment config helper (src/config/env.ts)**
   - Typed interface for all environment variables
   - Helper functions: `isDev`, `isProd`
   - Reason: Type safety and centralized access to env vars

8. **Set up Expo Router structure**
   - `app/_layout.tsx` - Root layout with GestureHandlerRootView, providers, fonts
   - `app/(auth)/_layout.tsx` - Stack navigator for auth flow
   - `app/(auth)/index.tsx` - Welcome screen with auth options (placeholder)
   - `app/(tabs)/_layout.tsx` - Tab navigator with 4 tabs
   - `app/(tabs)/discover.tsx` - Discover tab (placeholder)
   - `app/(tabs)/calendar.tsx` - Calendar tab (placeholder)
   - `app/(tabs)/messages.tsx` - Messages tab (placeholder)
   - `app/(tabs)/profile.tsx` - Profile tab (placeholder)
   - Reason: File-based routing with Expo Router is simpler and provides type-safe navigation

9. **Created providers**
   - `QueryProvider.tsx` - React Query with 5min stale time, 30min cache
   - `AuthProvider.tsx` - Manages Supabase auth state, exposes `useAuth()` hook
   - Reason: Centralized state management for server data (React Query) and auth (context)

10. **Updated package.json**
    - Changed `main` to `expo-router/entry`
    - Removed old `App.tsx` and `index.ts`
    - Reason: Expo Router requires its own entry point

11. **Updated .gitignore**
    - Added Supabase temp files
    - Added IDE folders (.idea, .vscode)
    - Added coverage, logs, temp folders
    - Reason: Keep repo clean from generated files

12. **Created supabase/config.toml**
    - Local Supabase config for development
    - Email auth enabled with confirmations
    - Google and Apple OAuth providers configured
    - Site URL set to `ballers://` for deep links
    - Reason: Enables local Supabase development with `supabase start`

#### Files Created

```
├── .env.development
├── .env.production
├── .gitignore (updated)
├── app.json (updated)
├── eas.json
├── package.json (updated)
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── discover.tsx
│       ├── calendar.tsx
│       ├── messages.tsx
│       └── profile.tsx
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   └── services/
│       └── supabase.ts
└── supabase/
    └── config.toml
```

#### Pending User Actions

- Create Supabase projects (`ballers-dev`, `ballers-prod`) at https://supabase.com
- Update `.env.development` and `.env.production` with real Supabase URLs and anon keys
- (Optional) Add Google Maps API keys to `app.json`

### Phase 1.5: Database Migrations ✅ COMPLETED

#### What Was Done

1. **Created migration files with proper timestamps:**
   - `20251231144955_initial_schema.sql` - Extensions (uuid-ossp, postgis) and enums (skill_level, match_status, participant_status, friendship_status, message_type)
   - `20251231145000_add_cities.sql` - Cities table with seed data (Sheikh Zayed, New Cairo, Maadi)
   - `20251231145100_add_profiles.sql` - Sports table, profiles table, user_sports table, auto-create profile trigger
   - `20251231145200_add_matches.sql` - Matches table, match_participants table, location validation trigger, get_nearby_matches function
   - `20251231145300_add_chat.sql` - Chat rooms and messages tables, auto-create chat room trigger
   - `20251231145400_add_ratings.sql` - Ratings table, get_user_average_rating function
   - `20251231145500_add_social.sql` - User blocks and friendships tables, helper functions
   - `20251231145600_add_rls_policies.sql` - Row-level security policies for all tables

2. **Created seed.sql** - Template for development test data

3. **Added npm scripts to package.json:**
   ```json
   {
     "db:start": "supabase start",
     "db:stop": "supabase stop",
     "db:reset": "supabase db reset",
     "db:migrate": "supabase db push",
     "db:migrate:status": "supabase migration list",
     "db:migrate:new": "supabase migration new",
     "db:types": "supabase gen types typescript --local > src/types/database.types.ts"
   }
   ```

4. **Created GitHub Actions workflow** - `.github/workflows/migrate-production.yml` for CI/CD migrations

**How migration tracking works:**
- Supabase tracks applied migrations in `supabase_migrations.schema_migrations` table
- `npm run db:migrate:status` shows pending vs applied migrations
- `npm run db:migrate` runs only pending migrations on remote
- `npm run db:reset` resets local DB and runs all migrations from scratch

#### Files Created

- `supabase/migrations/20251231144955_initial_schema.sql`
- `supabase/migrations/20251231145000_add_cities.sql`
- `supabase/migrations/20251231145100_add_profiles.sql`
- `supabase/migrations/20251231145200_add_matches.sql`
- `supabase/migrations/20251231145300_add_chat.sql`
- `supabase/migrations/20251231145400_add_ratings.sql`
- `supabase/migrations/20251231145500_add_social.sql`
- `supabase/migrations/20251231145600_add_rls_policies.sql`
- `supabase/seed.sql`
- `.github/workflows/migrate-production.yml`

#### Pending

- Create `supabase/migrations/20260101000000_email_auth.sql` (Email OTP auth migration)
- Generate TypeScript types after running migrations locally (`npm run db:types`)

### Phase 2: Authentication ✅ COMPLETED

#### What Was Done

1. **Created validation schemas** (`src/lib/validations/auth.ts`)
   - `emailSchema` - Zod schema for email validation
   - `otpSchema` - Zod schema for 6-digit OTP validation

2. **Created auth service** (`src/services/auth.ts`)
   - `signInWithEmail(email)` - Sends OTP via Supabase
   - `verifyOtp(email, token)` - Verifies 6-digit code
   - `checkProfileComplete(userId)` - Checks if user has sports selected (for onboarding)
   - `signOut()` - Signs out user
   - Added error handling with console logging for debugging

3. **Updated AuthProvider** (`src/providers/AuthProvider.tsx`)
   - Added `signInWithEmail` and `verifyOtp` methods to context
   - Added `needsOnboarding` state (checks `user_sports` table)
   - Added `refreshOnboardingStatus()` for post-onboarding
   - Added deep link handling via `expo-linking`

4. **Built auth screens with frontend-design skill**
   - `app/(auth)/index.tsx` - Email input with logo placeholder, animated entry
   - `app/(auth)/verify.tsx` - 6-digit OTP input, resend with 60s cooldown
   - `app/(auth)/onboarding.tsx` - Display name + sports selection with skill levels

5. **Updated navigation logic** (`app/_layout.tsx`)
   - Extracted `RootLayoutNav` component with auth-based routing
   - Routes: Not authenticated → auth, needs onboarding → onboarding, complete → tabs

6. **Applied database migration** (`20260101000000_email_auth.sql`)
   - Added email column to profiles
   - Updated trigger for email-based user creation

#### Files Created

```
src/lib/validations/auth.ts
src/services/auth.ts
app/(auth)/index.tsx (replaced)
app/(auth)/verify.tsx
app/(auth)/onboarding.tsx
```

#### Files Modified

```
src/providers/AuthProvider.tsx
app/_layout.tsx
supabase/config.toml
```

### Phase 2.5: Code Cleanup & Component Centralization ✅ COMPLETED

#### What Was Done

Refactored the 3 auth screens to use centralized theme constants, reusable UI components, and custom animation hooks. Reduced code duplication by ~42%.

1. **Created theme constants** (`src/constants/theme.ts`)
   - `colors` - Primary, background, text, error, skill level colors
   - `fonts` - Manrope (headings), Plus Jakarta Sans (body)
   - `fontSizes` - xs through 3xl
   - `spacing` - xs through 4xl
   - `borderRadius` - xs through full
   - `shadows` - Button shadow configs
   - `animation` - Duration and scale values

2. **Created animation hooks** (`src/hooks/useAnimations.ts`)
   - `useEntryAnimation()` - Fade + slide for screen entry
   - `useButtonPress()` - Scale animation for pressable buttons
   - `useBorderAnimation()` - Animated border color for inputs

3. **Created reusable UI components** (`src/components/ui/`)
   - `ScreenContainer` - KeyboardAvoidingView + ScrollView wrapper with safe area
   - `AnimatedInput` - Input with animated border, label, error display
   - `PrimaryButton` - Animated button with loading/disabled states
   - `index.ts` - Barrel export

4. **Refactored auth screens**
   - All screens now use shared components and theme constants
   - Removed duplicated animation logic, styles, and handlers

#### Code Reduction

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| index.tsx | 368 lines | 159 lines | 57% |
| verify.tsx | 472 lines | 257 lines | 46% |
| onboarding.tsx | 631 lines | 443 lines | 30% |
| **New shared code** | 0 | ~300 lines | - |
| **Net reduction** | 1471 lines | ~859 lines | **42%** |

#### Files Created

```
src/constants/theme.ts
src/hooks/useAnimations.ts
src/components/ui/ScreenContainer.tsx
src/components/ui/AnimatedInput.tsx
src/components/ui/PrimaryButton.tsx
src/components/ui/index.ts
```

#### Benefits

- Consistent styling across all screens
- Single source of truth for design tokens
- Reusable components for future screens
- Easier maintenance and updates

### Phase 3: Location & Discovery

1. Request location permissions
2. Get user's current location
3. Map view with match markers
4. List view with match cards
5. Filter bar (sport, skill level, distance)

**Files to create:**

- `app/(tabs)/discover/index.tsx`
- `src/services/location.service.ts`
- `src/stores/locationStore.ts`
- `src/components/match/MatchCard.tsx`
- `src/components/match/MatchMap.tsx`
- `src/components/match/FilterBar.tsx`

### Phase 4: Match Management

1. Create match form with location picker
2. Match details screen
3. Join request system
4. Approve/reject requests (creator)
5. Participant list

**Files to create:**

- `app/match/create.tsx`
- `app/(tabs)/discover/[matchId].tsx`
- `app/match/[matchId]/requests.tsx`
- `src/services/match.service.ts`
- `src/hooks/useMatches.ts`

### Phase 5: Real-time Chat

1. Chat room list
2. Message list with real-time subscription
3. Send messages
4. Chat input with keyboard handling
5. Unread indicators

**Files to create:**

- `app/(tabs)/messages/index.tsx`
- `app/(tabs)/messages/[chatId].tsx`
- `src/services/chat.service.ts`
- `src/hooks/useChat.ts`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/ChatInput.tsx`

### Phase 6: Ratings & Reviews

1. Post-match rating prompt
2. Rate participants modal
3. Star rating component
4. User rating display on profile
5. Review list

**Files to create:**

- `app/match/[matchId]/rate.tsx`
- `src/services/rating.service.ts`
- `src/components/rating/StarRating.tsx`
- `src/components/rating/RatingModal.tsx`

### Phase 7: Friends

1. Send/receive friend requests
2. Friends list screen
3. Accept/reject friend requests
4. View friend's profile and upcoming matches
5. Unfriend option
6. Friend suggestions (played together)

**Files to create:**

- `app/(tabs)/profile/friends.tsx`
- `app/user/[userId]/index.tsx`
- `src/services/friend.service.ts`
- `src/hooks/useFriends.ts`
- `src/components/friends/FriendRequestCard.tsx`
- `src/components/friends/FriendsList.tsx`

### Phase 8: Calendar & Scheduling

1. Calendar view with matches
2. Upcoming matches list
3. Push notification reminders
4. Match reminder edge function

**Files to create:**

- `app/(tabs)/calendar/index.tsx`
- `src/services/notification.service.ts`
- `supabase/functions/match-reminders/index.ts`

### Phase 9: Profile & Settings

1. Profile view (own + others)
2. Edit profile
3. Settings (notifications, preferences)
4. Block/report user
5. View received ratings

**Files to create:**

- `app/(tabs)/profile/index.tsx`
- `app/(tabs)/profile/edit.tsx`
- `app/(tabs)/profile/settings.tsx`

### Phase 10: Polish & Launch

1. Loading states and error handling
2. Empty states
3. Pull-to-refresh everywhere
4. App icon and splash screen
5. Build for iOS and Android

### Phase 11: CI/CD & Deployment

1. Set up GitHub repository
2. Configure GitHub Actions for production migrations
3. Set up EAS Build for development builds
4. Set up EAS Build for production (App Store/Play Store)
5. Configure EAS Update for OTA updates

**Files to create:**

- `.github/workflows/migrate-production.yml`
- `.github/workflows/build-production.yml`

**GitHub Secrets to configure:**

- `SUPABASE_ACCESS_TOKEN`
- `PRODUCTION_PROJECT_REF`
- `EXPO_TOKEN`

---

## Key Technical Decisions

### Real-time Strategy

- Supabase Realtime for chat messages (INSERT subscription)
- Supabase Realtime for join request updates
- React Query for data fetching with optimistic updates

### Location Queries

- Matches filtered by city_id (no geospatial queries for now)
- Location stored as name + optional Google Maps URL
- "Find nearby matches" can be added later if needed

### Row Level Security

- All tables have RLS enabled
- Users can only see public matches or ones they're part of
- Chat access restricted to approved participants
- Block list filtering in profile queries

### State Management

- **Zustand**: Auth state, location, filters (client-only state)
- **React Query**: Matches, chat, ratings (server state)
- Separation prevents sync issues and enables proper caching

---

## Dependencies to Install

```bash
# Core
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store

# Navigation
npx expo install expo-router @react-navigation/native

# Maps & Location
npx expo install react-native-maps expo-location

# Notifications
npx expo install expo-notifications expo-device

# UI
npx expo install react-native-gesture-handler react-native-reanimated

# Auth (Email OTP uses Supabase's built-in auth, no additional packages needed)

# State & Data
npm install zustand @tanstack/react-query

# Forms
npm install react-hook-form zod @hookform/resolvers

# Utils
npm install date-fns
```

---

## Future Enhancements (Post-MVP)

- Premium features (promoted matches, advanced analytics)
- Verified profiles
- In-app payments for venue booking
- Match photos/media sharing
- Advanced matching algorithm
- Social features (follow users, activity feed)
