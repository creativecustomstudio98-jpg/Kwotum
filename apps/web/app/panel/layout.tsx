import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";
import "./reference-fidelity.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

export default function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
