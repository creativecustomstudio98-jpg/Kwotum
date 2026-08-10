# Implementacja marketingu i SEO — Etap 10

## Zakres

Etap 10 wdraża statyczną, polskojęzyczną warstwę marketingową w
`apps/web/app/(marketing)`. Treści są code-first i renderowane głównie jako
Server Components. Jedynym klientowym elementem marketingu jest jawnie
oznaczony, syntetyczny fragment demo. Nie zapisuje danych, nie kontaktuje się z
API i nie oblicza ceny.

Indeksowana allowlista obejmuje:

- `/`, `/produkt`, `/jak-dziala`, `/cennik`, `/dla-agencji`, `/wordpress`;
- `/branze` oraz pięć stron: meble na wymiar, ogrodzenia, strony internetowe,
  klimatyzacja i remonty;
- `/funkcje` oraz pięć stron: kalkulator wyceny, formularz wieloetapowy,
  kwalifikacja leadów, lead scoring i widget na stronę.

Źródłem allowlisty, mapy sitemap oraz typowanych danych branż i funkcji jest
`apps/web/lib/marketing/content.ts`. Każda strona branżowa ma specyficzny
problem, co najmniej pięć obszarów pytań, syntetyczny brief, wdrożenie, FAQ i
działający fragment demo. Treści demonstracyjne nie są przedstawiane jako
wyniki badań ani rekomendacja zatwierdzona przez firmy.

## Cennik i WordPress

Model subskrypcji, kwoty i limity planów nie zostały zatwierdzone. `/cennik`
pokazuje więc wyłącznie zgodny z prawdą program pilotażowy z wyceną
indywidualną oraz jawny status self-service „jeszcze nieustalony”. Test
automatyczny zabrania kwot w złotych na tej stronie.

`/wordpress` opisuje architekturę ukończonego lokalnie konektora: shortcode,
Gutenberg, popup, diagnostykę i compatibility matrix. Nie oferuje jeszcze
publicznego pobrania, ponieważ dystrybucja wymaga audytu Etapu 12 i bramki
produkcyjnej Etapu 13.

## Techniczne SEO

- `APP_URL` jest źródłem originu dla `metadataBase`, canonical, sitemap i
  structured data; fallback `http://localhost:3000` służy tylko lokalnemu
  buildowi;
- każda indeksowana strona ma unikalne title, description, canonical, jeden
  `h1` oraz jawne `index, follow`;
- sitemap zawiera wyłącznie allowlistę marketingową;
- robots blokuje `/api/`, `/design-system`, `/f/`, `/logowanie` i `/panel/`;
- panel ma wspólne `noindex, nofollow`; hosted flow, login i design system
  również mają własne `noindex`;
- strona główna publikuje Organization i SoftwareApplication, a podstrony
  dynamiczne BreadcrumbList;
- schema nie zawiera cen, ofert, ocen, opinii ani FAQPage;
- globalne 404 i 500 mają jasny następny krok, semantyczny nagłówek oraz
  dostępne kontrolki.

`noindex` jest kontrolą indeksacji, nie autoryzacją. Ochrona panelu, leadów i
hosted flow nadal wynika z Auth, tokenów sesji, tenant scope oraz RLS.

## Dostępność i wydajność

Marketing używa semantycznego HTML, skip linku, natywnych `details`, labeli
fragmentu demo, logicznych nagłówków i tokenów `@wyceno/ui`. Mobile nie ma
poziomego overflow, a nawigacja zachowuje cele co najmniej 28 px. CSS
respektuje reduced motion i forced colors.

Test Playwright:

- wykonuje axe WCAG A/AA na stronie głównej;
- przechodzi demo klawiaturą i sprawdza skip link;
- crawluje całą allowlistę, metadata, canonical i linki wewnętrzne;
- porównuje robots, sitemap i `noindex`;
- sprawdza uczciwy cennik i structured data bez fikcyjnych dowodów;
- weryfikuje mobile oraz limit maksymalnie 250 KiB transferu JavaScriptu
  marketingowego.

Docelowe Core Web Vitals z dokumentacji wymagają danych terenowych po
produkcji. Lokalny budżet i statyczny render nie są ich substytutem.

## Redesign Etapu 12A

Etap 12A nie zmienił allowlisty, metadata, canonical, sitemap, robots ani
schema. Wspólny shell otrzymał niski header i dostępne menu mobilne, a landing
został przebudowany w jedną redakcyjną narrację. Code-native `ProductWorkspace`
pokazuje syntetyczną kwalifikację prowadzącą do uporządkowanego briefu i nie
ładuje rastra ani klientowej biblioteki wizualizacyjnej. Produkt, „Jak działa”,
cennik, agencje i WordPress używają własnych kompozycji; huby funkcji i branż
są indeksami typograficznymi zamiast siatek identycznych kart.

Końcowy pomiar strony głównej wykazał 154 679 B transferu JavaScriptu Next.js,
0 requestów i 0 B obrazów. Crawl przechodzi dla wszystkich 18 tras, a macierz
1440/1280/1024/768/390/320 px nie wykazuje overflow. Historyczne wyniki
opisuje
`docs/_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_AUDIT.md`.
Surowe screenshoty `artifacts/redesign/` są odtwarzalnym outputem
`scripts/capture-redesign.mjs`, nie są wersjonowane i nie zastępują aktualnych
artefaktów V6.

## Referencyjny reset Etapu 12D

ADR-025 zastępuje wizualną część odbioru Etapów 12A–12C. Strona główna nie jest
już katalogiem jedenastu sekcji. Ma pięć rozdziałów: problem, transformacja,
proces, decyzja i wdrożenie. Każdy rozdział zawiera jedną tezę i jeden czytelny
code-native proof. Branże, funkcje, demo, WordPress, agencje i cennik pozostają
na dedykowanych trasach SEO.

`ProductWorkspace` pokazuje jeden dokument leada zamiast pomniejszonego
dashboardu. Test E2E blokuje tekst proofu poniżej 12 px, wysokość powyżej 6200
px na desktopie i 9000 px na mobile, poziomy overflow, nieprawidłowe linki oraz
regresje axe/klawiatury/reduced motion/forced colors. Po pełnym review zapisano
baseline’y landing page dla 1440 i 390 px. Raport, metryki i granice znajdują
się w
`docs/_archive/2026-07-28-pre-lorum-ui-v6/REFERENCE_LED_REBRAND_2026-07-26.md`.

## Rekonstrukcja strony głównej Etapu 12E

ADR-026 zastępuje wyłącznie kompozycję `/` z Etapu 12D. Pozostałe trasy,
`ProductWorkspace`, panel, widget, auth, API i tokeny nie należą do zakresu.
Landing odtwarza proporcje najnowszej referencji jako header → hero z
transformacją odpowiedzi w dokument leada → pasek sześciu danych → porównanie
zapytania i czterostopniowy proces.

Nowy proof jest home-only i code-native. Nie używa dawnych rastrów, biblioteki
ikon ani atrapy kontrolek. Linki prowadzą do rzeczywistego procesu branżowego,
pilotażu, logowania lub kotwicy. Wariant headera jest wybierany przez ścieżkę;
na innych trasach pozostają trzy wcześniejsze linki, logowanie i CTA.

Mały kontroler `IntersectionObserver` odsłania elementy tylko raz. Pierwszy
widok ma krótką sekwencję wejść, a dalsza treść pojawia się przy przewijaniu.
CSS animuje wyłącznie `opacity` i `transform`; no-JS renderuje widoczną treść,
a reduced motion wyłącza animacje i natychmiast ujawnia wszystkie elementy.

Baseline obejmuje pełne strony i osobne viewporty 1440 × 1000 oraz 390 × 844.
E2E pilnuje trzech części narracji, sześciu danych, czterech proofów, minimum
12 px w interfejsie produktu, wysokości, no-JS, progressive reveal, 320 px bez
overflow, forced colors, axe, klawiatury, crawl i budżetu JavaScriptu. Pełny
raport znajduje się w
`docs/_archive/2026-07-28-pre-lorum-ui-v6/HOME_REFERENCE_RECONSTRUCTION_2026-07-26.md`.

## Rollback

Etap nie zmienia bazy danych. Rollback aplikacji może wycofać route group
marketingu, sitemap i robots w jednym deploymencie. Nie wolno przywrócić
globalnego `noindex` bez świadomej decyzji, jeśli publiczne strony są już
indeksowane; w takim przypadku najpierw należy określić oczekiwany status HTTP,
canonical i komunikat dla usuwanych adresów.

## Bramki publicznego startu

Lokalne ukończenie Etapu 10 nie jest zgodą na publikację. Przed launch wymagane
są: profesjonalny clearance nazwy, zatwierdzony model cenowy, prawdziwe dane
firmy i treści prawne, ręczny content review właściciela, test czytnikiem
ekranu, pomiary wydajności na środowisku docelowym oraz Etapy 12–13.
