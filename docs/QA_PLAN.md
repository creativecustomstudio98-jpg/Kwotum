# Plan QA

## Piramida

- unit: conditional logic, pricing, scoring, walidacja, permissions, formatowanie i HMAC;
- integration: flow/version/publish, sesja/lead/upload/e-mail, RLS i status;
- E2E: rejestracja → szablon → edycja → publikacja → widget → lead → status;
- security: IDOR, tenant leakage, XSS, injection, upload bypass, rate limit, replay i role;
- visual/accessibility: landing, widget, dashboard, builder, lead details i WordPress preview.

## Macierz krytyczna

Desktop + mobile, keyboard-only, wolna/utracona sieć, retry, dwie zakładki, expired session, zły plik, duplicate submit, edycja podczas sesji i próba innego tenanta.

## Dane

Wyłącznie syntetyczne fabryki i seed oznaczony demo. Testy tenant isolation zawsze używają co najmniej dwóch organizacji. Brak snapshotów z PII.

## CI

Lint, format, strict typecheck, unit/integration i build na PR. E2E krytyczne na PR lub merge zgodnie z czasem; pełna macierz i security przed release. Flaky test jest defektem: naprawa lub kwarantanna z właścicielem i terminem, nigdy ciche pominięcie.

Etap 9 dodaje kontrolne sesje o znanych wynikach: 5 load/start, 3 wyniki,
2 leady i 1 drop-off na 5 wyświetleń. PostgreSQL musi zwrócić odpowiednio
100%, 60%, 40% i 20%. Playwright potwierdza jeden load/start/result/lead,
kompletny słownik eventów rzeczywistej ścieżki, consent oraz axe. Testy
negatywne obejmują PII w payloadzie, brak zgody, drugi tenant, raw access Sales,
wycofanie i próbę poniżej 5.

Etap 10 dodaje crawl całej allowlisty marketingowej. Test wymaga HTTP 200,
unikalnego title/description, canonical zgodnego ze ścieżką, jednego `h1`,
`index, follow` oraz działających linków wewnętrznych. Osobno porównuje
robots/sitemap/noindex, 404, structured data bez fikcyjnych ocen i cen, uczciwy
cennik, axe, klawiaturę, działanie demo, mobile bez overflow oraz budżet 250 KiB
transferu JavaScriptu. Visual review obejmuje desktop 1440 px i mobile 390 px.

Etap 12A rozszerza visual review o 1280, 1024, 768 i 320 px oraz o logowanie,
dashboard analityczny, listę i szczegół leada, widget inline/popup i wspólne
stany. Test mobilnego headera sprawdza focus, Escape i scroll lock. Osobny test
wymusza reduced motion, forced colors oraz reflow 320 CSS px. Fixture’y panelu
używają wyłącznie syntetycznych danych `example.test` i produkcyjnego CSS; nie
tworzą bypassu autoryzacji ani trybu demo aplikacji.

Etap 12V dodaje test historii edytora, limitu 50 snapshotów, grupowania
wpisywania, kasowania redo po zmianie kierunku oraz kolejki latest-only.
Integracja PostgreSQL sprawdza rewizję nazwy i dokumentu. Warunkowy Playwright
używa osobnego syntetycznego flow `PANEL_E2E_EDITOR_FLOW_ID`: potwierdza
przejście `niezapisane → zapisane`, undo/redo, konflikt dwóch kart, jawne
wczytanie wersji serwerowej, zamykanie inspektora i axe. Fixture jest
przywracany w `finally`.

Etap 12W dodaje pomiary regionów buildera przy referencyjnym
1448 × 1086: rail, toolbar, trzy kolumny, kartę preview i brak kolizji
tożsamość/status/akcje. Osobno rozwija wspólny sidebar i potwierdza, że
inspektor kończy się wewnątrz viewportu. Tablet 768 px weryfikuje jeden wiersz
drag/radio/input/delete, a mobile 390 px cele dotykowe, kartę podglądu i
klawiaturowe menu historii. Macierz 320/375/430/724/1024/1280/1536 px obejmuje
brak overflow; 724 px jest reflow odpowiadającym 200% zoom obrazu 1448 px.
Długie polskie wartości są wstrzykiwane wyłącznie do DOM na czas pomiaru, więc
test wizualny nie zapisuje danych ani nie uruchamia autosave.

Etap 12ZA dodaje czystą operację zmiany kolejności opcji i testuje, że
przestawia wyłącznie tablicę `options` jednego pytania, zachowując klucze,
`nextStepKey`, reguły i pozostały dokument. Playwright wykonuje tę samą
operację przez DnD, `Alt+ArrowUp/Down` i menu dotykowe, sprawdza undo/redo,
autosave, fokus, `aria-live`, axe, overflow oraz widoki 1448/768/390 px.
Pełny panel z jednym współdzielonym szkicem jest uruchamiany sekwencyjnie, aby
testy mutacji nie powodowały sztucznych konfliktów rewizji między workerami.

Etap 12ZD dodaje rootową komendę `pnpm e2e:panel`. Harness dopuszcza wyłącznie
lokalny projekt Supabase zgodny z `supabase/config.toml`, buduje standalone i
tworzy jednorazowy tenant z losowym kontem. Pakiet obejmuje 16 scenariuszy
panelu i jeden scenariusz podglądu bez zapisu: auth, RLS-scoped dane,
dashboard, leady, builder z konfliktem dwóch kart, szablony, analitykę,
instalację, ustawienia i responsive. Testy działają jednym workerem, a po
przebiegu — także po błędzie — usuwane są rekordy tenantowe, konto Auth,
prywatne obiekty Storage i tymczasowe screenshoty. Zero pozostałości jest
osobną asercją gate'u.
