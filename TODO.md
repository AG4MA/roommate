# rooMate – Cose ancora da fare

## Backlog futuro

### Cerca Stanza
- [ ] Previsione disponibilità futura: sapere quando una stanza si sta per liberare e notificare l'utente
- [ ] Distanze personalizzate per ogni listing rispetto ai luoghi preferiti dell'utente (integrazione server-side con API di routing)

### Affitta Stanza
- [ ] Social login (Google / Microsoft) per registrazione veloce
- [ ] Pagina FAQ dedicata per proprietari
- [ ] Video tutorial per proprietari

### Smart Matching (backend)
- [ ] Nascondere annunci a utenti non in linea con le preferenze del proprietario (server-side filtering)
- [ ] Notifiche push/email quando un candidato compatibile si interessa

### Coda Appuntamenti (backend)
- [ ] Persistenza della coda su DB (attualmente solo UI demo)
- [ ] Logica di sblocco automatico dei prossimi 4 candidati quando i precedenti vengono gestiti
- [ ] Notifiche real-time (WebSocket / SSE) al proprietario quando qualcuno entra in coda
- [ ] Richiesta dati personali aggiuntivi al candidato (upload documenti, referenze)




questa tipologia di filtri non èè cio hche ho chiesto, ho detto filtri che sono INLINE e che scorrendo li vedi ie li puoi modificare clicandoci sopra, cosi non va nno bene

tutto lo stile css deve stare negli appositti posti, devi implementare come se fossi un senior dev non un junior. deve stare no nnelle classi ma nei file css corretti

i filtri non scorrono mostrandosi tutti e se ci clichci sopra non ti escono le opzioni per ogni filtro.

volgio ribaltare la stituazione. Una stanza abbiamo etto ha max 3 romm seeker in attesa. la queue puo scendere nei seguenti modi.

hi ha messo l'annuncio vede la lista dei 3 interessati. ognuno di questi ha le sue caratteristiche in piu. il porprietario puo contattarli, o puo direttamente triggherare delle actions, tipo "certifica X o Y o Z" (se tu hai messo lavoratore, e sei lavoratore indeterminato lui puo fare certifica contratto di lavoro)
quindi lui ha questi 3, lui puo eliminare qualcuno. quando la lista è piena, l'annuncio non è più visibile a tutti, e in un stato specifico.
Se viene eliminata nuna persona, ritorna disponibile. le persone invece che cercano stanze, quando ne vedono una possono solo cliccare "mi interessa o salva annuncio"
mi interessa mette in queue, e poi sara il proprietario a determinare che cosa farne, mentre salva annuncio lo mette da parte, ma se cambia stato nei "annunci salvati" lo vedrai "il numero di interessati è al massimo, no disponibile per il momento"

il porpietario cosa puo fare con i 3 partecipanti? la prima cosa è che manda l'ok per la schedulazione, e quindi a loro compare il calendario dove inserirsi per la visita, altrimenti il proprietario puo proporre open day -> con un giorno e orario specifico e loro dovranno accettare se si presentano oppure no. Se accettano e non si presentano (al proprietario sara chiesto poi chi ha partecipato) verranno marchiati con "mancata presenza"
Se si arriva a 3 volte, l0utente viene bloccato per almeno 3 mesi.

e se il porprietario se ne frega e no dichiara? eh bella domanda, dobbiam ogestire quel caso, ma iniziamo con tutto il resto.