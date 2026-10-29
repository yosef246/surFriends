import type { NextConfig } from "next";

// Allow next/image to load report photos from the Supabase Storage host.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl) : null;

// Conservative headers. No script CSP on purpose (next/font, Supabase, Next inline scripts);
// frame-ancestors alone is safe and blocks clickjacking.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  // Google login was removed: old links go to the feed.
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: true },
      { source: "/callback", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The SW file must never be served stale from an HTTP cache, or updates to it would not roll out.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
  // Verification builds use NEXT_DIST_DIR=.next-verify so they never clobber a running `pnpm dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseHost.hostname,
            port: supabaseHost.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
