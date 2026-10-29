import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/beach/", "/credits"],
        disallow: ["/api/", "/callback", "/settings", "/profile", "/new"],
      },
    ],
  };
}
