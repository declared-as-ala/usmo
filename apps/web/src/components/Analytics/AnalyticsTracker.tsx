'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api-client';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid double tracking exact same path in strict mode
    const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    // Get or initialize persistent Anonymous Visitor ID
    let visitorId = typeof window !== 'undefined' ? localStorage.getItem('usm_visitor_id') : null;
    if (!visitorId && typeof window !== 'undefined') {
      visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('usm_visitor_id', visitorId);
    }

    // Get or initialize Session ID (resets on browser session close)
    let sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('usm_session_id') : null;
    if (!sessionId && typeof window !== 'undefined') {
      sessionId = 's_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('usm_session_id', sessionId);
    }

    // Extract UTM parameters
    const utmSource = searchParams.get('utm_source') || undefined;
    const utmMedium = searchParams.get('utm_medium') || undefined;
    const utmCampaign = searchParams.get('utm_campaign') || undefined;
    const utmTerm = searchParams.get('utm_term') || undefined;
    const utmContent = searchParams.get('utm_content') || undefined;

    // Device detection
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) deviceType = 'tablet';
    else if (/Mobile|iPhone|Android/i.test(ua)) deviceType = 'mobile';

    // Browser detection
    let browser = 'Browser';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';

    // OS detection
    let operatingSystem = 'OS';
    if (ua.includes('Win')) operatingSystem = 'Windows';
    else if (ua.includes('Mac')) operatingSystem = 'macOS';
    else if (ua.includes('Android')) operatingSystem = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) operatingSystem = 'iOS';
    else if (ua.includes('Linux')) operatingSystem = 'Linux';

    // Detect event type based on route
    let eventType = 'page_view';
    if (pathname.startsWith('/boutique')) eventType = 'product_view';
    else if (pathname.startsWith('/actualites')) eventType = 'article_view';
    else if (pathname.startsWith('/media')) eventType = 'video_view';
    else if (pathname.startsWith('/football') || pathname.startsWith('/basketball')) eventType = 'player_view';
    else if (pathname.startsWith('/sponsors')) eventType = 'sponsor_click';

    const payload = {
      eventType,
      sessionId: sessionId || 'session',
      anonymousVisitorId: visitorId || undefined,
      path: pathname,
      pageTitle: typeof document !== 'undefined' ? document.title : pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      deviceType,
      browser,
      operatingSystem,
    };

    // Non-blocking beacon or async API call
    api.logAnalyticsEvent(payload).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
