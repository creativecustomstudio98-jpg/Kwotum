import type { ReactNode } from "react";

import { MarketingFooter } from "./components";
import { MarketingHeader } from "./marketing-header";
import "./marketing.css";

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a className="wy-skip-link" href="#main-content">
        Przejdź do treści
      </a>
      <MarketingHeader />
      <main className="marketing-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
