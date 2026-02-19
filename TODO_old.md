Pubblicazione annuncio: da form macchinoso a wizard a card

L’inserimento annuncio deve diventare un percorso guidato, con card sequenziali. Ogni card ha pochi campi, suggerimenti pronti, validazione immediata e avanzamento veloce.

Regole del wizard:

Avanzi alla card successiva solo se la card corrente è completa.

È sempre possibile tornare indietro (stato “indietro”), senza perdere i dati già inseriti.

La card precedente ricompare e puoi modificare i valori, ma non puoi procedere avanti se la card corrente non rispetta i requisiti minimi.

Vincolo non negoziabile: non si può pubblicare e non si può completare il wizard senza foto.

Vincolo non negoziabile: niente annunci senza foto, in particolare la card “Foto” deve essere bloccante.

Esperienza UI desiderata:

Card ben distanziate, non “schiacciate”.

Contenuti suggeriti tramite chip/rectangles cliccabili, ad esempio suggerimenti di regole della casa, servizi inclusi, disponibilità, ecc.

Avanzamento rapido: dove possibile, selezioni singole fanno avanzare automaticamente.

Regole della casa e ore di silenzio

“Ore di silenzio” non è una sezione a parte: è una regola della casa.

In “Regole della casa” deve esserci:

Un’icona informativa o di suggerimento vicino al titolo “Regole della casa”.

Cliccando l’icona si apre un popup che:

spiega esempi di regole utili (silenzio, pulizie, ospiti, fumo, animali, ecc.)

consente di inviare feedback (“Suggerisci regole della casa”) così da raccogliere input reali dagli utenti/publisher.

“Ore di silenzio” deve essere una regola guidata, ad esempio con selezione fascia oraria e giorni, ma sempre dentro la sezione regole.

Campi e vincoli: correzioni puntuali
Preferenze e profilo

“Genere preferito”: non deve esistere l’opzione “Altro”. Solo le opzioni ammesse, senza fallback.

“Occupazione”: non usare “Freelancer”. Deve esserci “Indifferente” (se serve per filtrare o matching).

“Lingue parlate”: rimuovere, non è utile al flusso.

Quando scegli “genere” e “fascia d’età”, l’interazione deve portare avanti automaticamente (senza bottone “Avanti”), perché sono scelte discrete e rapide.

Coinquilini

Quando aggiungi un coinquilino, mancano vincoli e campi essenziali:

Occupazione coinquilino: selezione solo tra “Lavoratore” e “Studente”.

Sesso: campo mancante, va aggiunto.

Descrizione breve: consentita sotto la selezione (testo corto, limitato, funzionale).

Evitare liste infinite: pochi campi chiave, coerenti con l’obiettivo “rapido”.

Stanza e immobile

La piattaforma gestisce solo stanze singole. Stop alla scelta “tipo stanza”.

Mancano metadati fondamentali della casa:

numero totale stanze

numero bagni

stanze/ambienti speciali: lavanderia, salotto, cucina abitabile, balcone, ecc. (come selezioni a chip, non testo libero lungo)

Sezione “Affitto mensile”: va ripensata come tab separata

Questa parte non deve stare mescolata ad altro. Deve diventare una tab dedicata, con logica chiara e controllabile.

Modalità prezzo

L’utente (publisher) deve poter scegliere:

Prezzo unico mensile

con flag “All inclusive” selezionabile

anche se “All inclusive”, devono essere specificate le voci per trasparenza

Voci di costo da gestire

Le voci richieste:

luce e gas

riscaldamento

acqua

affitto senza costi (base)

spese condominiali

pulizia casa: specificare se inclusa o meno; se inclusa, indicare frequenza (quante volte a settimana) e durata (quante ore), e se riguarda aree comuni o tutta la casa

eventuali note su “spese incluse” e cosa significa concretamente

Comportamento UI consigliato:

Chip per includere/escludere voce

Se la voce è inclusa, mostra campi minimi richiesti

Se non inclusa, opzionale inserire stima o nota, ma non obbligatorio

Validazione immediata e riepilogo sintetico

Tab “Contratto”: separata e obbligatoria

Anche qui serve una tab autonoma, perché sono informazioni legali/logistiche che cambiano l’attrattiva dell’annuncio.

Campi richiesti:

tipo di contratto

data inizio

data fine (se applicabile)

durata massima e/o minima

possibilità di rinnovo (sì/no + condizioni sintetiche)

possibilità di residenza o domicilio (indicazioni distinte)

eventuale vincolo “solo fuori sede” (sì/no + breve spiegazione se sì)

Vincoli:

la tab contratto deve essere completata prima della pubblicazione

le date devono essere coerenti e validate

Ricerca stanza e UI risultati: correzioni
Risultati troppo “schiacciati”

Gli annunci risultano troppo vicini tra loro, impatto visivo negativo.

Serve spacing e gerarchia visiva (immagine, titolo, area, prezzo, badge essenziali).

Non devono apparire tutti “100% match”. Per ora la logica di match non deve fingere precisione totale, va rinviata.

Informazioni che non vanno mostrate

La sezione “chi cerchiamo” non deve comparire nel dettaglio annuncio per chi sta cercando, se la vede solo chi pubblica o in contesti di gestione interna. Se l’utente è “matchingato”, quell’informazione non serve e aumenta rumore.

Dettaglio annuncio: ordine e riduzione complessità

Quando seleziono una stanza, l’attuale pagina contiene troppa roba. Deve diventare lineare, con ordine stabile e con progressive disclosure.

Struttura richiesta:

Foto in alto (ok così)

Titolo

Via o zona

accanto deve esserci “Apri mappa”

cliccando “Apri mappa” la mappa si espande sotto (non navigazione esterna)

Recap essenziale (prezzo, disponibilità, caparra se prevista, regole chiave)

Descrizione

Caratteristiche casa e stanza (solo quelle davvero utili)

Inquilini (sezione utile, sintetica)

Elementi da rimuovere:

recap proprietario (nome, profilo, contatto): non deve essere visibile

qualsiasi affordance per contattare direttamente il proprietario: non consentita

CTA e comportamento:

Un solo bottone primario: “Mi interessa”

Al click su “Mi interessa” deve comparire un pannello che spiega cosa succede ora, in modo esplicito:

l’annuncio viene salvato

parte la procedura interna (matching o richiesta) con eventuali step successivi

Deve esserci anche la funzione “salva annuncio” se distinta, ma idealmente “Mi interessa” include il salvataggio, riducendo ambiguità.

Domanda di prodotto da formalizzare (ma puoi già impostare una regola):

Quanti “Mi interessa” contemporanei può avere un cercatore?

Ipotesi operativa: limite a 8 attivi per evitare spam e aumentare qualità, con messaggio chiaro se provi ad aggiungerne un nono.

Se imponi limite, devi anche definire cosa significa “attivo” e quando si libera (es. dopo rifiuto, dopo timeout, dopo scelta stanza).

Registrazione e flusso “pubblica”: eliminare scelte ridondanti

Problema: in registrazione compare “Sono un…” con due opzioni, ma poi esiste anche un flusso dove scegli tipo inserzionista. Devono convergere.

Flusso desiderato su /pubblica:

L’utente entra su http://localhost:3000/pubblica

In alto vede le tipologie (es. tipo inserzionista) come selezione iniziale

Dopo il click, non deve aprirsi una nuova schermata: la UI deve “collassare” la selezione verso l’alto e far comparire sotto i campi pertinenti

La selezione rimane visibile e modificabile: cambiando tipologia, i campi si aggiornano di conseguenza

Obiettivo: un unico flow coerente, zero duplicazioni, nessuna sensazione di “ricomincio da capo”

Sistema feedback: requisiti implementativi

Serve un sistema feedback semplice, sempre accessibile, che alimenti iterazione rapida del prodotto.

Requisiti:

Tasto globale visibile su tutte le pagine che apre popup di feedback

Form con:

testo libero

rating 1-5 stelle

Persistenza:

se utente loggato: salva userId e nome

se utente non loggato: salva IP o fingerprint anonimo

Tabella DB Feedback con campi:

message

rating

userId opzionale

ip o fingerprint opzionale

createdAt

API POST /api/feedback

Dashboard admin per leggere feedback come bonus

Nota di coerenza con “Regole della casa”:

Il popup “Suggerisci regole della casa” può usare lo stesso sistema feedback, magari con categoria precompilata (es. category = house_rules) per distinguere i messaggi.

Backlog futuro

Elementi futuri da mantenere separati dal core flow, per non appesantire l’MVP:

previsione disponibilità futura e notifica stanza libera

distanze personalizzate rispetto a luoghi preferiti

social login (Google/Microsoft)

FAQ e video tutorial per proprietari

notifiche push/email quando un candidato compatibile mostra interesse

Sintesi vincoli non negoziabili

Wizard a card, rapido, guidato, con validazione e step bloccanti.

Non si procede senza foto.

Ore di silenzio dentro “Regole della casa”, con popup suggerimenti e raccolta feedback.

Rimozione campi inutili (lingue) e correzione tassonomie (no “Altro” su genere, no “Freelancer”, usare “Indifferente”).

Solo stanze singole.

Tab dedicate per Affitto mensile e Contratto.

Dettaglio annuncio semplificato, niente contatto proprietario, CTA unica “Mi interessa” con spiegazione conseguenze.

/pubblica come flow unico senza schermate ridondanti, selezione tipo inserzionista in alto che collassa e mostra i campi sotto.


il porpiretario puo anche decidere di mostrare o mail o numero di telefono. quando nellinserimento è in quella sezione bisogna ricordargli che se è registrato l'app si occupera di eliminare il porblema di ricevere tantisime chiamte e di gestire il mioglior match

una latra cosa che manca e che il cerca stanze deve avere non prenotazioni, ma appuntamenti e i suoi "mi interessa" in alto se no come fa a vederli?


quando rimuovi il mi interessa, lo puoi solo re inserire dopo 24h non prima, e nel pop up questo viene segnalato# rooMate — TODO / SAL (Stato Avanzamento Lavori)

## ✅ Completati

- [x] **Wizard Step 1 auto-advance** — genere + età avanzano automaticamente (350ms debounce)
- [x] **Listing card spacing** — rounded-2xl, border, immagini più grandi, spacing 5
- [x] **Match scoring** — richiede 2+ filtri significativi, no più false 100%
- [x] **Dettaglio annuncio semplificato** — rimosso "Chi cerchiamo", merged quiet hours in regole, aggiunto MiniMap, rimosso BookingWidget/info proprietario
- [x] **MiniMap + LeafletMini** — componenti creati, CartoDB Positron tiles
- [x] **Registrazione role picker rimosso** — ruolo da URL param
- [x] **/pubblica inline type selection** — 3 fasi merge in 1 OnboardingSetup (tipo + dichiarazioni + azienda collassano)
- [x] **Feedback system** — Prisma Feedback model, POST /api/feedback, FeedbackButton globale in layout
- [x] **Registrati Suspense fix** — useSearchParams wrappato in Suspense

---

## 🔧 Da implementare

### Wizard Pubblica — Campi e correzioni

- [x] **Solo stanze singole** — rimuovere selettore tipo stanza, lock roomType a SINGLE
- [x] **Rimuovi "Altro" da genere** — solo Indifferente, Uomo, Donna
- [x] **Rimuovi "Freelancer" da occupazione** — sostituire con "Indifferente"
- [x] **Rimuovi "Lingue parlate"** — sezione intera eliminata da StepPreferences
- [x] **Coinquilini migliorati** — aggiungere campo sesso (Uomo/Donna), occupazione dropdown (Lavoratore/Studente), limitare bio

### Wizard Pubblica — Nuove sezioni

- [x] **Metadati casa** — numero stanze totali, numero bagni, aree speciali (chips: lavanderia, salotto, cucina abitabile, ecc.)
- [x] **Tab "Affitto mensile"** — tab dedicata con: prezzo base, flag all-inclusive, voci (luce/gas, riscaldamento, acqua, condominiali, pulizia casa con frequenza/durata), note spese
- [x] **Tab "Contratto"** — tab dedicata con: tipo contratto, data inizio/fine, durata min/max, rinnovo sì/no, residenza/domicilio, vincolo fuori sede
- [x] **Quiet hours come regola** — spostare in griglia regole come chip toggle con fascia oraria, aggiungere icona info con popup suggerimenti + link feedback
- [x] **Preferenza contatto publisher** — scelta email/telefono/app, hint su gestione match
- [x] **Foto obbligatorie** — bloccare pubblicazione senza foto, validazione bloccante su step Media

### Cerca stanza — UX

- [x] **Limite "Mi interessa"** — max ~8 attivi per cercatore, messaggio se prova il 9°
- [x] **Cooldown 24h su rimozione** — dopo rimozione "Mi interessa", reinserimento solo dopo 24h con popup informativo
- [ ] **Pagina cercatore** — mostrare "I miei interessi" e appuntamenti in alto nella pagina cerca *(UI pronta, necessita API backend)*

### Aggiornamenti schema e review

- [x] **Schema Prisma** — nuovi campi per house metadata, pricing breakdown, contract, roommate gender, interest removedAt
- [x] **StepReview aggiornato** — riflettere tutti i nuovi campi e le rimozioni

---


