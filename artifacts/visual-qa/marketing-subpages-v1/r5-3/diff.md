# R5.3 — visual diff własności leadów `/dla-agencji`

## Status

**ACCEPTED / COMPLETE.** Właściciel zaakceptował etap 2026-08-04 poleceniem
„dalej”, wydanym po prezentacji finalnego renderu i gate'u R5.3.

## Przed

- krótki blok tekstowy bez powierzchni produktowej;
- własność danych i izolacja widgetu połączone w jednym artykule;
- brak aktywnej organizacji, ról i rzeczywistej macierzy uprawnień;
- brak widocznej granicy pomiędzy tenantem klienta a agencją wdrożeniową;
- serwerowe zabezpieczenia opisane abstrakcyjnie, bez związku z UI panelu.

## Po

- osobna sekcja „Granica danych” z wyraźnym komunikatem właścicielskim;
- panelowa powierzchnia aktywnej organizacji klienta;
- prawdziwa macierz Owner/Admin/Sales dla czterech operacji na leadach;
- jawny status agencji „poza organizacją domyślnie”;
- trzy warstwy izolacji: aktywna organizacja, `TenantContext` i RLS;
- dedykowany mobilny układ wierszy z etykietami ról;
- brak atrap kontrolek i nowych obietnic produktu;
- R5.1 i R5.2 zachowane, a zakres R5.4 jedynie strukturalnie oddzielony.

## Artefakty

- baseline: `before/dla-agencji-full-1440.png` i
  `before/dla-agencji-full-390.png`;
- finalne sekcje: `after/dla-agencji-ownership-*.png`;
- finalne pełne strony: `after/dla-agencji-full-1440.png` i
  `after/dla-agencji-full-390.png`;
- porównania: `compare/before-after-1440.png` i
  `compare/before-after-390.png`;
- dokładne pomiary: `after/metrics.json`.

## Pomiary końcowe

| Viewport |     Sekcja | Proof panelu | Min. tekst | Overflow | Błędy |
| -------: | ---------: | -----------: | ---------: | -------: | ----: |
|  1536 px |  974,33 px |    727,58 px |      12 px |     0 px |     0 |
|  1440 px |  958,95 px |    727,58 px |      12 px |     0 px |     0 |
|  1280 px |  933,36 px |    727,58 px |      12 px |     0 px |     0 |
|  1024 px | 1382,81 px |    721,61 px |      12 px |     0 px |     0 |
|   768 px | 1650,39 px |    961,80 px |      12 px |     0 px |     0 |
|   430 px | 1973,77 px |   1238,92 px |      12 px |     0 px |     0 |
|   390 px | 2030,98 px |   1238,92 px |      12 px |     0 px |     0 |
|   375 px | 2049,45 px |   1264,39 px |      12 px |     0 px |     0 |
|   320 px | 2064,36 px |   1301,86 px |      12 px |     0 px |     0 |

**Wynik wykonawczy: 20/20. Akceptacja właściciela: potwierdzona.**
