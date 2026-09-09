import type { Metadata, Viewport } from 'next';
import { Outfit, Cairo, Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Refined serif used sparingly for luxury accents (eyebrows, taglines) — never body copy.
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Union Sportive Monastirienne (US Monastir) - Official Club Portal',
  description: 'Welcome to the official digital universe of Union Sportive Monastirienne (USM). One City, One Heart, One Club. Get the latest football news, basketball updates, live match center scores, fan zone predictions, official store catalog, and sponsor portal.',
  keywords: 'US Monastir, Union Sportive Monastirienne, USM, Monastir Football, Monastir Basketball, BAL 2022 Champions, Ligue 1 Tunisia, Stade Mustapha Ben Jannet, Tunisia sports',
  authors: [{ name: 'Union Sportive Monastirienne' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.webp',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'USM',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#020817',
};

import { SiteChrome } from '../components/Common/SiteChrome';
import { AppAlertDialog, ConfirmDialog } from '../components/Common/ConfirmDialog';
import { PwaRegister } from '../components/Common/PwaRegister';
import { AnalyticsTracker } from '../components/Analytics/AnalyticsTracker';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cairo.variable} ${inter.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2015270885711722');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2015270885711722&ev=PageView&noscript=1"
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsOrganization',
              name: 'Union Sportive Monastirienne',
              alternateName: 'US Monastir',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.webp`,
              foundingDate: '1923',
              sport: ['Football', 'Basketball'],
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Monastir',
                addressCountry: 'TN',
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
              });
              window.addEventListener('appinstalled', function() {
                window.__pwaPrompt = null;
              });
            `,
          }}
        />
        <AppProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <PwaRegister />
          <SiteChrome>{children}</SiteChrome>
          <ConfirmDialog />
          <AppAlertDialog />
        </AppProvider>
      </body>
    </html>
  );
}
