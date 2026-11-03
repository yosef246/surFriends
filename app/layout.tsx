import type { Metadata, Viewport } from "next";
import { Suez_One, IBM_Plex_Sans_Hebrew, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppStart } from "@/components/session/AppStart";
import { DaylightProvider } from "@/components/night/DaylightProvider";
import { getDaylightState, toSnapshot } from "@/lib/daylight";

const suezOne = Suez_One({
  variable: "--font-suez-one",
  subsets: ["hebrew", "latin"],
  weight: "400",
});

const plexHebrew = IBM_Plex_Sans_Hebrew({
  variable: "--font-plex-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "surFriends",
  description: "קהילת הגולשים של ישראל",
  appleWebApp: { capable: true, title: "surFriends", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b6c9e",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Night lockout state for first paint; the client provider re-evaluates on mount and every minute.
  const now = new Date();
  const daylight = toSnapshot(getDaylightState(now), now);
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${suezOne.variable} ${plexHebrew.variable} ${jetbrainsMono.variable} antialiased`}>
        <script
          // Before first paint: hide the launch splash when it was already shown in this browser session.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('sf_splash_seen')==='1')document.documentElement.setAttribute('data-splash-seen','')}catch(e){}",
          }}
        />
        <DaylightProvider initial={daylight}>
          {children}
          <AppStart />
        </DaylightProvider>
      </body>
    </html>
  );
}
