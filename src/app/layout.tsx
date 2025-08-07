import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Kitob Bozori',
  description: 'O‘zbekistondagi 2-qo‘l kitoblar uchun eʼlonlar sayti',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} font-body antialiased`}>
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
