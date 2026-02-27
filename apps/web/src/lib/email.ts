import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'rooMate <noreply@roomate.it>';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ==================== Types ====================

export type EmailType =
  | 'VERIFY_EMAIL'
  | 'PASSWORD_RESET'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'INTEREST_RECEIVED'
  | 'INTEREST_APPROVED'
  | 'WISH_MATCHED'
  | 'LISTING_EXPIRING'
  | 'LISTING_EXPIRED'
  | 'WELCOME';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ==================== Core Send Function ====================

async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  try {
    // In development, just log
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
      console.log(`[EMAIL DEV] Body preview: ${html.substring(0, 200)}...`);
      return true;
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || htmlToPlainText(html),
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to send email:', err);
    return false;
  }
}

// ==================== Email Templates ====================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: 700; color: #2563eb; margin-bottom: 24px; }
    .logo span { color: #1e293b; }
    h1 { font-size: 20px; color: #1e293b; margin: 0 0 16px 0; }
    p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .btn:hover { background: #1d4ed8; }
    .footer { text-align: center; padding: 24px 16px; font-size: 13px; color: #94a3b8; }
    .highlight { background: #f0f9ff; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight strong { color: #1e293b; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { color: #1e293b; font-weight: 500; font-size: 14px; }
    .muted { color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">roo<span>Mate</span></div>
      ${content}
    </div>
    <div class="footer">
      <p>rooMate — La piattaforma per affittare stanze in Italia</p>
      <p class="muted">Hai ricevuto questa email perché sei registrato su rooMate. Se non hai richiesto tu questa email, puoi ignorarla.</p>
    </div>
  </div>
</body>
</html>`;
}

// ==================== Public Email Functions ====================

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: 'Verifica il tuo account rooMate',
    html: baseTemplate(`
      <h1>Ciao ${name}! 👋</h1>
      <p>Benvenuto su rooMate! Per completare la registrazione, verifica il tuo indirizzo email cliccando il pulsante qui sotto.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${verifyUrl}" class="btn">Verifica email</a>
      </p>
      <p class="muted">Il link scade tra 24 ore. Se non hai creato un account su rooMate, ignora questa email.</p>
      <p class="muted" style="word-break: break-all;">Link diretto: ${verifyUrl}</p>
    `),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/login?reset=${token}`;

  return sendEmail({
    to,
    subject: 'Reimposta la tua password — rooMate',
    html: baseTemplate(`
      <h1>Reimposta password</h1>
      <p>Ciao ${name}, hai richiesto di reimpostare la password del tuo account rooMate.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" class="btn">Reimposta password</a>
      </p>
      <p class="muted">Il link scade tra 1 ora. Se non hai richiesto il reset, ignora questa email — la tua password non verrà modificata.</p>
    `),
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Benvenuto su rooMate! 🏠',
    html: baseTemplate(`
      <h1>Benvenuto su rooMate, ${name}! 🎉</h1>
      <p>Siamo felici di averti a bordo. rooMate è la piattaforma pensata per rendere l'affitto di stanze semplice, trasparente e sicuro.</p>
      <div class="highlight">
        <strong>Cosa puoi fare?</strong>
        <p style="margin: 8px 0 0 0;">🔍 Cerca stanze con filtri avanzati e mappa<br>
        📋 Pubblica il tuo annuncio in pochi minuti<br>
        👥 Crea un gruppo per cercare casa insieme<br>
        ❤️ Salva le tue ricerche e ricevi notifiche</p>
      </div>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/cerca" class="btn">Inizia a cercare</a>
      </p>
    `),
  });
}

export async function sendBookingConfirmedEmail(
  to: string,
  name: string,
  listingTitle: string,
  date: string,
  time: string,
  visitType: string
): Promise<boolean> {
  const typeLabel = visitType === 'VIRTUAL' ? '💻 Visita virtuale' : visitType === 'OPENDAY' ? '🏠 Open Day' : '🏠 Visita';

  return sendEmail({
    to,
    subject: `Visita confermata: ${listingTitle}`,
    html: baseTemplate(`
      <h1>Visita confermata! ✅</h1>
      <p>La tua visita è stata confermata. Ecco i dettagli:</p>
      <div class="highlight">
        <strong>${listingTitle}</strong>
        <p style="margin: 8px 0 0 0;">
          📅 ${date}<br>
          🕐 ${time}<br>
          ${typeLabel}
        </p>
      </div>
      <p>Ricorda di presentarti puntuale. In caso di impossibilità, cancella la prenotazione con almeno 24 ore di anticipo per evitare penalità.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/appuntamenti" class="btn">I tuoi appuntamenti</a>
      </p>
    `),
  });
}

export async function sendBookingCancelledEmail(
  to: string,
  name: string,
  listingTitle: string,
  date: string,
  reason?: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Visita cancellata: ${listingTitle}`,
    html: baseTemplate(`
      <h1>Visita cancellata</h1>
      <p>Ciao ${name}, la visita per <strong>${listingTitle}</strong> prevista il ${date} è stata cancellata.</p>
      ${reason ? `<div class="highlight"><strong>Motivo:</strong> ${reason}</div>` : ''}
      <p>Puoi cercare altre stanze o riprogrammare una visita.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/cerca" class="btn">Cerca stanze</a>
      </p>
    `),
  });
}

export async function sendInterestReceivedEmail(
  to: string,
  landlordName: string,
  tenantName: string,
  listingTitle: string,
  position: number
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Nuovo interesse per "${listingTitle}"`,
    html: baseTemplate(`
      <h1>Nuovo candidato interessato! 🎯</h1>
      <p>Ciao ${landlordName}, <strong>${tenantName}</strong> ha espresso interesse per il tuo annuncio:</p>
      <div class="highlight">
        <strong>${listingTitle}</strong>
        <p style="margin: 8px 0 0 0;">Posizione in coda: #${position}</p>
      </div>
      <p>Accedi alla dashboard per visualizzare il profilo del candidato, le sue certificazioni e gestire la coda.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/i-miei-annunci" class="btn">Gestisci interessi</a>
      </p>
    `),
  });
}

export async function sendInterestApprovedEmail(
  to: string,
  tenantName: string,
  listingTitle: string,
  listingId: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Il tuo interesse è stato approvato — ${listingTitle}`,
    html: baseTemplate(`
      <h1>Buone notizie, ${tenantName}! 🎉</h1>
      <p>Il proprietario ha approvato il tuo interesse per:</p>
      <div class="highlight">
        <strong>${listingTitle}</strong>
        <p style="margin: 8px 0 0 0;">Ora puoi prenotare una visita!</p>
      </div>
      <p>Accedi alla pagina dell'annuncio per scegliere uno slot di visita disponibile.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/stanza/${listingId}" class="btn">Prenota visita</a>
      </p>
    `),
  });
}

export async function sendWishMatchedEmail(
  to: string,
  name: string,
  wishName: string,
  listings: { id: string; title: string; price: number; city: string }[]
): Promise<boolean> {
  const listingsHtml = listings
    .map(
      (l) => `
      <div style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <strong>${l.title}</strong><br>
        <span style="color: #64748b;">📍 ${l.city} — €${l.price}/mese</span><br>
        <a href="${APP_URL}/stanza/${l.id}" style="color: #2563eb; font-size: 14px;">Vedi annuncio →</a>
      </div>`
    )
    .join('');

  return sendEmail({
    to,
    subject: `🎯 Nuovi annunci per la tua ricerca "${wishName || 'Desiderata'}"`,
    html: baseTemplate(`
      <h1>Match trovato! 🎯</h1>
      <p>Ciao ${name}, abbiamo trovato ${listings.length === 1 ? 'un nuovo annuncio' : `${listings.length} nuovi annunci`} che corrispondono alla tua ricerca salvata <strong>"${wishName || 'Desiderata'}"</strong>.</p>
      ${listingsHtml}
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/mi-interessa" class="btn">Vedi tutti i match</a>
      </p>
      <p class="muted">Per modificare le tue preferenze di ricerca o disattivare le notifiche, vai su "Le mie desiderate" nel tuo profilo.</p>
    `),
  });
}

export async function sendListingExpiringEmail(
  to: string,
  name: string,
  listingTitle: string,
  listingId: string,
  daysLeft: number
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Il tuo annuncio scade tra ${daysLeft} giorni`,
    html: baseTemplate(`
      <h1>Il tuo annuncio sta per scadere ⏳</h1>
      <p>Ciao ${name}, il tuo annuncio <strong>"${listingTitle}"</strong> scadrà tra <strong>${daysLeft} giorni</strong>.</p>
      <p>Se la stanza è ancora disponibile, puoi rinnovarlo con un click per altri 30 giorni.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/i-miei-annunci" class="btn">Rinnova annuncio</a>
      </p>
      <p class="muted">Se la stanza è stata affittata, puoi archiviare l'annuncio dalla dashboard.</p>
    `),
  });
}

export async function sendListingExpiredEmail(
  to: string,
  name: string,
  listingTitle: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Il tuo annuncio è scaduto — ${listingTitle}`,
    html: baseTemplate(`
      <h1>Annuncio scaduto</h1>
      <p>Ciao ${name}, il tuo annuncio <strong>"${listingTitle}"</strong> è scaduto ed è stato rimosso dalla ricerca.</p>
      <p>Puoi rinnovarlo dalla dashboard se la stanza è ancora disponibile.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${APP_URL}/i-miei-annunci" class="btn">Rinnova annuncio</a>
      </p>
    `),
  });
}

// ==================== Utility ====================

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
