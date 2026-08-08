import Link from "next/link";

import { industries } from "../../../lib/marketing/content";
import { marketingMetadata } from "../../../lib/marketing/metadata";
import { ArrowIcon, Breadcrumbs, CtaBand } from "../components";
import { IndustriesHeroProof } from "./industries-hero-proof";

export const metadata = marketingMetadata(
  "Formularze wyceny dla pięciu branż usługowych",
  "Zobacz przykładowe pytania i briefy dla mebli na wymiar, ogrodzeń, stron internetowych, klimatyzacji oraz remontów.",
  "/branze",
);

export default function IndustriesPage() {
  return (
    <>
      <section aria-labelledby="industries-hero-title" className="industries-page-hero">
        <div className="marketing-container industries-page-hero__inner">
          <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Branże" }]} />
          <header className="industries-page-hero__heading">
            <p className="wy-kicker marketing-eyebrow">Procesy dopasowane do branży</p>
            <h1 id="industries-hero-title">
              <span>Meble to nie remont.</span>
              <span>Brief też nie powinien być ten sam.</span>
            </h1>
            <p>
              Wybierz branżę i porównaj pytania z gotowym leadem. Kwotum zachowuje wspólny mechanizm
              publikacji i kwalifikacji, ale dopasowuje zakres briefu do konkretnej usługi.
            </p>
          </header>
          <IndustriesHeroProof />
        </div>
      </section>
      <section className="marketing-section marketing-section--surface" id="zastosowania">
        <div className="marketing-container editorial-index">
          {industries.map((industry, index) => (
            <Link href={`/branze/${industry.slug}`} key={industry.slug}>
              <span>0{index + 1}</span>
              <div>
                <p className="wy-kicker marketing-eyebrow">{industry.eyebrow}</p>
                <h2>{industry.title}</h2>
              </div>
              <p>{industry.description}</p>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>
      <CtaBand
        description="Nie znalazłeś swojej branży? Najpierw sprawdź model pytań i granice produktu — nie tworzymy automatycznie setek cienkich stron."
        title="Pięć dopracowanych zastosowań zamiast katalogu bez treści."
      />
    </>
  );
}
