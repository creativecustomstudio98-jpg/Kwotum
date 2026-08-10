# Audyt referencji panelu Lorum

**Status:** aktywny kontrakt rekonstrukcji Etapu 12A  
**Data audytu:** 2026-07-27  
**Zakres:** panel aplikacji; bez marketingu, auth, widgetu, API, migracji i deploymentu

## 1. Zasada interpretacji

Obrazy w `apps/web/public/panel/` oraz główna plansza
`references/product-app-board.png` są specyfikacją kompozycji, gęstości i
hierarchii. Nie są assetami produkcyjnego UI. Nowsze pełne ekrany mają
pierwszeństwo przed miniaturami z plansz. Widoczna marka pozostaje **Lorum**
zgodnie z ADR-024.

Obraz nie zatwierdza funkcji poza MVP. W szczególności:

- graf node-based pozostaje poza zakresem zgodnie z `SCOPE.md`,
  `NON_GOALS.md` i `UI_SCREEN_SPEC.md`;
- opiekun, planowanie działania i źródło leada nie są aktywnymi polami, dopóki
  nie istnieją w modelu danych i autoryzacji;
- dashboard korzysta wyłącznie z rzeczywistych danych lub jawnego empty state;
- pricing, score, tenant scope, role i RLS pozostają bez zmian.

## 2. Inwentarz źródeł

| Plik                                       | Rozmiar natywny | SHA-256            | Priorytet i zakres                                                             |
| ------------------------------------------ | --------------: | ------------------ | ------------------------------------------------------------------------------ |
| `ChatGPT Image 26 lip 2026, 18_28_24.png`  |     1448 × 1086 | `918e0d8e…a68a526` | pełny builder: rail, toolbar, lista, preview, inspector                        |
| `ChatGPT Image 26 lip 2026, 18_25_28.png`  |     1448 × 1086 | `703c33ba…ed41cd`  | pełny lead operacyjny                                                          |
| `references/product-app-board.png`         |     1536 × 1024 | `df3c7894…a31101`  | lista leadów, procesy, szablony, analityka, integracje, ustawienia i prymitywy |
| `42114905-a89b-4b72-b59e-383662af41ae.png` |     1536 × 1024 | `33d06d66…537e7`   | dashboard, kompaktowy lead detail i mobile                                     |

Cropy kontrolne znajdują się w
`artifacts/visual-qa/12a-panel-reconstruction/reference-crops/`. Są materiałem
QA, a nie częścią interfejsu.

## 3. Pomiary wspólnego języka

Wartości są mierzalnym punktem startowym. Tolerancje końcowe pozostają zgodne z
`VISUAL_QA.md`: kontrolki ±2 px, kluczowe odstępy ±4 px, proporcje kolumn do
3%.

| Element                         | Pomiar lub relacja                                          |
| ------------------------------- | ----------------------------------------------------------- |
| Rail desktop                    | 78–80 px, pełna wysokość viewportu                          |
| Topbar pełnych ekranów          | 84–86 px                                                    |
| Zewnętrzny padding roboczy      | 20–24 px                                                    |
| Główne odstępy modułów          | 16–20 px                                                    |
| Border                          | 1 px, chłodna szaro-zieleń                                  |
| Card radius                     | 6–9 px                                                      |
| Control radius                  | 5–7 px                                                      |
| Wysokość standardowej kontrolki | 40–44 px                                                    |
| Wysokość kompaktowej kontrolki  | 32–36 px                                                    |
| Wiersz tabeli                   | około 44–52 px                                              |
| Ikona podstawowa                | 18–20 px, stroke około 1.5 px                               |
| Avatar                          | 28–36 px; 40 px w kontekście osoby                          |
| Body panelu                     | 13–14 px                                                    |
| Label/metadata                  | 11–13 px                                                    |
| Section heading                 | 15–18 px, 600                                               |
| Page heading                    | 22–28 px, 600                                               |
| KPI                             | 24–30 px, 600–700                                           |
| Cień                            | brak albo bardzo delikatna warstwa; separację tworzy border |

Najczęstsze kolory z obrazów:

- powierzchnia robocza: około `#F9F9F9`–`#FDFCFB`;
- biała powierzchnia: `#FFFFFF`;
- głęboka zieleń raila: około `#013B21`–`#083A2A`;
- tekst: prawie czarny, neutralny;
- subtelne obramowanie: około `#D9DEDB`;
- jasna zieleń statusu/active: desaturowana, bez neonów.

Implementacja używa semantycznych tokenów `packages/ui`; lokalne kolory w
panelu są niedozwolone.

## 4. Pełny builder — analiza ekranu

**Źródło:** `ChatGPT Image 26 lip 2026, 18_28_24.png`  
**Viewport:** 1448 × 1086

### Geometria

- rail: `x=0–78`;
- topbar: `y=0–85`, od prawej krawędzi raila do viewportu;
- lista sekcji i pytań: `x≈78–438`, szerokość około 360 px;
- preview: `x≈438–1019`, szerokość około 581 px;
- inspector: `x≈1019–1448`, szerokość około 429 px;
- trzy główne kolumny mają własne granice i niezależne przewijanie;
- centralna karta formularza ma około 464 px szerokości i nie rozciąga się do
  krawędzi kolumny.

### Regiony

1. Toolbar zawiera kontekst procesu, status szkicu, status zapisu oraz
   działania cofnięcia, podglądu i publikacji.
2. Lewa lista używa zwartych sekcji, numeracji, ikon typu, drag handle,
   licznika i menu. Aktywny wiersz ma subtelną zieloną powierzchnię.
3. Preview pokazuje nazwę regionu, krok, segmentowy progress, prawdziwy
   formularz, helper text i dolne akcje.
4. Inspector jest gęstym formularzem: typ pytania, required, opcje, helper,
   walidacja i logika warunkowa.

### Zachowanie

- desktop: trzy kolumny bez przewijania całego dokumentu;
- tablet: lista i preview mogą pozostać obok siebie, inspector przechodzi w
  panel zadaniowy;
- mobile: trzy jawne tryby `Pytania`, `Podgląd`, `Ustawienia`, nigdy
  pomniejszony desktop;
- brak grafu node-based; kolejność kroków ma dostępne akcje alternatywne do
  przeciągania.

## 5. Lead operacyjny — analiza ekranu

**Źródło:** `ChatGPT Image 26 lip 2026, 18_25_28.png`  
**Viewport:** 1448 × 1086

### Geometria

- rail: `x=0–78`;
- topbar: `y=0–84`;
- główna zawartość: od `x≈102` do `x≈1069`;
- przerwa kolumn: około 20 px;
- prawy panel: `x≈1089–1430`, około 341 px;
- outer padding: około 20–24 px;
- pionowy rytm kart: około 18–20 px.

### Regiony główne

1. Nagłówek firmy/kontaktu z rzeczywistym statusem, procesem, danymi kontaktu i
   główną akcją.
2. Zakres zapytania: opis po lewej i uporządkowane parametry po prawej.
3. Równorzędne moduły budżetu, terminu i lokalizacji.
4. Załączniki jako zwarte elementy pliku, nie osobne duże karty.
5. Dopasowanie: duży score i lista serwerowych powodów.

### Prawy panel

Referencja pokazuje opiekuna, kolejny krok, termin, źródło, notatki i aktywność.
Aktualny model Lorum wspiera status, notatki, historię, zgody i powiadomienia.
Te realne dane zajmują tę samą operacyjną hierarchię; brakujące pola nie są
pozorowane.

### Mobile

Kolejność: kontakt i status → wynik → odpowiedzi → pliki → powody → akcja
statusu → notatki → historia i prywatność. Główna akcja może być sticky tylko
z zarezerwowanym miejscem i safe-area.

## 6. Lista leadów

**Źródło:** `references/product-app-board.png`  
**Crop:** `leads-list.png`, 483 × 301 z planszy 1536 × 1024

- rail zajmuje około 14% szerokości cropa;
- nagłówek i toolbar są niskie;
- filtry są tekstowymi zakładkami z licznikiem i cienkim aktywnym underline;
- tabela ma osiem logicznych kolumn, wiersze około 28 px w skali cropa;
- score jest wyrównany numerycznie, status ma mały badge;
- paginacja jest wycentrowana pod tabelą;
- mobile zmienia tabelę w zwartą listę z jawnymi etykietami.

Docelowe dane Lorum: kontakt, proces, wynik orientacyjny, score, status i czas
wysłania. Pola budżetu/terminu mogą być wyprowadzane wyłącznie z rzeczywistych
odpowiedzi, nie z domysłu.

## 7. Dashboard i analityka

### Dashboard

**Źródło:** `42114905-a89b-4b72-b59e-383662af41ae.png`  
**Crop:** `dashboard.png`, 544 × 425

- wąski rail;
- selektor okresu w prawym górnym rogu;
- cztery jednakowe KPI;
- trend leadów i jakość zajmują jeden wspólny wiersz;
- lista najnowszych leadów ma wyższy priorytet niż dekoracyjne wykresy.

Wartości muszą pochodzić z bezpiecznego agregatu lub realnej listy leadów.
Próg małej próby pozostaje widoczny jako empty state.

### Analityka

**Źródło:** `references/product-app-board.png`  
**Crop:** `analytics.png`, 483 × 223

- cztery KPI, zakres dat, trend i rozkład jakości;
- blade zielone słupki, ciemna zieleń dla kluczowego wyniku;
- legenda jest tekstowa;
- źródła, urządzenia i drop-off z obecnej implementacji pozostają, ale używają
  tej samej zwartej powierzchni.

## 8. Kompaktowy lead detail

**Źródła:** `lead-detail-board.png` 544 × 319 i
`lead-detail-compact.png` 405 × 301

- powrót, osoba, identyfikator, czas i score tworzą jeden zwarty header;
- tabs dzielą podsumowanie, odpowiedzi, pliki i historię;
- podsumowanie jest listą definicji z ikoną i hairline;
- notatka, status i primary action tworzą boczny obszar operacyjny;
- pełny ekran leada ma pierwszeństwo dla proporcji, kompaktowe cropy dla
  typografii, zakładek i gęstości.

## 9. Integracje, ustawienia i prymitywy

### Integracje

**Crop:** `integrations.png`, 257 × 224

Każda integracja jest jednym wierszem z ikoną, nazwą i realnym statusem.
WordPress pozostaje działającą integracją. Nie tworzymy wielkich kafli ani
fikcyjnych połączeń.

### Profil i powiadomienia

**Cropy:** `company-settings.png` 318 × 224 oraz
`notification-settings.png` 386 × 224

Plansza definiuje gęstość form, wysokości pól i układ toggle’i. Obecny model
udostępnia prywatność/retencję, a nie kompletny profil i preferencje
powiadomień. Referencja steruje stylem istniejących ustawień; brakujące
mutacje pozostają jawnie w gap analysis.

### Design system

**Crop:** `design-system.png`, 1496 × 132

Prymitwy mają małe promienie, border 1 px, neutralne surface, zwarte buttony,
inputy, selecty, statusy i paginację. Ikony są liniowe i spójne. Panel korzysta
z `packages/ui`; nie powstaje lokalny konkurencyjny system tokenów.

## 10. Świadome odstępstwa

1. Marka Lorum zamiast historycznego Wyceno.
2. Brak grafu node-based — funkcja poza MVP.
3. Brak opiekuna, kalendarza i źródła leada, dopóki nie istnieją w modelu.
4. Brak fikcyjnych KPI i „Nowy lead”; lead powstaje z bezpiecznego widgetu.
5. Role, prywatność, retencja i powiadomienia zachowują istniejącą, bogatszą
   logikę nawet wtedy, gdy plansza pokazuje prostszy stan.

Te odstępstwa chronią poprawność funkcji i bezpieczeństwo; nie uzasadniają
luźnej interpretacji geometrii.
