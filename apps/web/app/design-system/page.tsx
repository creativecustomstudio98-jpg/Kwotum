import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "./demo.css";

import { DesignSystemDemo } from "./showcase";
import { isDesignSystemAvailable } from "./availability";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: "Wewnętrzna strona weryfikacyjna komponentów Kwotum.",
  robots: { follow: false, index: false },
  title: "Design foundation",
};

export default function DesignSystemPage() {
  if (!isDesignSystemAvailable()) notFound();

  return <DesignSystemDemo />;
}
