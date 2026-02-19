'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// ---------------------------------------------------------------------------
// Client-side analytics with anonymous user profiling.
// Tracks page dwell-time, wizard step timing, and device/geo info.
// Data is stored in localStorage; can be pushed server-side later.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'roommate_analytics';
const PROFILE_KEY = 'roommate_user_profile';

// ---- User profile types ----

export interface UserProfile {
  anonId: string;          // persistent random ID for anonymous users
  email?: string;          // set when logged in
  ip?: string;             // fetched once from API
  geo?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  device: {
    userAgent: string;
    platform: string;
    language: string;
    screenW: number;
    screenH: number;
    mobile: boolean;
    touchPoints: number;
  };
  firstSeen: number;       // Date.now()
  lastSeen: number;
  sessionCount: number;
  geoConsent: boolean;      // user consented to geolocation
}

export interface PageEvent {
  path: string;
  enterTs: number;   // Date.now()
  dwellMs: number;   // time on page in ms
}

export interface ActionEvent {
  action: string;    // e.g. 'wizard_step_0', 'filter_change'
  durationMs: number;
  meta?: Record<string, string>;
}

interface AnalyticsStore {
  pages: PageEvent[];
  actions: ActionEvent[];
}

// ---- localStorage helpers ----

function getStore(): AnalyticsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AnalyticsStore;
  } catch { /* ignore */ }
  return { pages: [], actions: [] };
}

function saveStore(store: AnalyticsStore) {
  // Keep only last 200 events to avoid bloating storage
  store.pages = store.pages.slice(-200);
  store.actions = store.actions.slice(-200);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota exceeded – ignore */ }
}

// ---- Anonymous user profile helpers ----

function generateAnonId(): string {
  return 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch { /* ignore */ }

  // Create fresh profile
  const profile: UserProfile = {
    anonId: generateAnonId(),
    device: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? navigator.platform : '',
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      screenW: typeof screen !== 'undefined' ? screen.width : 0,
      screenH: typeof screen !== 'undefined' ? screen.height : 0,
      mobile: isMobile(),
      touchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
    },
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    sessionCount: 0,
    geoConsent: false,
  };
  saveUserProfile(profile);
  return profile;
}

export function saveUserProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

/** Set the logged-in user email on the profile */
export function setProfileEmail(email: string) {
  const p = getUserProfile();
  p.email = email;
  saveUserProfile(p);
}

/** Fetch the user's IP (once) from a free API */
async function fetchIp(): Promise<string | undefined> {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const json = await res.json();
    return json.ip as string;
  } catch {
    return undefined;
  }
}

/** Request geolocation (with consent) */
function requestGeo(): Promise<{ lat: number; lng: number } | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(undefined),
      { timeout: 5000, maximumAge: 600000 }
    );
  });
}

// ---- Hook: initialise / update user profile on mount ----

export function useUserProfile() {
  useEffect(() => {
    const profile = getUserProfile();
    profile.lastSeen = Date.now();
    profile.sessionCount += 1;
    // Refresh device info
    profile.device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenW: screen.width,
      screenH: screen.height,
      mobile: isMobile(),
      touchPoints: navigator.maxTouchPoints,
    };
    saveUserProfile(profile);

    // Fetch IP if not already known
    if (!profile.ip) {
      fetchIp().then((ip) => {
        if (ip) {
          const p = getUserProfile();
          p.ip = ip;
          saveUserProfile(p);
        }
      });
    }

    // Request geolocation if not asked yet (non-invasive: only once)
    if (!profile.geoConsent && !profile.geo) {
      requestGeo().then((geo) => {
        const p = getUserProfile();
        if (geo) {
          p.geo = { lat: geo.lat, lng: geo.lng };
          p.geoConsent = true;
        } else {
          p.geoConsent = true; // mark as asked even if denied
        }
        saveUserProfile(p);
      });
    }
  }, []);
}

// ---- Hook: auto-track page dwell time ----

export function usePageDwell() {
  const pathname = usePathname();
  const enterRef = useRef(Date.now());

  useEffect(() => {
    enterRef.current = Date.now();

    return () => {
      const dwellMs = Date.now() - enterRef.current;
      if (dwellMs < 300) return; // ignore sub-300ms bounces
      const store = getStore();
      store.pages.push({ path: pathname, enterTs: enterRef.current, dwellMs });
      saveStore(store);
    };
  }, [pathname]);
}

// ---- Hook: measure an arbitrary action duration ----

export function useActionTimer() {
  const startRef = useRef<number | null>(null);

  const start = useCallback(() => {
    startRef.current = Date.now();
  }, []);

  const stop = useCallback((action: string, meta?: Record<string, string>) => {
    if (startRef.current === null) return 0;
    const durationMs = Date.now() - startRef.current;
    startRef.current = null;
    const store = getStore();
    store.actions.push({ action, durationMs, meta });
    saveStore(store);
    return durationMs;
  }, []);

  return { start, stop };
}

// ---- Convenience: record a single instant action ----

export function trackAction(action: string, meta?: Record<string, string>) {
  const store = getStore();
  store.actions.push({ action, durationMs: 0, meta });
  saveStore(store);
}

// ---- Read analytics (for admin / debug) ----

export function getAnalytics(): AnalyticsStore & { profile: UserProfile } {
  return { ...getStore(), profile: getUserProfile() };
}

export function clearAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}
