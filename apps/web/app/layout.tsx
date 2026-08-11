import "@wyceno/ui/styles.css";
import "./system-pages.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { siteOrigin } from "../lib/marketing/metadata";

const inter = localFont({
  display: "swap",
  src: "./fonts/InterVariable.woff2",
  variable: "--wy-font-inter",
  weight: "100 900",
});

export const metadata: Metadata = {
  description:
    "Kwotum porządkuje zapytania klientów, kwalifikuje leady i wskazuje następny krok sprzedażowy.",
  icons: {
    apple: [{ sizes: "180x180", type: "image/png", url: "/apple-touch-icon-v3.png" }],
    icon: [{ sizes: "192x192", type: "image/png", url: "/kwotum-logo-icon-v3.png" }],
  },
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Kwotum",
    template: "%s · Kwotum",
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pl">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
