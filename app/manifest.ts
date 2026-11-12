import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "surFriends",
    short_name: "surFriends",
    description: "קהילת הגולשים של ישראל",
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "he",
    theme_color: "#dceeff", // --color-page (sky wash)
    background_color: "#dceeff", // --color-page (sky wash)
    icons: [
      { src: "/pwa-icon/192?round=1", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?round=1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
