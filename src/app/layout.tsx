import type { Metadata } from "next";
import { Inter, Roboto, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/context/UserContext";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

const robotoSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Webly AI",
  description: "AI-powered SaaS platform for Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoSans.className} ${inter.className} font-sans min-h-screen flex flex-col`}
      >
        {/* Set refetchInterval to periodically check the session status */}
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <ThemeProvider defaultTheme="dracula" storageKey="theme">
            <UserProvider>
              <Header />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </UserProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
