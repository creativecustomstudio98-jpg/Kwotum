# Visual QA — Etap 12Z

## Zakres

- ekran: `/panel/[organizationId]/procesy/[flowId]`;
- zmieniany region: lewa kolumna sekcji i pytań;
- referencja:
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`;
- czysty render produkcyjny:
  `after/desktop/section-management-1448x1086.png`;
- dodatkowe stany:
  `section-rename-1448x1086.png` i
  `section-delete-dialog-1448x1086.png`;
- responsive: 768 × 1024 i 390 × 844.

## Wynik

PASS — 19/20:

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość danych i stany: 4/4;
- transformacja mobile: 3/4, ponieważ nie dostarczono osobnej referencji
  mobilnej.

Overlay zachowuje wspólne osie referencji: rail kończy się przy 78 px, lista
przy 438 px, preview przy 1020 px, a inspektor przy 1448 px. Toolbar ma 85 px,
centralna karta oraz jej pionowa oś nie przesunęły się względem Etapu 12W.

## Największe różnice

1. Marka pozostaje Lorum zgodnie z nowszą decyzją właściciela.
2. Nazwa i liczba kroków wynikają z realnego syntetycznego procesu QA.
3. Lista ma pięć sekcji po dodaniu testowej sekcji zamiast czterech sekcji
   referencji.
4. Aktywne pytanie jest nowo utworzonym krokiem, dlatego preview pokazuje
   dwie domyślne opcje.
5. Prawy inspektor zachowuje działające walidacje i logikę z etapów 12X–12Y,
   zamiast statycznej zawartości obrazu.
6. Toolbar pokazuje rzeczywistą rewizję i stan autosave.
7. Wspólny sidebar ma aktualne ikony Lorum i prawdziwe trasy.
8. Nagłówki sekcji mają działające menu oraz przyciski zwijania, więc cele
   interakcji są nieco wyraźniejsze niż na obrazie.
9. Inline rename celowo pokazuje focus ring i akcje zatwierdź/anuluj.
10. Usunięcie używa modalnego dialogu bezpieczeństwa, którego referencja nie
    przedstawia.

Różnice 1–7 są treściowe lub wynikają z nowszych decyzji produktu. Różnice
8–10 są wymaganymi, działającymi stanami zadaniowymi. Nie zmieniają
zatwierdzonej geometrii trzech kolumn.

## Gate funkcjonalny

- izolowany Playwright: 1/1;
- jednostkowe operacje sekcji: 7 scenariuszy;
- pełny pakiet web po zmianie: 23 pliki / 80 testów;
- pełny monorepo: 141 testów jednostkowych, PostgreSQL/RLS i WordPress;
- kanoniczny Playwright: 34/34, 14 warunkowych testów panelu pominiętych bez
  danych logowania;
- lint i typecheck: 8/8 pakietów; build: 8/8 pakietów i 39 tras;
- SAST oraz skan sekretów: PASS;
- axe desktop i mobile: zero naruszeń;
- poziomy overflow 1448/768/390: maksymalnie 1 px tolerancji;
- fixture został przywrócony przez undo, a tymczasowy lokalny użytkownik QA
  i członkostwo zostały usunięte.
