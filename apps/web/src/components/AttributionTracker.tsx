'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

const COOKIE_FIRST  = 'em_attr_first';   // first-touch — never overwritten
const COOKIE_LAST   = 'em_attr_last';    // last-touch  — always updated
const COOKIE_DAYS   = 30;
const COOKIE_MAXAGE = COOKIE_DAYS * 24 * 60 * 60;

export interface Attribution {
  utm_source:   string;
  utm_medium:   string;
  utm_campaign: string;
  utm_content:  string;
  utm_term:     string;
  gclid:        string;   // Google Ads click ID
  fbclid:       string;   // Facebook Ads click ID
  ttclid:       string;   // TikTok Ads click ID
  referrer:     string;
  landing_page: string;
  ts:           number;   // unix timestamp ms
}

function detectSource(params: URLSearchParams, referrer: string): Pick<Attribution, 'utm_source' | 'utm_medium'> {
  // Explicit UTM params take priority
  if (params.get('utm_source')) {
    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
    };
  }
  // Google Ads — gclid present without utm
  if (params.get('gclid')) {
    return { utm_source: 'google', utm_medium: 'cpc' };
  }
  // Facebook Ads — fbclid present
  if (params.get('fbclid')) {
    return { utm_source: 'facebook', utm_medium: 'paid_social' };
  }
  // TikTok Ads
  if (params.get('ttclid')) {
    return { utm_source: 'tiktok', utm_medium: 'paid_social' };
  }
  // Referrer-based detection
  if (referrer) {
    try {
      const ref = new URL(referrer);
      const host = ref.hostname.replace(/^www\./, '');
      if (host.includes('google.'))    return { utm_source: 'google',    utm_medium: 'organic' };
      if (host.includes('bing.'))      return { utm_source: 'bing',      utm_medium: 'organic' };
      if (host.includes('facebook.') || host.includes('fb.com'))
                                       return { utm_source: 'facebook',  utm_medium: 'social' };
      if (host.includes('instagram.')) return { utm_source: 'instagram', utm_medium: 'social' };
      if (host.includes('youtube.'))   return { utm_source: 'youtube',   utm_medium: 'video' };
      if (host.includes('tiktok.'))    return { utm_source: 'tiktok',    utm_medium: 'video' };
      if (host.includes('twitter.') || host.includes('x.com'))
                                       return { utm_source: 'twitter',   utm_medium: 'social' };
      if (host.includes('whatsapp.'))  return { utm_source: 'whatsapp',  utm_medium: 'messaging' };
      if (host.includes('kbazar24.com')) return { utm_source: '', utm_medium: '' }; // internal nav
      return { utm_source: 'referral', utm_medium: 'referral' };
    } catch {
      // invalid referrer URL
    }
  }
  // No referrer, no UTM → direct
  return { utm_source: 'direct', utm_medium: 'none' };
}

function readCookie(name: string): Attribution | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[1])); }
  catch { return null; }
}

function writeCookie(name: string, value: Attribution) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${encoded}; max-age=${COOKIE_MAXAGE}; path=/; SameSite=Lax`;
}

export function readAttribution(): { first: Attribution | null; last: Attribution | null } {
  return {
    first: readCookie(COOKIE_FIRST),
    last:  readCookie(COOKIE_LAST),
  };
}

export default function AttributionTracker() {
  const searchParams = useSearchParams();
  const pathname    = usePathname();

  useEffect(() => {
    const referrer = document.referrer || '';

    // Skip internal navigations (referrer is same site)
    const isInternalNav = referrer.includes('kbazar24.com') && !searchParams.get('utm_source');
    if (isInternalNav) return;

    const { utm_source, utm_medium } = detectSource(searchParams, referrer);

    // If truly no signal (internal nav without UTM), skip
    if (!utm_source && !searchParams.get('utm_source')) return;

    const attr: Attribution = {
      utm_source,
      utm_medium,
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_content:  searchParams.get('utm_content')  || '',
      utm_term:     searchParams.get('utm_term')     || '',
      gclid:        searchParams.get('gclid')        || '',
      fbclid:       searchParams.get('fbclid')       || '',
      ttclid:       searchParams.get('ttclid')       || '',
      referrer:     referrer.slice(0, 500),
      landing_page: pathname,
      ts:           Date.now(),
    };

    // First-touch: write only if cookie doesn't already exist
    if (!readCookie(COOKIE_FIRST)) {
      writeCookie(COOKIE_FIRST, attr);
    }

    // Last-touch: always update
    writeCookie(COOKIE_LAST, attr);

  }, [searchParams, pathname]);

  return null;  // renders nothing
}
