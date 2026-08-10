# Visual QA — lista Procesy / Formularze

**Data:** 2026-07-29  
**Viewporty aplikacji:** 1536 × 1024 i 390 × 844  
**Referencja:** `references/product-app-board.png`, crop `925,82,328,310`

## Kontrakt obrazu

- wspólny sidebar Lorum pozostaje poza zakresem korekty;
- ekran ma pięć zwartych wierszy w jednej lekkiej powierzchni;
- każdy wiersz zachowuje układ: nazwa i metadane → status → data;
- brak nagłówka tabeli, technicznego sluga i dokładnej godziny;
- dolna część powierzchni zachowuje referencyjny oddech;
- na mobile te same dane mieszczą się bez poziomego przewijania.

## Iteracje

### Before

Klasyczna tabela rozciągała sześć kolumn na 1280 px, dodawała techniczne slugi,
nagłówek tabeli, osobną ikonę edycji i dokładny czas. Gęstość oraz anatomia
nie odpowiadały planszy produktu.

### After v1

Tabela została zastąpiona listą pięciu pełnowierszowych linków. Prawdziwe
tenantowe dane zachowały liczbę pytań, wersję, publikację i datę, a warstwa
wizualna otrzymała referencyjne obramowania, statusy i odstępy.

### After v2

Usunięto licznik nieobecny na referencji i dopasowano dolny oddech powierzchni:
82 px po ostatnim wierszu przy 1536 × 1024. Wiersz ma 66,4 px, odstęp 8 px,
a dokument nie ma poziomego overflow.

### Korekta właściciela

Usunięto osobny topbar `Konfiguracja / Procesy / 5 procesów`, który nie
występował w referencji. Tytuł ma 12,8 px i znajduje się bezpośrednio w karcie,
a działające CTA `+ Nowy proces` ma 100 × 28 px. Usunięto limit 78 rem:
powierzchnia ma teraz 1280 px w obszarze roboczym 1328 px i zachowuje tylko
24 px marginesu strony.

Overlay i difference są znormalizowane do wymiarów cropa 328 × 310 i obejmują
teraz tytuł, CTA oraz całą powierzchnię listy. Wspólny sidebar jest oceniany
w pełnym renderze. Nazwy, daty i statusy nie są kopiowane z makiety: pozostają
prawdziwymi danymi lokalnego tenanta.

## Ocena

| Kryterium                         |     Wynik |
| --------------------------------- | --------: |
| Anatomia pięciu wierszy           |       4/4 |
| Hierarchia, rytm i dolny oddech   |       4/4 |
| Kolory, obramowania i statusy     |       4/4 |
| Responsive 390 px i brak overflow |       4/4 |
| Funkcja, klawiatura i WCAG        |       3/4 |
| **Razem**                         | **19/20** |

## Artefakty

- `reference.png`
- `before-1536x1024.png`, `before-normalized.png`
- `after-v2-1536x1024.png`, `after-v2-390x844.png`
- `after-v2-production-1536x1024.png`, `after-v2-production-390x844.png`
- `after-v2-normalized.png`, `overlay-v2.png`, `difference-v2.png`
- `reference-left-after-v2-right.png`

Pliki v1 i trzy developerskie korekty przeniesiono do odzyskiwalnego Kosza po
zapisaniu decyzji powyżej; finalny zestaw pozostaje kompletny.
