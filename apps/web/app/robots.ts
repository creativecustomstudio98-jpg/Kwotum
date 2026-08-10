import type { MetadataRoute } from "next";

import { siteOrigin } from "../lib/marketing/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/design-system", "/f/", "/logowanie", "/panel"],
      userAgent: "*",
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
