import webpush from 'web-push';
import { prisma } from '@roommate/database';

// ==================== VAPID Configuration ====================

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@roomate.it';

// Configure web-push with VAPID keys
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ==================== Types ====================

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string; // Click action URL
  tag?: string; // Notification tag (for grouping/replacing)
  data?: Record<string, unknown>;
}

export type NotificationType =
  | 'NEW_MESSAGE'
  | 'INTEREST_RECEIVED'
  | 'INTEREST_APPROVED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'WISH_MATCHED'
  | 'LISTING_EXPIRING'
  | 'LISTING_EXPIRED'
  | 'GROUP_INVITE';

// ==================== VAPID Key Generation ====================

/**
 * Generate a new VAPID key pair. Run once and store in .env
 * Usage: node -e "require('./push').generateVapidKeys()"
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  const keys = webpush.generateVAPIDKeys();
  console.log('VAPID Keys generated:');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
  return keys;
}

// ==================== Send Push Notification ====================

/**
 * Send push notification to a specific subscription
 */
async function sendToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log('[PUSH DEV] Would send:', payload.title, '-', payload.body);
    return true;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1 hour
        urgency: 'normal',
      }
    );
    return true;
  } catch (error: any) {
    // 410 Gone or 404 Not Found = subscription expired
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[PUSH] Subscription expired, removing:', subscription.endpoint);
      await removeExpiredSubscription(subscription.endpoint);
      return false;
    }
    console.error('[PUSH ERROR]', error.message || error);
    return false;
  }
}

/**
 * Remove an expired/invalid subscription from the database
 */
async function removeExpiredSubscription(endpoint: string): Promise<void> {
  try {
    await (prisma as any).pushSubscription.delete({
      where: { endpoint },
    });
  } catch {
    // Ignore if already deleted
  }
}

// ==================== Send to User ====================

/**
 * Send push notification to all devices of a user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await (prisma as any).pushSubscription.findMany({
    where: { userId },
    select: {
      endpoint: true,
      p256dh: true,
      auth: true,
      expoPushToken: true,
      platform: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    // Web push
    if (sub.endpoint && sub.p256dh && sub.auth) {
      const success = await sendToSubscription(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      if (success) sent++;
      else failed++;
    }

    // Expo push (for mobile)
    if (sub.expoPushToken && sub.platform !== 'web') {
      const success = await sendExpoPush(sub.expoPushToken, payload);
      if (success) sent++;
      else failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<{ totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, payload);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { totalSent, totalFailed };
}

// ==================== Expo Push (Mobile) ====================

/**
 * Send push notification via Expo Push API
 */
async function sendExpoPush(
  expoPushToken: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: payload.title,
        body: payload.body,
        data: {
          url: payload.url,
          ...payload.data,
        },
        sound: 'default',
        badge: 1,
        channelId: 'default',
      }),
    });

    const result = await response.json();

    if (result.data?.status === 'error') {
      console.error('[EXPO PUSH ERROR]', result.data.message);
      // Device not registered anymore
      if (result.data.details?.error === 'DeviceNotRegistered') {
        await (prisma as any).pushSubscription.deleteMany({
          where: { expoPushToken },
        });
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('[EXPO PUSH ERROR]', error);
    return false;
  }
}

// ==================== Subscription Management ====================

/**
 * Register a new push subscription for a user
 */
export async function registerSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  meta?: { userAgent?: string; platform?: string }
): Promise<void> {
  await (prisma as any).pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: meta?.userAgent,
      platform: meta?.platform || 'web',
      updatedAt: new Date(),
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: meta?.userAgent,
      platform: meta?.platform || 'web',
    },
  });
}

/**
 * Register an Expo push token for mobile
 */
export async function registerExpoToken(
  userId: string,
  expoPushToken: string,
  platform: 'android' | 'ios'
): Promise<void> {
  // Use expoPushToken as a pseudo-endpoint for uniqueness
  const endpoint = `expo:${expoPushToken}`;

  await (prisma as any).pushSubscription.upsert({
    where: { endpoint },
    update: {
      userId,
      expoPushToken,
      platform,
      updatedAt: new Date(),
    },
    create: {
      userId,
      endpoint,
      p256dh: '', // Not used for Expo
      auth: '',   // Not used for Expo
      expoPushToken,
      platform,
    },
  });
}

/**
 * Remove a push subscription
 */
export async function removeSubscription(endpoint: string): Promise<void> {
  await (prisma as any).pushSubscription.delete({
    where: { endpoint },
  }).catch(() => {
    // Ignore if not found
  });
}

/**
 * Get public VAPID key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

// ==================== Quiet Hours Check ====================

/**
 * Check if a user is currently in quiet hours
 */
export async function isInQuietHours(userId: string): Promise<boolean> {
  const prefs = await (prisma as any).notificationPreference.findUnique({
    where: { userId },
    select: {
      quietHoursEnabled: true,
      quietHoursStart: true,
      quietHoursEnd: true,
    },
  });

  if (!prefs?.quietHoursEnabled || !prefs.quietHoursStart || !prefs.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
  const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
