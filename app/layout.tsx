import type { Metadata, Viewport } from "next";
import { Karantina, Rubik } from "next/font/google";
import "./globals.css";
import { AppStart } from "@/components/session/AppStart";
import { DaylightProvider } from "@/components/night/DaylightProvider";
import { startupImages } from "@/lib/apple-splash";
import { getDaylightState, toSnapshot } from "@/lib/daylight";

// Display: Karantina, a condensed Hebrew face standing in for Slush's crushed Lateral. UI: Rubik (for Aeonik Pro).
const karantina = Karantina({
  variable: "--font-karantina",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "surFriends",
  description: "קהילת הגולשים של ישראל",
  appleWebApp: { capable: true, title: "surFriends", statusBarStyle: "default", startupImage: startupImages() },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#dceeff",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Night lockout state for first paint; the client provider re-evaluates on mount and every minute.
  const now = new Date();
  const daylight = toSnapshot(getDaylightState(now), now);
  return (
    // Font variables live on <html>: globals.css sets `html { font-family: var(--font-sans) }`, and a variable
    // defined only on <body> is undefined at <html>, which silently fell back to the browser's default serif.
    <html lang="he" dir="rtl" suppressHydrationWarning className={`${karantina.variable} ${rubik.variable}`}>
      <body className="antialiased">
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
