import type { Metadata, Viewport } from "next";
import { Suez_One, IBM_Plex_Sans_Hebrew, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  return (
    <html lang="he" dir="rtl">
      <body className={`${suezOne.variable} ${plexHebrew.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
