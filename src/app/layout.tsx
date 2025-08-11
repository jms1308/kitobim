
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Kitobim 2.0',
  description: 'O‘zbekistondagi 2-qo‘l kitoblar uchun eʼlonlar sayti',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
       <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563EB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20v-2H6.5a2.5 2.5 0 0 1 0-5H20V5H6.5a2.5 2.5 0 0 1-2.4-3.2.5.5 0 0 1 .9-.3L6.5 4H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1' /><path d='M4 12V5.5' /></svg>"
        />
      </head>
      <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
              {children}
            </main>
            <MobileNav />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
