import type { Metadata } from "next";

const fallbackOrigin = "http://localhost:3000";

export const siteOrigin = new URL(process.env.APP_URL ?? fallbackOrigin).origin;

export function marketingMetadata(title: string, description: string, path: string): Metadata {
  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      locale: "pl_PL",
      siteName: "Kwotum",
      title,
      type: "website",
      url: path,
    },
    robots: { follow: true, index: true },
    title,
  };
}
