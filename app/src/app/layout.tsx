import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'The Oracle | Discover Your Numerology',
  description:
    'Unlock the ancient secrets hidden in your birth date. The Oracle reveals your Life Path, destiny, and relationship compatibility through the power of numerology.',
  keywords: [
    'numerology',
    'life path number',
    'compatibility',
    'oracle',
    'birth date meaning',
    'destiny number',
  ],
  openGraph: {
    title: 'The Oracle | Discover Your Numerology',
    description:
      'Unlock the ancient secrets hidden in your birth date. Discover your Life Path and relationship compatibility.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cinzel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
