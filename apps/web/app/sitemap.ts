import type { MetadataRoute } from "next";

import { indexedRoutes } from "../lib/marketing/content";
import { siteOrigin } from "../lib/marketing/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexedRoutes.map((path) => ({
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.7,
    url: `${siteOrigin}${path === "/" ? "" : path}`,
  }));
}
