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
- **Auth**: Phone number OTP only
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
│   └── 20251231145600_add_rls_policies.sql
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

**Aesthetic Direction: "Athletic Elegance"**
A refined, premium sports experience that feels like a luxury fitness club meets modern tech. Clean but not sterile, sporty but sophisticated. The design should feel aspirational - like joining an exclusive community of active people.

**Memorable Element**: Subtle diagonal accents and dynamic card tilts that evoke motion and energy without being aggressive.

---

## UI/UX Design Plan

> **IMPORTANT**: Use the `frontend-design` skill when implementing ALL UI components.
> This ensures distinctive, production-grade interfaces that avoid generic AI aesthetics.
> Every screen and component should be built using this skill for consistency.

### Design System

#### Color Palette (Light Mode)

```typescript
// src/constants/colors.ts
export const colors = {
  // Primary - Deep Teal (trust, activity, freshness)
  primary: {
    50: "#E6F7F7",
    100: "#B3E8E8",
    200: "#80D9D9",
    300: "#4DC9C9",
    400: "#26BABA",
    500: "#0D9488", // Main primary
    600: "#0B7A70",
    700: "#086058",
    800: "#064640",
    900: "#032D28",
  },

  // Accent - Electric Orange (energy, CTAs, urgency)
  accent: {
    50: "#FFF4ED",
    100: "#FFE0CC",
    200: "#FFCBAB",
    300: "#FFB78A",
    400: "#FFA369",
    500: "#F97316", // Main accent
    600: "#D9610F",
    700: "#B34F0C",
    800: "#8C3D09",
    900: "#662C06",
  },

  // Success - Emerald
  success: {
    light: "#D1FAE5",
    main: "#10B981",
    dark: "#047857",
  },

  // Warning - Amber
  warning: {
    light: "#FEF3C7",
    main: "#F59E0B",
    dark: "#B45309",
  },

  // Error - Rose
  error: {
    light: "#FFE4E6",
    main: "#F43F5E",
    dark: "#BE123C",
  },

  // Neutrals - Warm Gray (not pure gray)
  neutral: {
    0: "#FFFFFF",
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
  },

  // Skill Level Colors
  skill: {
    beginner: "#22C55E", // Green
    intermediate: "#3B82F6", // Blue
    advanced: "#A855F7", // Purple
    pro: "#EF4444", // Red
  },

  // Sport Category Colors (for icons/badges)
  sport: {
    basketball: "#F97316",
    soccer: "#22C55E",
    tennis: "#FBBF24",
    volleyball: "#3B82F6",
    running: "#EC4899",
    fitness: "#8B5CF6",
    other: "#6B7280",
  },
};
```

#### Color Palette (Dark Mode)

```typescript
export const darkColors = {
  primary: {
    ...colors.primary,
    500: "#14B8A6", // Slightly brighter for dark mode
  },
  accent: colors.accent, // Keep accent vibrant

  neutral: {
    0: "#1C1917",
    50: "#292524",
    100: "#44403C",
    200: "#57534E",
    300: "#78716C",
    400: "#A8A29E",
    500: "#D6D3D1",
    600: "#E7E5E4",
    700: "#F5F5F4",
    800: "#FAFAF9",
    900: "#FFFFFF",
  },

  // Backgrounds
  background: {
    primary: "#0F0F0F",
    secondary: "#1A1A1A",
    tertiary: "#262626",
    elevated: "#2D2D2D",
  },
};
```

#### Typography

```typescript
// src/constants/typography.ts
// Using Manrope (geometric, sporty) + Plus Jakarta Sans (readable, modern)
// Install: expo install @expo-google-fonts/manrope @expo-google-fonts/plus-jakarta-sans

export const fonts = {
  // Display/Headlines - Manrope (bold, geometric, sporty feel)
  heading: {
    family: "Manrope",
    weights: {
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  // Body/UI - Plus Jakarta Sans (excellent readability)
  body: {
    family: "PlusJakartaSans",
    weights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Monospace (for stats, numbers)
  mono: {
    family: "JetBrainsMono", // or system monospace
    weights: {
      medium: "500",
    },
  },
};

export const fontSize = {
  // Display
  display1: 40, // Hero headlines
  display2: 32, // Section titles

  // Headings
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,

  // Body
  bodyLarge: 17,
  body: 15,
  bodySmall: 13,

  // Caption/Labels
  caption: 12,
  overline: 11,

  // Special
  statNumber: 36, // For big stats display
};

export const lineHeight = {
  tight: 1.1, // Headlines
  normal: 1.4, // Body text
  relaxed: 1.6, // Long-form text
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  extraWide: 1.5, // Overlines, labels
};
```

#### Spacing System

```typescript
// src/constants/spacing.ts
// 4px base unit with intentional jumps

export const spacing = {
  // Micro spacing
  xs: 4,
  sm: 8,
  md: 12,

  // Standard spacing
  lg: 16,
  xl: 20,
  "2xl": 24,

  // Large spacing
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,

  // Extra large
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
};

// Semantic spacing
export const layout = {
  screenPaddingX: 20,
  screenPaddingY: 16,
  cardPadding: 16,
  cardPaddingLarge: 20,
  sectionGap: 32,
  listItemGap: 12,
  inlineGap: 8,
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSmall: 40,
  tabBarHeight: 84,
  headerHeight: 56,
};
```

#### Border Radius System

```typescript
// src/constants/radius.ts
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

// Semantic radius
export const componentRadius = {
  button: 14,
  buttonSmall: 10,
  input: 14,
  card: 18,
  cardLarge: 24,
  modal: 28,
  bottomSheet: 28,
  avatar: 9999,
  badge: 8,
  chip: 10,
  tooltip: 10,
};
```

#### Shadow/Elevation System

```typescript
// src/constants/shadows.ts
import { Platform } from "react-native";

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 9,
  },

  // Colored shadows for primary elements
  primaryGlow: {
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  accentGlow: {
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
```

### Component Styles

#### Button Variants

```typescript
// When implementing with frontend-design skill:

// Primary Button
- Background: primary.500 → primary.600 (pressed)
- Text: white, fontSize.body, font.bold
- Height: 52px, borderRadius: 14px
- Shadow: primaryGlow on idle, none on pressed
- Animation: scale(0.97) on press, 150ms spring

// Secondary Button
- Background: neutral.100 → neutral.200 (pressed)
- Border: 1.5px neutral.300
- Text: neutral.800
- No shadow

// Ghost Button
- Background: transparent → primary.50 (pressed)
- Text: primary.500

// Accent/CTA Button
- Background: accent.500 → accent.600 (pressed)
- Shadow: accentGlow
- Use sparingly for main CTAs only
```

#### Card Styles

```typescript
// Match Card (distinctive diagonal accent)
- Background: white
- BorderRadius: 18px
- Shadow: md
- Padding: 16px
- Left border: 4px accent color (based on sport)
- Slight rotation on press: rotate(-1deg) scale(0.98)

// Chat Preview Card
- Background: white
- BorderRadius: 14px
- Unread indicator: accent.500 dot (8px)
```

#### Input Styles

```typescript
// Text Input
- Background: neutral.50 → white (focused)
- Border: 1.5px neutral.200 → primary.500 (focused)
- BorderRadius: 14px
- Height: 52px
- Padding: 16px horizontal
- Label: floating, animated on focus
- Error: border error.main, helper text error.main

// Phone Input (special)
- Country code selector with flag
- Divider line between code and number
- Format as user types: +20 XXX XXX XXXX
```

#### Avatar Styles

```typescript
// Sizes
- xs: 28px (chat messages)
- sm: 36px (list items)
- md: 48px (cards)
- lg: 64px (profile headers)
- xl: 96px (own profile)

// Status dot
- Position: bottom-right, 25% of avatar size
- Border: 2px white
- Colors: success (online), warning (away), neutral.400 (offline)

// Stacked avatars (participants)
- Overlap: 30%
- Max shown: 4, then "+X" badge
- Border: 2px white each
```

#### Badge Styles

```typescript
// Skill Level Badge
- Beginner: bg success.light, text success.dark, icon: seedling
- Intermediate: bg primary.100, text primary.700, icon: flame
- Advanced: bg purple.100, text purple.700, icon: lightning
- Pro: bg error.light, text error.dark, icon: trophy

// Sport Badge
- Pill shape, borderRadius: 8px
- Sport icon + name
- Background: sport color at 10% opacity
- Text: sport color

// Status Badge (match status)
- Upcoming: accent.500 bg
- In Progress: success.main bg, pulse animation
- Completed: neutral.400 bg
- Cancelled: strikethrough effect
```

### Animations & Micro-interactions

```typescript
// Use react-native-reanimated for all animations
// src/constants/animations.ts

export const animations = {
  // Timing
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,

  // Spring configs
  springBouncy: {
    damping: 12,
    stiffness: 180,
  },
  springSmooth: {
    damping: 20,
    stiffness: 200,
  },
  springGentle: {
    damping: 25,
    stiffness: 120,
  },
};

// Key Animations to Implement:

// 1. Screen Transitions
- Shared element: Match card → Match details (image + title)
- Push: Slide from right with parallax (background moves slower)
- Modal: Spring up from bottom with backdrop fade

// 2. List Animations
- Initial load: Staggered fade-in + slide-up (50ms delay each)
- Pull-to-refresh: Custom Lottie animation (ball bouncing)
- New item: Slide in from top with highlight flash

// 3. Button Feedback
- Press: scale(0.97), 150ms spring
- Release: scale(1), bouncy spring
- Haptic: Light impact on press

// 4. Card Interactions
- Press: scale(0.98) + rotate(-0.5deg) + shadow reduction
- Long press: scale(0.95) + stronger rotation

// 5. Input Focus
- Label float: translateY(-24) + scale(0.85), 200ms
- Border color: fade to primary, 150ms

// 6. Toast/Notifications
- Enter: slide from top + fade, spring
- Exit: slide up + fade, 200ms

// 7. Tab Bar
- Active icon: scale(1.1) + color change, bouncy spring
- Indicator: sliding underline, smooth spring

// 8. Chat
- New message: slide up + fade, 200ms
- Send: message slides right then up to position
- Typing indicator: 3 dots with wave animation

// 9. Map Markers
- Appear: scale from 0 + bounce
- Selected: scale(1.2) + shadow increase
- Pulse: own location has infinite pulse ring
```

### Dark Mode Implementation

```typescript
// Use React Native's useColorScheme + context
// src/contexts/ThemeContext.tsx

// Key considerations:
1. Automatic system detection with manual override option
2. Persist user preference in AsyncStorage
3. Smooth transition between modes (optional, 300ms fade)

// Dark mode adjustments:
- Backgrounds: Use neutral.900 → neutral.700 hierarchy (not pure black)
- Cards: neutral.800 with subtle border (neutral.700)
- Primary color: Bump to primary.400 for better contrast
- Shadows: Reduce opacity, or use subtle borders instead
- Images/avatars: Add subtle dark overlay or vignette

// Components that need special dark mode treatment:
- Map: Use dark map style (Google Maps dark theme)
- Charts/stats: Invert axis colors
- Inputs: Lighter placeholder text
- Bottom sheets: Elevated background color
```

### Accessibility

```typescript
// src/constants/accessibility.ts

export const a11y = {
  // Minimum touch targets
  minTouchSize: 44,

  // Focus indicators
  focusRingWidth: 2,
  focusRingColor: 'primary.500',
  focusRingOffset: 2,

  // Color contrast (WCAG AA)
  minContrastRatio: 4.5,
  minContrastLarge: 3.0,

  // Motion
  reduceMotionAlternative: true, // Provide alternatives for animations

  // Screen reader
  announcePageChanges: true,
  announceListUpdates: true,
};

// Required for every interactive element:
- accessibilityLabel: descriptive text
- accessibilityRole: 'button', 'link', 'header', etc.
- accessibilityHint: what happens when activated
- accessibilityState: { selected, disabled, checked }
```

### Implementation Notes

> **CRITICAL**: When implementing any UI component or screen:
>
> 1. Always invoke the `frontend-design` skill first
> 2. Reference this design system for consistency
> 3. Avoid generic patterns - make each component distinctive
> 4. Test on both iOS and Android
> 5. Verify dark mode appearance
> 6. Check accessibility with screen readers

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
│   │   ├── index.tsx             # Phone input
│   │   ├── verify.tsx            # OTP verification
│   │   └── onboarding.tsx        # Profile setup
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
│   ├── stores/                   # Zustand stores
│   ├── services/                 # Supabase API services
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts     # Auto-generated from Supabase
│   ├── utils/                    # Utilities
│   └── config/
│       └── env.ts                # Environment config helper
├── supabase/
│   ├── config.toml               # Supabase local config
│   ├── seed.sql                  # Dev seed data
│   ├── migrations/
│   │   ├── 20240101000000_initial_schema.sql
│   │   ├── 20240102000000_add_profiles.sql
│   │   ├── 20240103000000_add_matches.sql
│   │   ├── 20240104000000_add_chat.sql
│   │   ├── 20240105000000_add_ratings.sql
│   │   ├── 20240106000000_add_notifications.sql
│   │   └── 20240107000000_add_rls_policies.sql
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
- bounds (JSONB) - { north, south, east, west } coordinates
- center (geography POINT) - default map center for the city
- is_active (boolean) - can disable without deleting

Seeded with: Sheikh Zayed, New Cairo, Maadi

### sports

- id, name, icon, color
- is_active (for soft delete/disable)

Seeded with: Basketball, Soccer, Tennis, Volleyball, Running, Padel, Swimming, Golf, Badminton, Squash, Pickleball, Spikeball

### profiles

- id (UUID, references auth.users.id)
- phone_number, display_name, avatar_url
- expo_push_token

**Link to auth.users**: A database trigger (`on_auth_user_created`) automatically creates a profile row when a user signs up. The `id` is the same as `auth.users.id`.

### user_sports

- id, user_id, sport_id
- skill_level (enum: beginner/intermediate/advanced/pro)
- created_at

**Constraint**: User must have a skill level set for a sport before creating or requesting to join a match of that sport. Unique constraint on (user_id, sport_id).

### matches

- id, creator_id, title, description
- sport_id (references sports), skill_level (enum, nullable - open to all if null)
- city_id (references cities) - required, enforces supported locations
- location (geography), location_name
- scheduled_at, duration_minutes
- max_players
- status (upcoming/in_progress/completed/cancelled)
- requires_approval

**Constraints**:
- A user can only have 1 active match (status = upcoming/in_progress) as creator at a time. Enforced via RLS policy to prevent spam.
- Match location must fall within the referenced city's bounds (validated on insert/update).

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
   - Set `detectSessionInUrl: false` (not needed for mobile)
   - Reason: Secure token storage is critical for mobile apps, SecureStore uses Keychain (iOS) and Keystore (Android)

7. **Created environment config helper (src/config/env.ts)**
   - Typed interface for all environment variables
   - Helper functions: `isDev`, `isProd`
   - Reason: Type safety and centralized access to env vars

8. **Set up Expo Router structure**
   - `app/_layout.tsx` - Root layout with GestureHandlerRootView, providers, fonts
   - `app/(auth)/_layout.tsx` - Stack navigator for auth flow
   - `app/(auth)/index.tsx` - Phone input screen (placeholder)
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
    - SMS auth enabled for phone OTP
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

- Generate TypeScript types after running migrations locally (`npm run db:types`)

### Phase 2: Authentication

1. Phone OTP sign-in screen
2. OTP verification screen
3. Onboarding flow (name, avatar, preferences)
4. Auth state management with Zustand
5. Protected routes

**Files to create:**

- `app/(auth)/index.tsx` - Phone input
- `app/(auth)/verify.tsx` - OTP verification
- `app/(auth)/onboarding.tsx` - Profile setup
- `src/services/auth.service.ts`
- `src/stores/authStore.ts`

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

- PostGIS extension for geospatial queries
- `get_nearby_matches()` database function for efficient radius search
- GIST index on location columns

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
