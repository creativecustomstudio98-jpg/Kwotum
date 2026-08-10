# Rekonstrukcja strony głównej według referencji — Etap 12E

> **ARCHIVED — nie jest źródłem prawdy.** Zastąpiony przez:
> `docs/UI_SCREEN_SPEC.md`, `docs/RESPONSIVE_LAYOUT.md`, `docs/VISUAL_QA.md`
> oraz aktywny stan Etapu 12F w `docs/TASKS.md`.
>
> Aktualizacja 2026-07-27: nowszy ekran dołączony w rozmowie zastępuje opis
> pełnego dokumentu leada oraz sześciopozycyjnego paska w pierwszym foldzie.
> Obowiązują kompaktowa karta leada i cztery korzyści opisane w
> `HOME_HERO_REFERENCE_OVERRIDE_2026-07-27.md`. Pozostała część tego dokumentu
> zachowuje wartość historyczną dla Etapu 12E.

## Zakres

Etap obejmuje wyłącznie `/`. Pozostałe strony marketingowe, współdzielony
`ProductWorkspace`, panel, widget, auth, API, model danych, tenant scope, RLS,
pricing/scoring i tokeny `packages/ui` pozostają bez zmian. Widoczna marka to
Lorum zgodnie z ADR-024; przesłana referencja określa kompozycję, a nie ponowną
zmianę nazwy.

## Analiza i odwzorowanie

| Element                | Referencja                              | Implementacja                            |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| Header                 | około 62 px, pięć linków, jedno CTA     | 64 px, pięć home-only linków, jedno CTA  |
| Hero desktop           | copy → trzy odpowiedzi → dokument leada | ta sama trójdzielna relacja, code-native |
| Początek paska desktop | około 562 px                            | około 562 px przy 1440 × 1000            |
| Pasek danych           | sześć liniowych pozycji                 | sześć pozycji bez kart i osobnego tła    |
| Dolna sekcja           | problem/porównanie + proces/mini-lead   | ta sama asymetryczna siatka z hairline   |
| Proof mobile           | dwie wąskie karty połączone poziomo     | układ zachowany przy 390 i 320 px        |
| Pasek mobile           | 3 × 2, opisy ukryte                     | 3 × 2, opisy ukryte, czytelne etykiety   |

Desktop używa jednego zwartego widoku: panel leada zaczyna się blisko górnej
krawędzi hero, odpowiedzi zbiegają się w centralnym znaku, a pasek danych
zamyka hero dokładnie przed dolną narracją. Mobile nie jest mechanicznym
stackiem. Zachowuje odpowiedzi i gotowy lead obok siebie, upraszczając wyłącznie
metadane i działania, których nie da się pokazać czytelnie w tej szerokości.

## Język wizualny

- ciepłe tło, białe powierzchnie, głęboka zieleń i jasny highlight korzystają
  wyłącznie z istniejących ról `@wyceno/ui`;
- promienie pozostają 4–12 px, a cienie występują tylko pod realnie uniesionym
  dokumentem lub kartą odpowiedzi;
- brak gradientów, blurów, blobów, glassmorphismu, wielkich ciemnych pasów,
  seryjnych badge’y i siatek dekoracyjnych kart;
- miniatury materiałów są prostym, code-native szkicem danych i nie ładują
  obrazu ani sztucznie wygenerowanego dashboardu;
- tekst interfejsu proofu pozostaje co najmniej 12 px.

## Ruch

Pierwszy widok ma krótką sekwencję: eyebrow, H1, opis, działania, microcopy i
proof. Highlight nagłówka odsłania się od lewej. Dalsze elementy pojawiają się
jednorazowo przy wejściu do viewportu. Czasy mieszczą się w 120–440 ms, bez
sprężyn, parallaxu, scroll-jackingu i animacji ciągłych. Wejścia używają ruchu
oraz skali poziomej highlightu bez zmiany opacity, dzięki czemu kontrast tekstu
pozostaje poprawny również w trakcie animacji.

Kontroler nie jest warunkiem widoczności treści. Bez JavaScriptu render pozostaje
kompletny. Reduced motion usuwa animacje, przejścia i transformacje. Fokus
ujawnia element przed interakcją.

## Działające cele

- „Zobacz przykładowy proces” przewija do sekcji procesu;
- „Sprawdź pilotaż” prowadzi do `/cennik`;
- headerowe „Zobacz demo” prowadzi do działającego demo mebli na wymiar;
- „Rozpocznij obsługę” prowadzi do logowania;
- pozostałe linki prowadzą do istniejących tras marketingowych.

Rail i znaki w proofie są jawnie dekoracyjne. Score ma rolę `progressbar`, a
figury informują, że pokazują dane demonstracyjne.

## Baseline i bramki

Zapisane baseline’y kadru header + hero + pasek danych:

- `marketing-home-hero-1440x1000.png`;
- `marketing-home-hero-1024x900.png`;
- `marketing-home-hero-768x1000.png`;
- `marketing-home-hero-390x844.png`;
- `marketing-home-hero-320x844.png`.

Testy blokują zmianę kolejności 10 rozdziałów i 11 proofów, tekst proofu poniżej
12 px, poziomy overflow, niedziałający skip link, focus trap, brak no-JS,
nieprawidłowy reduced motion, błędy axe, uszkodzone linki/canonical/robots oraz
przekroczenie 250 KiB JavaScriptu marketingowego. Baseline’y są celowo
ograniczone do zatwierdzonego pierwszego folda; pełna ścieżka Etapu 12F pozostaje
osobnym zakresem odbioru.

Końcowa weryfikacja lokalna:

- `pnpm format:check`, `pnpm lint` i `pnpm typecheck` — zielone;
- `pnpm test:unit` — 87 testów;
- pełne testy PostgreSQL/RLS i macierz WordPress — zielone;
- lokalny static/secret security scan — zielony;
- `pnpm e2e` — 23/23, w tym 12/12 dla marketingu;
- `pnpm build` — 37 tras, widget 15 903 B gzip.

Etap nie zmienia zależności. Dependency audit nie został ponownie wysłany do
rejestru npm, ponieważ środowisko zablokowało ujawnienie zewnętrznemu
rejestrowi grafu zależności; ostatni zatwierdzony wynik pozostaje zielony.

## Ryzyka i następny etap

Automaty i screenshoty nie zastępują ręcznego VoiceOver/NVDA, zoomu 200/400%
na rzeczywistych urządzeniach ani Core Web Vitals na docelowym hostingu.
Publiczny launch nadal blokują clearance nazwy, treści prawne oraz gate
Etapu 13. Etap 12E nie daje zgody na deployment.
