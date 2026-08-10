# Strategia SEO

## Intencje

- produktowe: kalkulator/formularz wyceny na stronę, interaktywny formularz;
- branżowe: kalkulator mebli, ogrodzenia, strony, remontu;
- techniczne: kalkulator WordPress, widget na stronę;
- porównawcze: alternatywa dla Typeform/Jotform;
- edukacyjne: jak kwalifikować leady, jak pokazywać przedział ceny.

Wolumeny nie są znane. `docs/research/seo-keywords.csv` zawiera backlog do uzupełnienia eksportem z GSC/Keyword Planner/Ahrefs/Semrush; puste pole nie oznacza zera.

## Techniczne SEO

SSR, Metadata API, canonical, sitemap, robots, Open Graph, breadcrumbs, unikalne title/description, poprawne HTTP/redirects, 404/500 i monitoring linków. Panel, preview, dane leadów i robocze hosted flows: `noindex`. Hreflang dopiero po realnej lokalizacji.

## Structured data

Organization, SoftwareApplication, BreadcrumbList i Article tylko zgodnie z widoczną treścią. FAQPage po ponownej weryfikacji bieżących wytycznych; bez review schema bez prawdziwych opinii.

## Jakość

Brak programatycznych thin pages. Każda strona branżowa ma specyficzny problem, pytania, działające demo, przykładowy lead, FAQ, wdrożenie i unikalną treść.

## Implementacja Etapu 10

Allowlista 18 publicznych adresów ma unikalne title, description, canonical i
SSR/SSG. `sitemap.xml` zawiera wyłącznie marketing, a `robots.txt` blokuje API,
panel, logowanie, design system i hosted flows. Te powierzchnie mają również
`noindex`; robots nie jest traktowany jako kontrola dostępu.

Organization, SoftwareApplication i BreadcrumbList opisują wyłącznie treści
widoczne na stronie. Nie wdrożono Review, AggregateRating, Offer ani FAQPage.
Pięć stron branżowych ma unikalne pytania, demo bez persystencji, syntetyczny
brief i FAQ. Automatyczny crawl sprawdza statusy, linki, canonical, duplikaty,
sitemap, robots i strony błędów.

Strony bloga, porównań i bazy wiedzy z pierwotnej architektury treści nie są
generowane jako puste placeholdery. Powstaną dopiero wraz z prawdziwym,
źródłowym materiałem i procesem aktualizacji.
