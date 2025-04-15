import type { Metadata } from "next";
import { Inter, Roboto } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { auth } from '@/auth'; // Import auth to get session
import { AIContextProvider } from '@/context/AIContext';

import './globals.css';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import BlurDecoratives from '@/components/layout/blurDecoratives';
import { SessionProvider } from 'next-auth/react';

const robotoSans = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Webly AI',
  description: 'AI-powered SaaS platform for Agents',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the session server-side
  const session = await auth();
  // console.log('Session:', session);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoSans.className} ${inter.className} font-sans relative max-w-full overflow-x-hidden min-h-screen flex flex-col`}
      >
        <SessionProvider session={session}>
          <ThemeProvider defaultTheme="dark" storageKey="theme">
            <AIContextProvider>
              <BlurDecoratives />
              <Header />
              <main className="flex-1 z-10 mt-12 mb-18 h-full min-h-[fill-available] flex flex-col">
                {children}
              </main>
              <Footer />
            </AIContextProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
