# rooMate 🏠

**La piattaforma unica per trovare e affittare stanze.**

Basta confusione tra Facebook, Subito e Idealista. Un solo portale per cercare, visitare e affittare la tua prossima stanza.

## 🎯 Caratteristiche

- **Un Solo Portale** - Tutte le stanze in un unico posto
- **Mappa e Filtri** - Cerca facilmente per zona, prezzo, caratteristiche
- **Gestione Appuntamenti** - Prenota visite e open day dalla piattaforma
- **Profili Verificati** - Affittuari e proprietari verificati
- **Tour Virtuali** - Visita le stanze da remoto
- **Chat Integrata** - Comunica direttamente con i proprietari

## 🏗️ Struttura del Progetto

```
roommate/
├── apps/
│   ├── web/          # Next.js web app
│   └── mobile/       # React Native (Expo) mobile app
├── packages/
│   ├── database/     # Prisma schema e client
│   └── shared/       # Tipi, schemi e utility condivisi
└── package.json      # Root monorepo config
```

## 🚀 Quick Start

### Prerequisiti

- Node.js 20+
- pnpm 8+
- PostgreSQL (o Docker)

### Installazione

```bash
# Clona il repository
git clone https://github.com/AG4MA/roommate.git
cd roommate

# Installa dipendenze
pnpm install

# Configura le variabili d'ambiente
cp apps/web/.env.example apps/web/.env.local
# Modifica .env.local con le tue configurazioni

# Genera il client Prisma
pnpm db:generate

# Esegui le migrazioni (opzionale, per sviluppo)
pnpm db:push

# Avvia il server di sviluppo
pnpm dev:web
```

### Sviluppo Mobile

```bash
# Installa Expo CLI globalmente (se non già installato)
npm install -g expo-cli

# Avvia l'app mobile
pnpm dev:mobile

# Oppure direttamente dalla cartella
cd apps/mobile
npx expo start
```

## 📱 Stack Tecnologico

### Web
- **Next.js 14** - React framework con App Router
- **Tailwind CSS** - Styling utility-first
- **Prisma** - ORM per database
- **NextAuth.js** - Autenticazione
- **React Leaflet** - Mappe interattive
- **React Hook Form + Zod** - Form e validazione

### Mobile
- **React Native** - Framework mobile cross-platform
- **Expo** - Tooling e servizi per React Native
- **Expo Router** - File-based routing
- **React Query** - Data fetching e caching
- **Zustand** - State management

### Shared
- **TypeScript** - Type safety ovunque
- **Zod** - Schema validation
- **pnpm Workspaces** - Monorepo management

## 🔑 Funzionalità Principali

### Per chi cerca una stanza
1. 🔍 Cerca con filtri avanzati e mappa
2. 📅 Prenota visite o partecipa a open day
3. 🎥 Fai tour virtuali da remoto
4. 💬 Contatta direttamente i proprietari
5. ❤️ Salva i preferiti

### Per chi affitta
1. 📝 Pubblica annunci con foto e descrizioni
2. 🎛️ Imposta filtri per l'inquilino ideale
3. 📆 Organizza open day o appuntamenti singoli
4. ✅ Gestisci le prenotazioni dalla dashboard
5. 💬 Comunica con i candidati

## 📂 API Routes

```
GET    /api/listings          # Lista annunci con filtri
GET    /api/listings/:id      # Dettaglio annuncio
GET    /api/listings/:id/slots # Slot disponibili per visite
POST   /api/bookings          # Crea prenotazione
GET    /api/bookings          # Le mie prenotazioni
POST   /api/auth/register     # Registrazione
POST   /api/auth/login        # Login
```

## 🗄️ Database Schema

Modelli principali:
- `User` - Utenti (affittuari e proprietari)
- `Listing` - Annunci di stanze
- `Booking` - Prenotazioni visite
- `VisitSlot` - Slot disponibili per visite
- `Conversation/Message` - Sistema messaggistica
- `Favorite` - Annunci preferiti

## 🛠️ Comandi Utili

```bash
# Sviluppo
pnpm dev:web        # Avvia Next.js
pnpm dev:mobile     # Avvia Expo

# Build
pnpm build:web      # Build production web

# Database
pnpm db:generate    # Genera Prisma client
pnpm db:push        # Push schema al database
pnpm db:studio      # Apri Prisma Studio

# Linting
pnpm lint           # Lint tutto il progetto
```

## 📄 License

MIT

---

Made with ❤️ for everyone looking for their next home.
