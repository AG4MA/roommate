# rooMate — SAL (Stato Avanzamento Lavori)

> **Obiettivo:** diventare LA piattaforma per affittare stanze in Italia.
> Nessun generalista (Immobiliare, Idealista, Bakeca), nessun verticale (Roomgo, HousingAnywhere, Spotahome) deve poter competere sulla qualità dell'esperienza inquilino ↔ proprietario per stanze singole.

---

## Analisi competitiva — dove vinciamo e dove perdiamo

| Competitor | Punti di forza | Punti deboli | Come li battiamo |
|---|---|---|---|
| **Immobiliare.it** | Brand N.1, volume enorme, SEO imbattibile, valutazioni immobili, mutui | Generalista (case intere, vendita, uffici) → UX stanze mediocre. Niente matching, niente gestione coda interessi | Focus verticale stanze: wizard dedicato, matching intelligente, queue management, trasparenza costi |
| **Idealista** | Grande volume, filtri decenti, mappa | UX datata, zero matching, contatto diretto (spam di chiamate), niente profili inquilini | Eliminare lo spam: coda gestita, profili verificati, comunicazione in-app |
| **Roomgo** | Verticalizzato stanze, profili coinquilini, dal 1999 | UI vecchia, niente mappa live, niente trasparenza costi dettagliata, matching "a sensazione" | UX moderna, mappa interattiva, scoring trasparente, wizard guidato, gruppi coinquilini |
| **HousingAnywhere** | Pagamenti protetti, tenant protection, niente visite obbligatorie, 150+ città, app mobile | Mostly mid-term (3-12 mesi), fee alta per inquilino, focus internazionale non Italia | Focus Italia profondo (contratti italiani, quartieri, trasporto pubblico), visite reali + open day, zero fee inquilino |
| **Spotahome** | Video verificati, contenuto qualitativo, prenotazione online | Costoso per landlord, tempi lunghi di verifica, poche città italiane | Velocità di pubblicazione, gestione autonoma proprietario, verifica community-driven |
| **Bakeca** | Gratuito, semplice | Classificato generico, zero matching, zero profili, nessuna gestione | Tutto ciò che Bakeca non fa: matching, profili, queue, verifiche, contratti |

### I nostri vantaggi competitivi unici (moat)

1. **Queue System con scoring** — nessun competitor ha una coda gestita con engagement scoring (profilo 40%, certificazioni 30%, attività 15%, login recency 15%)
2. **Wish System (domanda anticipata)** — chi cerca può inserire la propria "desiderata" PRIMA che esista un annuncio → quando un annuncio matcha, passa automaticamente in coda interesse (FIFO per chi ha inserito prima)
3. **Gruppi coinquilini** — cerchi stanza con amici? Crea un gruppo, candidatevi insieme. Nessun competitor ce l'ha
4. **Trasparenza costi totale** — breakdown dettagliato: affitto base, luce/gas, acqua, riscaldamento, condominiali, pulizia (freq + durata). Niente sorprese
5. **Wizard proprietario senza registrazione** — pubblica prima, registrati dopo. Zero friction
6. **Open Day + visite virtuali** — slot prenotabili, no spam telefonico

---

## Stato attuale — cosa è fatto

### ✅ Core (funzionante)

- [x] Auth: registrazione con role picker, login, session JWT (NextAuth)
- [x] Wizard pubblicazione: 7 step (BasicInfo, Location, Features, Contract, Media, Preferences, Review)
- [x] Pubblicazione anonima: editToken + editCode, claim successivo
- [x] Ricerca: filtri, mappa Leaflet, bounding-box, vista lista/mappa
- [x] Ricerca guidata (wizard): 10 step → SwipeCardStack (stile Tinder)
- [x] Dettaglio stanza: foto, mappa, features, regole, coinquilini, amenity (Overpass API)
- [x] Interest queue: scoring, position, cooldown 24h su rimozione, max 3 attivi per annuncio
- [x] Limite 8 interessi attivi per cercatore
- [x] Booking: slot visite (SINGLE/OPENDAY/VIRTUAL), prenotazione, conferma, no-show tracking
- [x] Messaging: conversazioni, messaggi, conteggio non letti
- [x] Gruppi coinquilini: CRUD, inviti email, chat gruppo, candidatura collettiva
- [x] Wish system: CRUD API (max 5 per utente), filtri salvati
- [x] Profili: inquilino + proprietario, dashboard "I miei annunci"
- [x] Feedback: bottone globale, rating + testo, salvataggio DB
- [x] Cron scadenza annunci: expire + cascade interessi
- [x] Breakdown costi: all-inclusive flag, voci dettagliate
- [x] Contratto: tipo, date, durata min/max, rinnovo, residenza/domicilio, fuori sede

### ⚠️ Parziale (iniziato ma incompleto)

- [~] App mobile: struttura completa (Expo Router, 5 tab), auth funzionante, ma booking con mock data, niente mappa, niente immagini reali, profilo non editabile
- [~] Analytics: tracking client-side in localStorage, nessun invio al server
- [~] SEO: metadata base, `lang="it"`, ma niente OG tags dinamici, sitemap, robots.txt, JSON-LD

---

## Cosa manca — roadmap per dominare

### 🔴 P0 — Bloccanti per il lancio

#### 1. Email transazionali
**Stato:** ✅ completato.
**Implementato:**
- [x] Integrazione servizio email (Resend) — `apps/web/src/lib/email.ts`
- [x] Template email: verifica account, reset password, conferma prenotazione, cancellazione, notifica interesse, interesse approvato, match wish, annuncio in scadenza, annuncio scaduto, benvenuto
- [x] Integrato in: cron expire-listings, bookings PATCH, interest POST
- [x] Dev mode: fallback console.log se RESEND_API_KEY assente

#### 2. Password reset + verifica email
**Stato:** ✅ completato.
**Implementato:**
- [x] Modello `VerificationToken` con enum `VerificationTokenType` (EMAIL_VERIFICATION, PASSWORD_RESET)
- [x] Campo `emailVerified` su User model
- [x] `POST /api/auth/forgot-password` — genera token reset (1h scadenza), email con link
- [x] `POST /api/auth/reset-password` — valida token, aggiorna password con bcrypt
- [x] `GET /api/auth/verify-email` — verifica email da link, redirect a login con status
- [x] Registrazione invia email verifica + welcome automaticamente
- [x] Login page: form "Password dimenticata?", form reset password, banner status verifica
- [x] Sicurezza: token monouso, scadenza temporale, risposta generica anti-enumerazione
- [x] Schema DB applicato con `prisma db push`

#### 3. Storage immagini cloud
**Stato:** ✅ completato.
**Implementato:**
- [x] `apps/web/src/lib/storage.ts` — modulo storage con dual-mode (Vercel Blob cloud / local fallback)
- [x] Image processing con sharp: resize automatico (full 1600×1200, thumbnail 400×300), conversione WebP, compressione qualità
- [x] Upload route riscritta (`/api/upload`) — usa il nuovo modulo storage
- [x] `thumbnailUrl` aggiunto a `ListingImage` nel DB + schema Prisma
- [x] Listing API (GET list, GET detail, POST, POST anonymous) aggiornate per `thumbnailUrl`
- [x] Search results card usa `thumbnailUrl` per caricamento più veloce
- [x] `ListingCard` type aggiornato in `@roommate/shared`
- [x] Cron cleanup immagini orfane: `GET /api/cron/cleanup-images` — pulisce storage per annunci scaduti da 30+ giorni
- [x] Delete functions: `deleteImage()`, `deleteImages()` per rimozione da cloud/local
- [x] Env var: `BLOB_READ_WRITE_TOKEN` (Vercel Blob) — se assente, fallback locale per dev

#### 4. Wish matching engine (domanda anticipata → killer feature)
**Stato:** ✅ completato.
**Implementato:**
- [x] `apps/web/src/lib/wish-matcher.ts` — engine completo con matching multi-criterio
- [x] Matching criteria: città, quartiere (fuzzy), range prezzo, tipo stanza, dimensione minima, features richieste
- [x] Creazione automatica Interest in coda FIFO (chi ha inserito wish prima → posizione più bassa = priorità)
- [x] Rispetta limiti: max 8 interessi per cercatore, no duplicati, no self-match
- [x] Email automatica al match via `sendWishMatchedEmail`
- [x] Aggiornamento `lastMatchedAt` su wish
- [x] Trigger real-time: integrato nel listing POST route (fire-and-forget su publish)
- [x] Cron batch fallback: `GET /api/cron/match-wishes` — verifica listing ultime 24h vs tutti i wish attivi
- [x] Funzioni esportate: `matchListingAgainstWishes(listingId)`, `batchMatchWishes()`

#### 5. Sicurezza API
**Stato:** ✅ completato.
**Implementato:**
- [x] `apps/web/src/lib/security.ts` — rate limiting in-memory + sanitizzazione XSS
- [x] Rate limiting presets: default (60/min), strict (5/min per auth), upload (20/min)
- [x] Applicato a: `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/upload`
- [x] Fix auth `POST /api/bookings`: ora usa `session.user.id` invece di `body.tenantId`
- [x] Fix auth `GET /api/profile/tenant`: ora usa `session.user.id` invece di `query.userId`
- [x] Fix auth `PUT /api/profile/tenant`: ora usa `session.user.id` invece di `body.userId`
- [x] `apps/web/src/middleware.ts` — CORS middleware per API routes (Expo dev, production origins)
- [x] Funzioni di sanitizzazione: `sanitizeInput()`, `sanitizeObject()` per prevenire XSS
- [x] `getClientIp()` per logging e rate limiting (supporta x-forwarded-for, x-real-ip)

#### 6. Pagina cercatore — "I miei interessi" e appuntamenti
**Stato:** ✅ completato.
**Implementato:**
- [x] `GET /api/interests/dashboard` — API dedicata che ritorna interessi (active + waiting) con listing info + appuntamenti futuri (PENDING/CONFIRMED)
- [x] `CercatoreDashboard` component — sezione in alto nella pagina `/cerca` con "I tuoi interessi (N/8)" e "I tuoi appuntamenti"
- [x] Dashboard collassabile, non intrusiva, con thumbnail, prezzo, tipo stanza, stato interesse/appuntamento
- [x] Quick actions su `/mi-interessa`: pulsante "Ritira" con conferma (chiama `DELETE /api/listings/[id]/interest`), link "Dettaglio" e "Prenota visita"
- [x] Counter interessi (N/8) visibile nell'header della pagina mi-interessa
- [x] Quick action su `/appuntamenti`: pulsante "Annulla prenotazione" per booking PENDING dell'inquilino
- [x] Si nasconde se non loggato o se non ci sono interessi/appuntamenti

---

### 🟡 P1 — Necessari per competere

#### 7. Messaggistica real-time ✅ completato
**Stato:** ~~polling manuale, no WebSocket.~~ **Real-time completo con SSE.**
- [x] SSE event bus per messaggi in tempo reale (`apps/web/src/lib/realtime.ts` — RealtimeEventBus singleton, canali per conversazione/utente, createSSEStream factory)
- [x] Endpoint SSE: `/api/conversations/[id]/stream` (eventi conversazione), `/api/notifications/stream` (eventi utente)
- [x] Integrazione real-time in POST messaggi (NEW_MESSAGE + UNREAD_COUNT) e GET conversazione (MESSAGE_READ)
- [x] Indicatore "sta scrivendo..." (`/api/conversations/[id]/typing` — POST endpoint, animazione puntini nel chat)
- [x] Read receipts (✓ inviato, ✓✓ letto in blu)
- [x] Pagina `/messaggi` — split-pane UI con lista conversazioni + chat, responsive mobile con back button
- [x] Invio ottimistico con rollback su errore, polling fallback 30s
- [x] Badge unread su icona Messaggi in Navbar (desktop + mobile), `document.title` con conteggio non letti

#### 8. Notifiche push ✅ completato
**Stato:** ~~non esiste.~~ **Sistema notifiche completo: email + web push + Expo push + preferenze utente.**
- [x] Modelli Prisma: `PushSubscription` (endpoint, p256dh, auth, expoPushToken, platform) + `NotificationPreference` (per-channel + per-tipo + quiet hours)
- [x] `apps/web/src/lib/push.ts` — web-push VAPID config, `sendPushToUser()`, `sendExpoPush()`, `registerSubscription()`, `registerExpoToken()`, VAPID key generation, quiet hours check
- [x] `apps/web/src/lib/notifications.ts` — dispatcher unificato `notify()` con controllo preferenze per-tipo, `notifyMany()`, shortcut functions (`notifyNewMessage`, `notifyInterestReceived`, `notifyInterestApproved`, `notifyBookingConfirmed`, `notifyBookingCancelled`, `notifyWishMatched`)
- [x] Service worker `apps/web/public/sw.js` — push event handler, notification click → navigate, action buttons per tipo
- [x] API `POST/DELETE /api/push/subscribe` — registra/rimuovi sottoscrizione push, `GET` per VAPID public key
- [x] API `GET/PUT /api/notifications/preferences` — lettura/aggiornamento preferenze notifica con upsert
- [x] Pagina `/notifiche` — UI completa con toggle canali (email/push), toggle per-tipo (9 tipi), ore silenziose, attivazione/disattivazione push browser, auto-save
- [x] Integrazione trigger in API esistenti:
  - `POST /api/listings/[id]/interest` → `notifyInterestReceived` (sostituisce email diretto)
  - `PATCH /api/listings/[id]/queue` approve_scheduling → `notifyInterestApproved` (nuovo)
  - `PATCH /api/bookings` CONFIRMED/CANCELLED → `notifyBookingConfirmed`/`notifyBookingCancelled` (sostituisce email diretto)
  - `POST /api/conversations/[id]/messages` → `notifyNewMessage` push per utenti offline (nuovo)
  - `POST /api/cron/expire-listings` → `notify` LISTING_EXPIRED/LISTING_EXPIRING (sostituisce email diretto)
  - `wish-matcher.ts` → `notifyWishMatched` (sostituisce email diretto)
- [x] Bell icon + link Notifiche nella Navbar (desktop + mobile)

#### 9. Social login ✅ completato
**Stato:** ✅ Google OAuth + Apple Sign In + Account linking completi
- [x] Google OAuth — GoogleProvider con `allowDangerousEmailAccountLinking`, profilo con avatar
- [x] Apple Sign In — AppleProvider con gestione nome (firstName/lastName fallback)
- [x] Link account: social → credenziali esistenti (auto-link per stessa email nel signIn callback)
- [x] Account model Prisma (provider, providerAccountId, tokens, unique constraint)
- [x] PrismaAdapter integrato in NextAuth con strategia JWT mantenuta
- [x] Bottoni "Continua con Google/Apple" su login + registrazione (SVG icons, loading states)
- [x] Pagina `/profilo/account` — gestione account collegati (collega/scollega Google/Apple)
- [x] API `/api/auth/linked-accounts` — GET lista account, DELETE scollega (con protezione ultimo metodo)
- [x] API `/api/auth/change-password` — cambio/impostazione password (per utenti OAuth senza password)
- [x] Link "Impostazioni account" in Navbar (desktop dropdown + mobile menu)
- [x] Env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_ID`, `APPLE_SECRET`

#### 10. Certificazioni e verifiche ✅ completato
**Stato:** ✅ Sistema completo di certificazioni, upload documenti, review e profile completion
- [x] API `/api/certifications` — CRUD unificato: landlord request, tenant submit, landlord review (VERIFIED/REJECTED)
- [x] Auto-update flags: ID_DOCUMENT → user.verified, EMPLOYMENT_CONTRACT → employmentVerified, INCOME_PROOF → incomeVerified
- [x] Upload documenti via `/api/upload` integrato nell'upload candidature
- [x] API `/api/profile/completion` — calcolo % completamento profilo + badges + verifications
- [x] Pagina `/certificazioni` — gestione completa con role toggle (inquilino/proprietario)
  - Inquilino: vede richieste, carica documenti, vede stato (PENDING/SUBMITTED/VERIFIED/REJECTED)
  - Proprietario: vede documenti sottomessi, approva/rifiuta con nota
- [x] Barra completamento profilo nella pagina `/profilo/inquilino` con % + verification badges
- [x] Badge "Profilo verificato" già presente su TenantProfileCard (BadgeCheck per user.verified)
- [x] Link a Certificazioni + Impostazioni account in Navbar (desktop dropdown + mobile menu)

#### 11. Reviews
**Stato:** modello Prisma esiste, zero API/UI.
- [ ] API CRUD reviews (solo dopo booking COMPLETED)
- [ ] Media voto su listing card
- [ ] Vista reviews nel dettaglio stanza
- [ ] Moderazione (flag + hide)

#### 12. SEO completo
**Stato:** metadata statica generica.
- [ ] Metadata dinamica per ogni pagina stanza (title, description, OG image)
- [ ] JSON-LD `RentalPosting` schema per Google
- [ ] `sitemap.xml` dinamica (tutte le stanze attive)
- [ ] `robots.txt`
- [ ] URL SEO-friendly: `/stanza/milano-zona-navigli-singola-500eur-clxyz` invece di `/stanza/clxyz`
- [ ] Landing page per città (es. `/stanze-milano`, `/stanze-roma`) con statistiche e annunci

#### 13. Admin panel
**Stato:** non esiste.
- [ ] Ruolo ADMIN su utente
- [ ] Dashboard: annunci pubblicati, utenti registrati, interessi, booking, feedback
- [ ] Moderazione annunci (flag, rimozione)
- [ ] Lettura feedback con filtri
- [ ] Gestione utenti (blocco, verifica manuale)
- [ ] Metriche: conversione pubblicazione, tasso matching, tempo medio affitto

---

### 🟢 P2 — Differenziazione e crescita

#### 14. Pagamenti e monetizzazione
- [ ] Strategia di pricing (chi paga? proprietario, inquilino, entrambi?)
- [ ] Opzioni possibili:
  - **Freemium proprietario**: pubblica gratis, paga per visibilità premium / più interessi attivi
  - **Fee per transazione**: % sulla prima mensilità (stile HousingAnywhere)
  - **Abbonamento proprietario**: gestisci N annunci per €X/mese
- [ ] Integrazione Stripe (pagamenti, subscription, invoice)
- [ ] Deposito cauzionale gestito tramite piattaforma (escrow)

#### 15. App mobile completa
- [ ] Parità funzionale con web: mappa, filtri, immagini reali, profilo editabile
- [ ] Fix critico: auth mobile (Bearer token) ≠ auth web (NextAuth session) → creare endpoint `/api/auth/token` dedicato
- [ ] Booking con API reale (non mock)
- [ ] Favorites con API reale
- [ ] Push notifications (Expo Notifications)
- [ ] Deep linking per condivisione annunci

#### 16. Ricerca avanzata
- [ ] Ricerca per raggio: pin su mappa + slider km
- [ ] Ricerca per quartiere con confini reali (GeoJSON)
- [ ] Filtro per distanza da punto di interesse (università, ufficio)
- [ ] Filtro per tempo di percorrenza (30 min in metro da X)
- [ ] Previsione disponibilità futura (ML su storico annunci)

#### 17. Onboarding e retention
- [ ] Tutorial interattivo primo accesso (proprietario + inquilino)
- [ ] Checklist profilo con barra di completamento
- [ ] Email drip campaign (post-registrazione, annuncio non completato, wish senza match)
- [ ] NPS survey dopo affitto concluso
- [ ] Referral program: invita amico → bonus visibilità

#### 18. Accessibilità (a11y)
- [ ] ARIA landmarks e ruoli
- [ ] Skip-to-content
- [ ] Focus management su navigazione
- [ ] Keyboard navigation completa
- [ ] Contrasto colori WCAG AA
- [ ] Screen reader testing

#### 19. Performance e infrastruttura
- [ ] Caching (HTTP headers, ISR per listing, Redis per sessioni)
- [ ] Image optimization con `next/image` + CDN
- [ ] Database indexing audit
- [ ] Error monitoring (Sentry)
- [ ] Structured logging (Pino / Winston)
- [ ] Health check endpoint

#### 20. Testing e CI/CD
- [ ] Unit test: schemas, utils, scoring engine
- [ ] Integration test: API routes principali
- [ ] E2E test: flow pubblicazione, flow interesse, flow booking
- [ ] GitHub Actions: lint, type-check, test, build
- [ ] Preview deploy per PR (Vercel)
- [ ] Database migration tracking (Prisma migrate)

#### 21. Internazionalizzazione (futuro)
- [ ] Framework i18n (next-intl)
- [ ] Traduzione IT → EN → ES → DE
- [ ] Valuta locale
- [ ] Date format locale

---

## Metriche di successo

| Metrica | Target lancio | Target 6 mesi |
|---|---|---|
| Annunci attivi | 500 | 5.000 |
| Utenti registrati | 2.000 | 20.000 |
| Tasso conversione interesse → visita | 40% | 55% |
| Tasso conversione visita → affitto | 25% | 35% |
| Tempo medio da pubblicazione a affitto | 30 giorni | 15 giorni |
| NPS | > 30 | > 50 |
| Wish → match rate | 20% | 40% |

---

## Stack tecnico attuale

| Layer | Tecnologia | Note |
|---|---|---|
| Web | Next.js 14.2, React 18.3, Tailwind 3.4 | App Router, SSR |
| Mobile | Expo 51, React Native 0.74, Expo Router 3.5 | Struttura OK, funzionalità parziale |
| Database | PostgreSQL + Prisma ORM | 20+ modelli, 679 righe schema, 16 enum |
| Auth | NextAuth 4.24, JWT, bcryptjs | Funzionante web, mobile disallineato |
| Shared | Zod, TypeScript | Schemas, types, utils condivisi |
| Maps | Leaflet + Overpass API | Solo web |

---

*Ultimo aggiornamento: 27 febbraio 2026*
