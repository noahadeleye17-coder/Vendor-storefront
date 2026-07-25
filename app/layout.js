import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'ShopLink — Your shop, on WhatsApp, in 5 minutes',
  description:
    'Create a storefront vendors can share as one link, and customers can order from with a single tap on WhatsApp. No app, no registration, no fees to start.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}