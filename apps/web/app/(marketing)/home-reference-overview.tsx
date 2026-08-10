import Link from "next/link";

import styles from "./home-reference-overview.module.css";

const overviewTemplates = [
  {
    featured: true,
    href: "/branze/meble-na-wymiar",
    imageClass: styles.templateKitchen,
    meta: "Zakres · wymiary · budżet",
    title: "Meble na wymiar",
  },
  {
    featured: false,
    href: "/branze/ogrodzenia",
    imageClass: styles.templateFence,
    meta: "Długość · bramy · montaż",
    title: "Ogrodzenia i bramy",
  },
  {
    featured: false,
    href: "/branze/strony-internetowe",
    imageClass: styles.templateWebsite,
    meta: "Cel · funkcje · termin",
    title: "Strony internetowe",
  },
  {
    featured: false,
    href: "/branze/klimatyzacja",
    imageClass: styles.templateClimate,
    meta: "Metraż · strefy · montaż",
    title: "Klimatyzacja",
  },
  {
    featured: false,
    href: "/branze/remonty",
    imageClass: styles.templateRenovation,
    meta: "Zakres · standard · termin",
    title: "Remonty i wykończenia",
  },
] as const;

export function HomeReferenceOverview() {
  return (
    <section
      aria-labelledby="home-reference-overview-title"
      className={styles.section}
      data-home-section="industry-templates-overview"
    >
      <div
        className={`marketing-container ${styles.inner}`}
        data-home-proof="quick-process-and-templates"
      >
        <header className={styles.heading}>
          <span>Punkt startowy, nie pusty formularz</span>
          <h2 id="home-reference-overview-title">Proces, który mówi językiem Twojej branży.</h2>
          <p>
            Zacznij od gotowej logiki pytań. Później dopasuj ją do sposobu, w jaki naprawdę
            wyceniasz projekty.
          </p>
        </header>

        <ul aria-label="Szablony branżowe" className={styles.templates}>
          {overviewTemplates.map((template, index) => (
            <li data-reveal="up" data-reveal-delay={String(index + 1)} key={template.href}>
              <Link
                className={`${styles.templateCard} ${template.imageClass}${
                  template.featured ? ` ${styles.templateFeatured}` : ""
                }`}
                href={template.href}
              >
                <span aria-hidden="true" className={styles.deviceTop}>
                  <span>9:41</span>
                  <span />
                </span>
                <span aria-hidden="true" className={styles.templateVisual} />
                <span className={styles.templateBody}>
                  <small>{template.meta}</small>
                  <strong>{template.title}</strong>
                  <span className={styles.templateAction}>
                    Zobacz proces
                    <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
