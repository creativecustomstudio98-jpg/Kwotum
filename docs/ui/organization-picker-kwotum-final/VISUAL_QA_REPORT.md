# Visual QA — finalny wybór organizacji Kwotum

**Wynik:** PASS, 19/20
**Viewport referencyjny:** 1536 × 1024
**Viewport mobile:** 390 × 844

| Kryterium                 | Punkty | Uzasadnienie                                                                              |
| ------------------------- | -----: | ----------------------------------------------------------------------------------------- |
| Kompletność kompozycji    |    4/4 | Nagłówek, panel wprowadzający, korzyści, pomoc, toolbar, search i lista są obecne.        |
| Geometria i osie          |    4/4 | E2E mierzy 80 px, 484 px, 376 × 50 px, 934 px, 62 px i 111 px.                            |
| Typografia i hierarchia   |    4/4 | Instrument Sans, dwuwierszowy tytuł, gęstość nagłówków i metadane odpowiadają referencji. |
| Kolor i powierzchnie      |    4/4 | Fiolet referencji został świadomie zmapowany na istniejącą paletę zieleni Kwotum.         |
| Transformacja responsywna |    3/4 | Mobile ma osobną, dostępną transformację; nie dostarczono osobnej referencji mobile.      |

Różnice obrazu wynikają z jawnych ograniczeń produktu: screenshot referencyjny
ma pięć przykładowych organizacji, a render QA pokazuje jeden jednorazowy tenant
z rzeczywistą rolą `owner`, statusem `active`, slugiem i aktywnością. Nie
kopiowano fikcyjnych nazw, domen, ról ani dat.

## Artefakty

- `artifacts/visual-qa/12zn-organization-picker/reference-1536x1024.png`;
- `before-desktop-1536x1024.png` — poprzedni ekran z tego samego commita bazowego;
- `after-desktop-1536x1024.png` — finalny render produkcyjny;
- `after-mobile-390x844.png` — pełna transformacja mobile;
- `overlay-reference-after-1536x1024.png`;
- `difference-reference-after-1536x1024.png`;
- `difference-before-after-1536x1024.png`.

E2E potwierdził brak overflow przy 320/375/390/430/768/1024/1280/1440/1536 px,
działający submit wyszukiwarki, fokus wiersza, poprawny href, pusty wynik oraz
zerową liczbę naruszeń axe. Pierwszy przebieg wykrył kontrast 3,33:1 etykiet
mobile; kolor został skorygowany, a test powtórzony bez wyłączenia reguły.
