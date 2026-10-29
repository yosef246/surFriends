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
    theme_color: "#0b6c9e", // --color-ocean
    background_color: "#eafbfe", // --color-foam-blue
    icons: [
      { src: "/pwa-icon/192?round=1", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?round=1", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
