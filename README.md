# rooMate 🏠

**La piattaforma unica per trovare e affittare stanze.**

Basta confusione tra Facebook, Subito e Idealista. Un solo portale per cercare, visitare e affittare la tua prossima stanza.

## 🎯 Caratteristiche

- **Un Solo Portale** - Tutte le stanze in un unico posto
- **Mappa e Filtri** - Cerca facilmente per zona, prezzo, caratteristiche
- **Sistema Interessi** - Esprimi interesse e gestisci la coda (max 6 attivi per annuncio)
- **Lista Desideri** - Salva ricerche e ricevi notifiche per nuovi annunci
- **Gestione Appuntamenti** - Prenota visite e open day dalla piattaforma
- **Chat Integrata** - Comunica direttamente con proprietari e inquilini
- **Scadenza Annunci** - Annunci scadono dopo 30 giorni con rinnovo one-click
- **App Mobile** - Esperienza nativa su iOS e Android

## 🏗️ Struttura del Progetto

```
roommate/
├── apps/
│   ├── web/              # Next.js 14 web app
│   │   └── src/
│   │       ├── app/      # App Router pages & API routes
│   │       ├── components/
│   │       └── lib/      # Utilities & auth
│   └── mobile/           # React Native (Expo 51) mobile app
│       ├── app/          # Expo Router pages
│       ├── components/
│       ├── hooks/        # React Query hooks
│       ├── lib/          # API client
│       └── store/        # Zustand stores
├── packages/
│   ├── database/         # Prisma schema, migrations & seed
│   └── shared/           # Types, Zod schemas & utilities
└── package.json          # Root monorepo config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ (or Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/AG4MA/roommate.git
cd roommate

# Install dependencies
pnpm install

# Configure environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your settings (see Environment Variables section)

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed sample data (optional)
pnpm db:seed

# Start development server
pnpm dev:web
```

### Mobile Development

```bash
# Configure mobile environment
cp apps/mobile/.env.example apps/mobile/.env.local
# Set EXPO_PUBLIC_API_URL to your web API URL

# Start the mobile app
pnpm dev:mobile

# Or directly from the folder
cd apps/mobile
npx expo start
```

## 🔑 Environment Variables

### Web App (`apps/web/.env.local`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/roommate"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cron jobs (optional, for listing expiry)
CRON_SECRET="your-cron-secret"
```

### Mobile App (`apps/mobile/.env.local`)

```env
# API URL (your web app URL)
EXPO_PUBLIC_API_URL="http://192.168.1.x:3000"
```

## 📱 Tech Stack

### Web
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Database ORM
- **NextAuth.js** - Authentication
- **React Leaflet** - Interactive maps
- **React Hook Form + Zod** - Forms and validation

### Mobile
- **React Native 0.74** - Cross-platform mobile
- **Expo 51** - Development tooling
- **Expo Router** - File-based navigation
- **React Query 5** - Data fetching & caching
- **Zustand** - State management
- **Expo Secure Store** - Secure token storage

### Shared
- **TypeScript** - Type safety everywhere
- **Zod** - Schema validation
- **pnpm Workspaces** - Monorepo management

## 📂 API Routes

### Authentication
```
POST   /api/auth/register           # Register new user
GET    /api/auth/[...nextauth]      # NextAuth handlers
```

### Listings
```
GET    /api/listings                # List with filters (?city=&minPrice=&maxPrice=&roomType=)
POST   /api/listings                # Create listing (landlord)
GET    /api/listings/:id            # Get listing detail
PUT    /api/listings/:id            # Update listing (owner only)
DELETE /api/listings/:id            # Delete listing (owner only)
POST   /api/listings/:id/renew      # Renew expired listing (owner)
GET    /api/listings/:id/slots      # Get available visit slots
```

### Interests (Tenant expressions of interest)
```
POST   /api/listings/:id/interest   # Express interest in listing
DELETE /api/listings/:id/interest   # Withdraw interest
```

### Bookings
```
GET    /api/bookings                # Get my bookings
POST   /api/bookings                # Create booking for a slot
DELETE /api/bookings/:id            # Cancel booking
```

### Conversations & Messages
```
GET    /api/conversations           # List my conversations
POST   /api/conversations           # Start new conversation
GET    /api/conversations/:id       # Get conversation with messages
POST   /api/conversations/:id/messages  # Send message
```

### Wishes (Saved searches)
```
GET    /api/wishes                  # List my wishes
POST   /api/wishes                  # Create wish
PUT    /api/wishes/:id              # Update wish
DELETE /api/wishes/:id              # Delete wish
```

### Profiles
```
GET    /api/profile/tenant          # Get tenant profile
PUT    /api/profile/tenant          # Update tenant profile
GET    /api/profile/landlord        # Get landlord profile
PUT    /api/profile/landlord        # Update landlord profile
```

### Admin / Cron
```
POST   /api/cron/expire-listings    # Expire old listings (cron job)
GET    /api/cron/expire-listings    # Health check for cron
```

## 🗄️ Database Schema

### Core Models
- **User** - Users with role (TENANT/LANDLORD), profile data, verification status
- **TenantProfile** - Extended tenant info (occupation, bio, preferences)
- **LandlordProfile** - Extended landlord info (company, properties managed)

### Listings
- **Listing** - Room listings with location, price, features, expiration
- **ListingImage** - Listing photos
- **VisitSlot** - Available slots for visits (individual or open day)

### Interactions
- **Interest** - Tenant interest queue (max 6 active per listing)
- **Booking** - Visit bookings
- **Wish** - Saved searches with notification preferences

### Communication
- **Conversation** - Chat threads between users
- **Message** - Individual messages in conversations

## 🛠️ Useful Commands

```bash
# Development
pnpm dev:web        # Start Next.js dev server
pnpm dev:mobile     # Start Expo dev server

# Build
pnpm build:web      # Production build for web

# Database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed sample data
pnpm db:studio      # Open Prisma Studio

# Linting & Types
pnpm lint           # Lint all packages
pnpm typecheck      # Check TypeScript
```

## 🔄 Listing Lifecycle

1. **Creation** - Landlord creates listing via 6-step wizard
2. **Active** - Listing is visible and accepting interests
3. **Warning** - At day 25, landlord receives expiry warning
4. **Expired** - At day 30, listing is marked EXPIRED
5. **Renewal** - One-click renewal for another 30 days

## 🎯 Interest System

- Tenants can express interest in listings
- Maximum **6 active interests** per listing at a time
- Additional interests go to **waiting queue**
- When interest is withdrawn, next in queue is promoted
- **Engagement score** increases with profile completion and messages

## 📱 Mobile App Features

- **Search** - Browse listings with real-time API
- **Room Detail** - Full listing info with contact actions
- **Messages** - Real-time chat with pull-to-refresh
- **Profile** - Auth state, role display, logout
- **Secure Storage** - JWT tokens stored securely

## 📄 License

MIT

---

Made with ❤️ for everyone looking for their next home.
