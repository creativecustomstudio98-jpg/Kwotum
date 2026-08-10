import Link from "next/link";

import { features } from "../../../lib/marketing/content";
import { marketingMetadata } from "../../../lib/marketing/metadata";
import { ArrowIcon, Breadcrumbs, CtaBand } from "../components";

export const metadata = marketingMetadata(
  "Funkcje formularza wyceny i kwalifikacji",
  "Kalkulator wyceny, formularz wieloetapowy, kwalifikacja leadów, wyjaśnialny scoring oraz izolowany widget na stronę.",
  "/funkcje",
);

export default function FeaturesPage() {
  return (
    <>
      <div className="marketing-container marketing-page-hero">
        <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Funkcje" }]} />
        <div className="marketing-page-hero__grid">
          <div className="marketing-page-hero__copy">
            <p className="wy-kicker marketing-eyebrow">Funkcje</p>
            <h1>Funkcje podporządkowane jakości następnego kroku.</h1>
            <p>
              Każda funkcja pomaga zebrać, potwierdzić albo przekazać kontekst. Nie dodajemy
              kontrolek bez realnego działania.
            </p>
          </div>
        </div>
      </div>
      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container editorial-index">
          {features.map((feature, index) => (
            <Link href={`/funkcje/${feature.slug}`} key={feature.slug}>
              <span>0{index + 1}</span>
              <div>
                <p className="wy-kicker marketing-eyebrow">{feature.eyebrow}</p>
                <h2>{feature.title}</h2>
              </div>
              <p>{feature.description}</p>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>
      <CtaBand
        description="Zobacz cały przepływ, aby ocenić zależności między widgetem, serwerowym wynikiem i panelem leada."
        title="Funkcje działają razem, nie jako osobne obietnice."
      />
    </>
  );
}
