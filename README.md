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
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (for local Supabase)

### Installation

```bash
# Install dependencies
npm install

# Install Supabase CLI (if not installed)
npm install -g supabase
```

### Environment Setup

1. Copy environment files:
```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

2. Update with your Supabase credentials:
```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=your-dev-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
```

## Database

### Local Development

```bash
# Start local Supabase (requires Docker)
npm run db:start

# Reset database and run all migrations
npm run db:reset

# Generate TypeScript types
npm run db:types
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
