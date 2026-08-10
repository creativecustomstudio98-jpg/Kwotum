import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { features, getFeature } from "../../../../lib/marketing/content";
import { marketingMetadata, siteOrigin } from "../../../../lib/marketing/metadata";
import { Breadcrumbs, CtaBand, JsonLd } from "../../components";

interface FeaturePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return features.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return {};
  return marketingMetadata(feature.title, feature.description, `/funkcje/${feature.slug}`);
}

export default async function FeatureDetailPage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();

  const path = `/funkcje/${feature.slug}`;

  return (
    <>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", item: siteOrigin, name: "Start", position: 1 },
            {
              "@type": "ListItem",
              item: `${siteOrigin}/funkcje`,
              name: "Funkcje",
              position: 2,
            },
            {
              "@type": "ListItem",
              item: `${siteOrigin}${path}`,
              name: feature.title,
              position: 3,
            },
          ],
        }}
      />
      <div className="marketing-container marketing-page-hero">
        <Breadcrumbs
          items={[
            { href: "/", label: "Start" },
            { href: "/funkcje", label: "Funkcje" },
            { label: feature.eyebrow },
          ]}
        />
        <div className="marketing-page-hero__grid">
          <div className="marketing-page-hero__copy">
            <p className="wy-kicker marketing-eyebrow">{feature.eyebrow}</p>
            <h1>{feature.title}</h1>
            <p>{feature.description}</p>
          </div>
          <aside className="marketing-page-hero__aside">
            <strong>Funkcja produkcyjna</strong>
            <span>
              Opis odnosi się do działającego zakresu aplikacji i jawnie wskazuje granice
              bezpieczeństwa.
            </span>
          </aside>
        </div>
      </div>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Rezultat</p>
            <h2>Co ta funkcja zmienia w obsłudze zapytania.</h2>
          </div>
          <div className="marketing-grid">
            {feature.benefits.map((benefit, index) => (
              <article className="marketing-card" key={benefit}>
                <span className="marketing-card__number">0{index + 1}</span>
                <h3>{benefit}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container marketing-grid marketing-grid--two">
          <div>
            <p className="wy-kicker marketing-eyebrow">Przepływ</p>
            <h2>Trzy kroki bez ukrytej automatyzacji.</h2>
          </div>
          <ol className="marketing-list">
            {feature.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="marketing-section marketing-section--dark">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Granice i zabezpieczenia</p>
            <h2>Kontrola jest częścią funkcji, nie dopiskiem.</h2>
          </div>
          <div className="marketing-grid">
            {feature.safeguards.map((safeguard) => (
              <article className="marketing-card marketing-card--dark" key={safeguard}>
                <p>{safeguard}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        description="Przejdź do pełnego opisu procesu albo wybierz stronę branżową z konkretnym zestawem pytań."
        title="Zobacz funkcję w kontekście całej ścieżki."
      />
    </>
  );
}
