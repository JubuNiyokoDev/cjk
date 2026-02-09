import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import TopLoader from '@/components/TopLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Centre Jeunes Kamenge - Ensemble pour bâtir un monde de frères',
  description:
    'Le Centre Jeunes Kamenge (CJK) est un centre social dédié à la formation des jeunes, la promotion de la paix et la réconciliation au Burundi. Plus de 50,000 jeunes membres depuis 1992.',
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
  openGraph: {
    title: 'Centre Jeunes Kamenge - CJK',
    description: 'Formation, Paix, Réconciliation - Plus de 30 ans au service des jeunes du Burundi',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Centre Jeunes Kamenge - CJK',
    description: 'Formation, Paix, Réconciliation - Plus de 30 ans au service des jeunes du Burundi',
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
      </body>
    </html>
  );
}
