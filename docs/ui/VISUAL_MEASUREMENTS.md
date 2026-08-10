# Pomiary wizualne V6

**Status:** kanoniczne wartości startowe  
**Ostatni przegląd:** 2026-07-27

## Landing desktop 1536 px

- główny container: około 1424 px;
- boczne marginesy: około 44–56 px;
- header: około 72 px;
- hero: około 390 px copy / 250 px odpowiedzi / minimum 570 px lead;
- gapy hero: około 34 px;
- H1: około 48 px, line-height około 1.06;
- pasek danych: sześć równych regionów z hairline;
- demo: około 250 px kroki / elastyczny środek / 330 px live lead;
- branże: około 280 px indeks / elastyczny opis / 390 px preview.

Wartości są punktem pomiaru, nie zgodą na stałe wysokości dynamicznej treści.

## Produkt

- referencja v1: sidebar 208–224 px i topbar 72–80 px;
- najnowszy builder: około 80 px rail, oddzielna kolumna pytań, elastyczny
  preview i prawy inspector;
- controls: zwykle 32–44 px;
- promienie: 4/6/9/12 px;
- ikony: 16–20 px, stroke 1.5–1.8;
- border: 1 px;
- cienie: tylko subtelna warstwa dokumentu lub preview.

## Mobile

- źródłowy viewport: 390 × 844;
- minimalny viewport odbioru: 320 px;
- data strip: 3 × 2;
- dolna akcja: co najmniej 44 px i rezerwacja safe area;
- tekst proofu: minimum 12 px;
- pełny widget: jedna kolumna, bez skalowania desktopowego frame'u.

## Auth desktop — załączniki I/J

- źródłowa plansza I: 1536 × 1024 px, lokalnie jako
  `apps/web/public/ekranylogowania.png`;
- pojedyncza trasa z wzorca J: 2048 × 1157 px;
- delikatna biała oprawa: około 12–24 px zależnie od viewportu;
- wysokość głównego shella:
  `100svh - górna oprawa - dolna oprawa`;
- proporcja kolumn wspólnego shella: `31% / 39% / 30%`;
- granice kolumn przy 2048 px: około `x=632` i `x=1433`;
- zewnętrzny radius: około 12–14 px;
- kontrolki desktop 46–56 px; bez mechanicznego skalowania do 76 px;
- ikony kontrolek około 17–20 px, ikony benefitów około 20–23 px;
- nagłówki paneli około 24–30 px;
- końcowa grupa rejestracji zachowuje 14–20 px między zgodą, CTA, separatorem
  i Google;
- panel formularza: około 6,5% wysokości viewportu od góry;
- panel korzyści: około 8% wysokości viewportu od góry;
- sekcja cech zaczyna się na lub poniżej `y=100svh`;
- mobile zwiększa cele dotykowe do co najmniej 44 px bez mechanicznego
  skalowania desktopowego shella.

Oryginał planszy i jego SHA są zablokowane. Lokalne zrzuty implementacji,
overlay i diff pozostają wymagane przed użyciem tolerancji pixel-perfect.
Pełny zapis: `AUTH_REFERENCE_ANALYSIS_2026-07-27.md`.

## Kolory referencyjne

- papier: `#faf9f6` / `#f7f6f2`;
- powierzchnia: `#ffffff`;
- tekst: `#17201d`;
- tekst pomocniczy: okolice `#68736d`;
- border: okolice `#e3e1da`;
- głęboka zieleń: `#0a4e36` / `#073f2c`;
- świeża zieleń: wyłącznie sukces, aktywny stan lub niewielki akcent.

Implementacja pobiera role z `packages/ui`; nie tworzy lokalnych tokenów na
podstawie tych wartości.
