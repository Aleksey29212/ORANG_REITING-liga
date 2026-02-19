import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AdminProvider } from '@/context/admin-context';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider, MobileProvider } from '@/firebase';
import Header from '@/components/header';
import { getBackgroundUrl } from '@/lib/settings';
import { AdminLoginTrigger } from '@/components/admin-login';
import { VisitLogger } from '@/components/visit-logger';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DartBrig Pro',
  description: 'Professional Darts Tournament Management',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const backgroundUrl = await getBackgroundUrl();
  
  return (
    <html lang="ru" className={cn("dark", inter.variable)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background relative')}>
        {backgroundUrl && (
          <div
            className="fixed inset-0 z-[-2] bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        )}
        <div className="fixed inset-0 z-[-1] bg-background/90" />

        <FirebaseClientProvider>
          <MobileProvider>
            <AdminProvider>
              <div className={cn('flex min-h-screen flex-col')}>
                <Header />
                <div className="flex-1">{children}</div>
                <footer className="container flex-shrink-0">
                  <div className="h-12" />
                </footer>
              </div>
              <Toaster />
              <AdminLoginTrigger />
            </AdminProvider>
          </MobileProvider>
        </FirebaseClientProvider>
        <VisitLogger />
      </body>
    </html>
  );
}
