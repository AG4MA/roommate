'use client';

import { usePageDwell, useUserProfile } from '@/hooks/useAnalytics';

/** Drop this component anywhere to auto-track page dwell time and user profiling. */
export function AnalyticsTracker() {
  usePageDwell();
  useUserProfile();
  return null;
}
