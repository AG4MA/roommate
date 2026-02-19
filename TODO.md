# rooMate — TODO (SAL aggiornato)

## ✅ Completati

### 1. Cooldown 24h — popup ritiro interesse
- [x] Popup `handleWithdraw` avvisa: "Potrai esprimere nuovo interesse solo dopo 24 ore"
- [x] API DELETE: salva `removedAt` quando utente ritira interesse
- [x] API GET: calcola `cooldownUntil = removedAt + 24h` e lo restituisce al client
- [x] API POST: impedisce nuovo interesse se cooldown attivo (429)

### 2. AFFITTA STANZA — registrazione inline
- [x] Dopo type selection + flag → campi registrazione (nome, email, password) inline sotto i flag
- [x] Nessun redirect a /registrati; auto-login dopo submit, poi prosegui nel wizard
- [x] Se utente già loggato: saltare i campi registrazione, proseguire direttamente

### 3. Pagina /registrati — selezione tipo utente
- [x] Prima dei campi form, scegliere "Inquilino" o "Proprietario" (card con icone)
- [x] Supporto preselection via `?role=landlord`; proprietario rediretto a /pubblica dopo registrazione

### 4. Mappa — fermate mezzi pubblici
- [x] MiniMap (dettaglio stanza) mostra marker per bus, tram, treno, metro, bici
- [x] Fetch Overpass client-side quando mappa si apre, con dedup + ordinamento distanza
- [x] Emoji/colori diversi per tipo + legenda con conteggi

### 5. Feature — Deposito biciclette
- [x] `BICYCLE_PARKING` aggiunto a enum AmenityType (schema.prisma)
- [x] Query Overpass per `amenity=bicycle_parking` (overpass.ts)
- [x] Marker nella mappa MiniMap + LeafletMini

## 📋 Backlog futuro
- Ricerca città con quartieri o distanza da punto (pin + raggio km)
- Previsione disponibilità futura e notifica stanza libera
- Distanze personalizzate rispetto a luoghi preferiti
- Social login (Google/Microsoft)
- FAQ e video tutorial per proprietari
- Notifiche push/email quando candidato compatibile mostra interesse
- Dashboard admin per leggere feedback

