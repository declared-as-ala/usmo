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
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
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
        <AppProvider>
          <PwaRegister />
          <SiteChrome>{children}</SiteChrome>
          <ConfirmDialog />
          <AppAlertDialog />
        </AppProvider>
      </body>
    </html>
  );
}
