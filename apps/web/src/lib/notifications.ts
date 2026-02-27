import { prisma } from '@roommate/database';
import {
  sendPushToUser,
  isInQuietHours,
  type PushPayload,
  type NotificationType,
} from './push';
import {
  sendBookingConfirmedEmail,
  sendBookingCancelledEmail,
  sendInterestReceivedEmail,
  sendInterestApprovedEmail,
  sendWishMatchedEmail,
  sendListingExpiringEmail,
  sendListingExpiredEmail,
} from './email';

// ==================== Types ====================

interface NotifyOptions {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  /** Skip preference check (for critical notifications) */
  force?: boolean;
}

interface NotifyResult {
  emailSent: boolean;
  pushSent: number;
  pushFailed: number;
  skipped: boolean;
  reason?: string;
}

// ==================== Preference Mapping ====================

const TYPE_TO_PREF_FIELD: Record<NotificationType, string> = {
  NEW_MESSAGE: 'newMessage',
  INTEREST_RECEIVED: 'interestReceived',
  INTEREST_APPROVED: 'interestApproved',
  BOOKING_CONFIRMED: 'bookingConfirmed',
  BOOKING_CANCELLED: 'bookingCancelled',
  WISH_MATCHED: 'wishMatched',
  LISTING_EXPIRING: 'listingExpiring',
  LISTING_EXPIRED: 'listingExpired',
  GROUP_INVITE: 'groupInvite',
};

// ==================== Get User Preferences ====================

async function getUserPreferences(userId: string): Promise<{
  emailEnabled: boolean;
  pushEnabled: boolean;
  typeEnabled: boolean;
  quietHours: boolean;
} | null> {
  // Get or create default preferences
  let prefs = await (prisma as any).notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    // Use defaults — all enabled
    return {
      emailEnabled: true,
      pushEnabled: true,
      typeEnabled: true,
      quietHours: false,
    };
  }

  return {
    emailEnabled: prefs.emailEnabled,
    pushEnabled: prefs.pushEnabled,
    typeEnabled: true, // Will be checked per-type below
    quietHours: prefs.quietHoursEnabled || false,
  };
}

async function isTypeEnabled(userId: string, type: NotificationType): Promise<boolean> {
  const field = TYPE_TO_PREF_FIELD[type];
  if (!field) return true;

  const prefs = await (prisma as any).notificationPreference.findUnique({
    where: { userId },
    select: { [field]: true },
  });

  // Default to enabled if no preferences set
  if (!prefs) return true;
  return prefs[field] !== false;
}

// ==================== Main Notification Dispatcher ====================

/**
 * Send a notification to a user via email + push, respecting their preferences.
 * This is the single entry point for all notifications.
 */
export async function notify(options: NotifyOptions): Promise<NotifyResult> {
  const { userId, type, data, force } = options;

  const result: NotifyResult = {
    emailSent: false,
    pushSent: 0,
    pushFailed: 0,
    skipped: false,
  };

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    result.skipped = true;
    result.reason = 'User not found';
    return result;
  }

  // Check if notification type is enabled for this user
  if (!force) {
    const typeEnabled = await isTypeEnabled(userId, type);
    if (!typeEnabled) {
      result.skipped = true;
      result.reason = `Notification type ${type} disabled by user`;
      return result;
    }
  }

  // Check quiet hours (push only — emails always go through)
  const quietHours = !force && await isInQuietHours(userId);

  // Get channel preferences
  const prefs = await getUserPreferences(userId);

  // === Send Email ===
  if (prefs?.emailEnabled || force) {
    try {
      result.emailSent = await sendEmailForType(type, user.email, user.name, data);
    } catch (error) {
      console.error(`[NOTIFY] Email failed for ${type}:`, error);
    }
  }

  // === Send Push ===
  if ((prefs?.pushEnabled || force) && !quietHours) {
    try {
      const payload = buildPushPayload(type, data);
      if (payload) {
        const pushResult = await sendPushToUser(userId, payload);
        result.pushSent = pushResult.sent;
        result.pushFailed = pushResult.failed;
      }
    } catch (error) {
      console.error(`[NOTIFY] Push failed for ${type}:`, error);
    }
  } else if (quietHours) {
    result.reason = 'Push skipped: quiet hours';
  }

  return result;
}

/**
 * Send notification to multiple users
 */
export async function notifyMany(
  userIds: string[],
  type: NotificationType,
  data: Record<string, any>,
  force?: boolean
): Promise<NotifyResult[]> {
  const results: NotifyResult[] = [];
  for (const userId of userIds) {
    const result = await notify({ userId, type, data, force });
    results.push(result);
  }
  return results;
}

// ==================== Email Dispatch ====================

async function sendEmailForType(
  type: NotificationType,
  email: string,
  name: string,
  data: Record<string, any>
): Promise<boolean> {
  switch (type) {
    case 'BOOKING_CONFIRMED':
      return sendBookingConfirmedEmail(
        email,
        name,
        data.listingTitle,
        data.date,
        data.time,
        data.visitType
      );

    case 'BOOKING_CANCELLED':
      return sendBookingCancelledEmail(
        email,
        name,
        data.listingTitle,
        data.date,
        data.reason
      );

    case 'INTEREST_RECEIVED':
      return sendInterestReceivedEmail(
        email,
        name,
        data.tenantName,
        data.listingTitle,
        data.position
      );

    case 'INTEREST_APPROVED':
      return sendInterestApprovedEmail(
        email,
        name,
        data.listingTitle,
        data.listingId
      );

    case 'WISH_MATCHED':
      return sendWishMatchedEmail(
        email,
        name,
        data.wishName,
        data.listings
      );

    case 'LISTING_EXPIRING':
      return sendListingExpiringEmail(
        email,
        name,
        data.listingTitle,
        data.listingId,
        data.daysLeft
      );

    case 'LISTING_EXPIRED':
      return sendListingExpiredEmail(
        email,
        name,
        data.listingTitle
      );

    case 'NEW_MESSAGE':
      // Messages don't send individual emails — handled by chat UI
      // Could add email digest for offline users in the future
      return false;

    case 'GROUP_INVITE':
      // Could add group invite email in the future
      return false;

    default:
      return false;
  }
}

// ==================== Push Payload Builder ====================

function buildPushPayload(
  type: NotificationType,
  data: Record<string, any>
): PushPayload | null {
  const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const icon = '/icons/icon-192x192.png';
  const badge = '/icons/badge-72x72.png';

  switch (type) {
    case 'NEW_MESSAGE':
      return {
        title: data.senderName || 'Nuovo messaggio',
        body: data.messagePreview || 'Hai ricevuto un nuovo messaggio',
        icon,
        badge,
        url: `${APP_URL}/messaggi`,
        tag: `message-${data.conversationId}`,
        data: { type, conversationId: data.conversationId },
      };

    case 'INTEREST_RECEIVED':
      return {
        title: 'Nuovo candidato interessato! 🎯',
        body: `${data.tenantName} è interessato a "${data.listingTitle}"`,
        icon,
        badge,
        url: `${APP_URL}/i-miei-annunci`,
        tag: `interest-${data.listingId}`,
        data: { type, listingId: data.listingId },
      };

    case 'INTEREST_APPROVED':
      return {
        title: 'Interesse approvato! 🎉',
        body: `Il proprietario ha approvato il tuo interesse per "${data.listingTitle}"`,
        icon,
        badge,
        url: `${APP_URL}/stanza/${data.listingId}`,
        tag: `interest-approved-${data.listingId}`,
        data: { type, listingId: data.listingId },
      };

    case 'BOOKING_CONFIRMED':
      return {
        title: 'Visita confermata! ✅',
        body: `${data.listingTitle} — ${data.date} alle ${data.time}`,
        icon,
        badge,
        url: `${APP_URL}/appuntamenti`,
        tag: `booking-${data.bookingId}`,
        data: { type, bookingId: data.bookingId },
      };

    case 'BOOKING_CANCELLED':
      return {
        title: 'Visita cancellata',
        body: `La visita per "${data.listingTitle}" è stata cancellata`,
        icon,
        badge,
        url: `${APP_URL}/appuntamenti`,
        tag: `booking-cancel-${data.bookingId}`,
        data: { type, bookingId: data.bookingId },
      };

    case 'WISH_MATCHED':
      return {
        title: 'Match trovato! 🎯',
        body: `${data.count || 1} ${data.count === 1 ? 'annuncio corrisponde' : 'annunci corrispondono'} alla tua ricerca "${data.wishName}"`,
        icon,
        badge,
        url: `${APP_URL}/mi-interessa`,
        tag: `wish-${data.wishId}`,
        data: { type, wishId: data.wishId },
      };

    case 'LISTING_EXPIRING':
      return {
        title: 'Annuncio in scadenza ⏳',
        body: `"${data.listingTitle}" scade tra ${data.daysLeft} giorni`,
        icon,
        badge,
        url: `${APP_URL}/i-miei-annunci`,
        tag: `listing-expiring-${data.listingId}`,
        data: { type, listingId: data.listingId },
      };

    case 'LISTING_EXPIRED':
      return {
        title: 'Annuncio scaduto',
        body: `"${data.listingTitle}" è stato rimosso dalla ricerca`,
        icon,
        badge,
        url: `${APP_URL}/i-miei-annunci`,
        tag: `listing-expired-${data.listingId}`,
        data: { type, listingId: data.listingId },
      };

    case 'GROUP_INVITE':
      return {
        title: 'Invito a un gruppo 👥',
        body: `Sei stato invitato nel gruppo "${data.groupName}"`,
        icon,
        badge,
        url: `${APP_URL}/gruppi/${data.groupId}`,
        tag: `group-invite-${data.groupId}`,
        data: { type, groupId: data.groupId },
      };

    default:
      return null;
  }
}

// ==================== Convenience Functions ====================

/**
 * Shortcut: notify about a new message
 */
export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<NotifyResult> {
  return notify({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    data: { senderName, messagePreview, conversationId },
  });
}

/**
 * Shortcut: notify landlord about new interest
 */
export async function notifyInterestReceived(
  landlordId: string,
  tenantName: string,
  listingTitle: string,
  listingId: string,
  position: number
): Promise<NotifyResult> {
  return notify({
    userId: landlordId,
    type: 'INTEREST_RECEIVED',
    data: { tenantName, listingTitle, listingId, position },
  });
}

/**
 * Shortcut: notify tenant about approved interest
 */
export async function notifyInterestApproved(
  tenantId: string,
  listingTitle: string,
  listingId: string
): Promise<NotifyResult> {
  return notify({
    userId: tenantId,
    type: 'INTEREST_APPROVED',
    data: { listingTitle, listingId },
  });
}

/**
 * Shortcut: notify about confirmed booking
 */
export async function notifyBookingConfirmed(
  tenantId: string,
  listingTitle: string,
  date: string,
  time: string,
  visitType: string,
  bookingId: string
): Promise<NotifyResult> {
  return notify({
    userId: tenantId,
    type: 'BOOKING_CONFIRMED',
    data: { listingTitle, date, time, visitType, bookingId },
  });
}

/**
 * Shortcut: notify about cancelled booking
 */
export async function notifyBookingCancelled(
  userId: string,
  listingTitle: string,
  date: string,
  reason: string | undefined,
  bookingId: string
): Promise<NotifyResult> {
  return notify({
    userId,
    type: 'BOOKING_CANCELLED',
    data: { listingTitle, date, reason, bookingId },
  });
}

/**
 * Shortcut: notify about wish match
 */
export async function notifyWishMatched(
  userId: string,
  wishName: string,
  wishId: string,
  listings: { id: string; title: string; price: number; city: string }[]
): Promise<NotifyResult> {
  return notify({
    userId,
    type: 'WISH_MATCHED',
    data: { wishName, wishId, listings, count: listings.length },
  });
}
