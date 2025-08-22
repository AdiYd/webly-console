import type { Metadata } from "next";
import { Inter, Roboto } from 'next/font/google';
import { ThemeProvider } from '@/context/theme-provider';
import { auth } from '@/auth'; // Import auth to get session

import '../globals.css';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import BlurDecoratives from '@/components/layout/blurDecoratives';
import { SessionProvider } from 'next-auth/react';
import { clientLogger } from '@/utils/logger';
import { WebsiteProvider } from '@/context/website-provider';

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
  // clientLogger.info('Session:', 'This is session:', session);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('theme='))
                    ?.split('=')[1];
                  
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'autumn');
                  }
                } catch (e) {
                  console.error('Failed to set initial theme', e);
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
        window.MathJax = {
          tex: {
            inlineMath: [['\\\\(', '\\\\)']],
            displayMath: [['\\\\[', '\\\\]']],
            processEscapes: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          },
          startup: {
            pageReady() {
              return MathJax.startup.defaultPageReady().then(() => {
                console.log('MathJax initial typesetting complete');
              });
            }
          }
        };
      `,
          }}
        />
        {/* Load MathJax after configuration */}
        <script src="https://cdn.plot.ly/plotly-3.0.1.min.js" async charSet="utf-8"></script>
      </head>
      <body
        className={`relative max-w-full overflow-x-hidden min-h-screen max-h-screen flex flex-col`}
      >
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false} session={session}>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <WebsiteProvider>
              {/* <OrganizationContextProvider> */}
              <BlurDecoratives />
              {/* <Header /> */}
              <main className="flex-1 z-10  max-h-full flex flex-col">{children}</main>
              {/* <Footer /> */}
              {/* </OrganizationContextProvider> */}
            </WebsiteProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
