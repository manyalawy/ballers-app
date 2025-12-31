# Ballers

A mobile app where users create sports matches, others request to join, get approved, then chat and play together.

## Tech Stack

- **Frontend:** React Native with Expo (TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Auth:** Phone number OTP
- **State:** Zustand (UI) + React Query (server)
- **Maps:** react-native-maps + expo-location

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker Desktop (must be running)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Step 1: Install Dependencies

```bash
# Install project dependencies
npm install

# Install Supabase CLI via Homebrew (macOS)
brew install supabase/tap/supabase
```

### Step 2: Start Docker

Make sure Docker Desktop is running before proceeding.

### Step 3: Start Local Supabase

```bash
npm run db:start
```

This will start a local Supabase instance. First run may take a few minutes to download Docker images.

### Step 4: Create Environment File

Create `.env.development` in the project root:

```bash
# .env.development
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-dev-maps-key
```

> **Note:** The anon key above is the standard local Supabase demo key. You can verify it by running `supabase status -o env`.

### Step 5: Run Migrations

```bash
# Reset database and run all migrations
npm run db:reset
```

### Step 6: Generate TypeScript Types

```bash
npm run db:types
```

This creates `src/types/database.types.ts` with type definitions for all tables.

### Step 7: Verify Setup

```bash
# Check Supabase status
supabase status
```

You should see:
- **Studio:** http://127.0.0.1:54323 (Database UI)
- **API:** http://127.0.0.1:54321
- **Database:** postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Test Phone Numbers (Local Development)

For testing phone OTP authentication locally, use these numbers with OTP code `123456`:
- +201234567890
- +201111111111
- +201000000000

## Database

### Quick Reference

```bash
npm run db:start    # Start local Supabase
npm run db:stop     # Stop local Supabase
npm run db:reset    # Reset DB and run all migrations
npm run db:types    # Generate TypeScript types
```

### Migration Commands

| Command | Description |
|---------|-------------|
| `npm run db:start` | Start local Supabase |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reset DB and run all migrations |
| `npm run db:migrate` | Push pending migrations to remote |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:migrate:new <name>` | Create a new migration |
| `npm run db:types` | Generate TypeScript types from schema |

### Creating a New Migration

```bash
npm run db:migrate:new add_feature_name
```

This creates a timestamped migration file in `supabase/migrations/`.

### Migration Files

```
supabase/migrations/
├── 20251231144955_initial_schema.sql    # Extensions & enums
├── 20251231145000_add_cities.sql        # Cities (Sheikh Zayed, New Cairo, Maadi)
├── 20251231145100_add_profiles.sql      # Sports, profiles, user_sports
├── 20251231145200_add_matches.sql       # Matches, participants
├── 20251231145300_add_chat.sql          # Chat rooms & messages
├── 20251231145400_add_ratings.sql       # Post-match ratings
├── 20251231145500_add_social.sql        # Friendships & blocks
└── 20251231145600_add_rls_policies.sql  # Row-level security
```

## Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
/Ballers
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth flow (public)
│   └── (tabs)/            # Main app (authenticated)
├── src/
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   ├── services/          # Supabase API services
│   ├── types/             # TypeScript types
│   └── config/            # Environment config
├── supabase/
│   ├── migrations/        # Database migrations
│   ├── seed.sql          # Development seed data
│   └── config.toml       # Local Supabase config
└── .github/workflows/     # CI/CD workflows
```

## Supported Locations

The app currently supports matches in:
- Sheikh Zayed
- New Cairo
- Maadi

## Sports

Basketball, Soccer, Tennis, Volleyball, Running, Padel, Swimming, Golf, Badminton, Squash, Pickleball, Spikeball

## CI/CD

### Production Migrations

Migrations are automatically applied to production when changes are pushed to `main` branch in the `supabase/migrations/` directory.

**Required GitHub Secrets:**
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token
- `PRODUCTION_PROJECT_REF` - Your production project reference ID

## Contributing

1. Create a feature branch
2. Make changes
3. Create migrations if needed (`npm run db:migrate:new`)
4. Test locally with `npm run db:reset`
5. Submit a PR

## License

Private - All rights reserved
