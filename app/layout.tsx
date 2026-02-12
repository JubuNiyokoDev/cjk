import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TopLoader from '@/components/TopLoader';
import Chatbot from '@/components/Chatbot';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

const siteName = 'Centre Jeunes Kamenge';
const siteDescription =
  'Le Centre Jeunes Kamenge (CJK) est un centre social dédié à la formation des jeunes, la promotion de la paix et la réconciliation au Burundi. Plus de 50,000 jeunes membres depuis 1992.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Ensemble pour bâtir un monde de frères`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'Centre Jeunes Kamenge',
    'CJK',
    'Burundi',
    'Bujumbura',
    'Jeunes',
    'Paix',
    'Formation',
    'Radio Colombe FM',
  ],
  authors: [{ name: 'Centre Jeunes Kamenge' }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/icons/icon-192.png',
  },
  themeColor: '#ffffff',
  openGraph: {
    title: `${siteName} - CJK`,
    description: 'Formation, Paix, Réconciliation - Plus de 30 ans au service des jeunes du Burundi',
    url: '/',
    siteName,
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/logo.jpeg',
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - CJK`,
    description: 'Formation, Paix, Réconciliation - Plus de 30 ans au service des jeunes du Burundi',
    images: ['/logo.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <TopLoader />
        {children}
        <Chatbot />
        <Toaster />
      </body>
    </html>
  );
}
