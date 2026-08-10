import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getIndustry, industries } from "../../../../lib/marketing/content";
import { marketingMetadata, siteOrigin } from "../../../../lib/marketing/metadata";
import { Breadcrumbs, CtaBand, Faq, JsonLd } from "../../components";
import { MarketingDemo } from "../../marketing-demo";

interface IndustryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return industries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return marketingMetadata(industry.title, industry.description, `/branze/${industry.slug}`);
}

export default async function IndustryDetailPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const path = `/branze/${industry.slug}`;

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
              item: `${siteOrigin}/branze`,
              name: "Branże",
              position: 2,
            },
            {
              "@type": "ListItem",
              item: `${siteOrigin}${path}`,
              name: industry.name,
              position: 3,
            },
          ],
        }}
      />
      <div className="marketing-container marketing-page-hero">
        <Breadcrumbs
          items={[
            { href: "/", label: "Start" },
            { href: "/branze", label: "Branże" },
            { label: industry.name },
          ]}
        />
        <div className="marketing-page-hero__grid">
          <div className="marketing-page-hero__copy">
            <p className="wy-kicker marketing-eyebrow">{industry.eyebrow}</p>
            <h1>{industry.title}</h1>
            <p>{industry.description}</p>
          </div>
          <aside className="marketing-page-hero__aside">
            <strong>Wynik orientacyjny</strong>
            <span>
              Przykład jest syntetyczny. Firma musi zweryfikować pytania, reguły i przedziały przed
              publikacją.
            </span>
          </aside>
        </div>
      </div>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container marketing-grid marketing-grid--two">
          <div>
            <p className="wy-kicker marketing-eyebrow">Problem wejściowy</p>
            <h2>Dlaczego zwykłe pole „opisz zlecenie” nie wystarcza?</h2>
          </div>
          <div>
            <p>{industry.challenge}</p>
            <p>{industry.result}</p>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container marketing-industry-demo">
          <div>
            <p className="wy-kicker marketing-eyebrow">Fragment demo</p>
            <h2>Zobacz, jak pytanie staje się częścią briefu.</h2>
            <p>
              Demo działa lokalnie, nie zapisuje odpowiedzi i nie oblicza ceny. Pokazuje sposób
              prowadzenia klienta oraz wynik operacyjny dla firmy.
            </p>
          </div>
          <MarketingDemo
            options={industry.questions.slice(0, 3)}
            question={`Która informacja o projekcie „${industry.name}” jest już znana?`}
            result={industry.result}
          />
        </div>
      </section>

      <section className="marketing-section marketing-section--dark">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Zakres pytań</p>
            <h2>Pięć obszarów do uporządkowania przed kontaktem.</h2>
          </div>
          <div className="marketing-grid">
            {industry.questions.map((question, index) => (
              <article className="marketing-card marketing-card--dark" key={question}>
                <span className="marketing-card__number">0{index + 1}</span>
                <h3>{question}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container marketing-grid marketing-grid--two">
          <div>
            <p className="wy-kicker marketing-eyebrow">Syntetyczny przykład leada</p>
            <h2>Co firma może zobaczyć po ukończeniu procesu.</h2>
            <p>To dane demonstracyjne, nie prawdziwy klient ani obietnica wyniku sprzedażowego.</p>
          </div>
          <dl className="marketing-definition-list">
            {industry.sampleBrief.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Wdrożenie</p>
            <h2>Od syntetycznego szablonu do procesu firmy.</h2>
          </div>
          <div className="marketing-grid">
            {industry.implementation.map((step, index) => (
              <article className="marketing-card" key={step}>
                <span className="marketing-card__number">0{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">FAQ</p>
            <h2>Pytania o zakres i wynik.</h2>
          </div>
          <Faq items={industry.faq} />
        </div>
      </section>

      <CtaBand
        description="Porównaj mechanizm formularza, serwerowego wyniku i obsługi leada przed konfiguracją własnych pytań."
        title={`Uporządkuj pierwsze zapytanie: ${industry.name.toLowerCase()}.`}
      />
    </>
  );
}
