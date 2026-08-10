# PROMPT 14 — ONBOARDING I PUBLICZNY WIDGET


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Doprowadzić użytkownika od pustego konta do pierwszego opublikowanego i przetestowanego procesu oraz zapewnić klientowi końcowemu profesjonalne przejście mobile-first.

## Referencje

- `reference/screenshots/onboarding-desktop.png`,
- `reference/screenshots/onboarding-mobile.png`,
- `reference/screenshots/widget-desktop.png`,
- `reference/screenshots/widget-mobile.png`,
- `reference/screenshots/widget-result-desktop.png`,
- `reference/boards/board-04-system-onboarding.png`,
- `reference/boards/board-05-mobile-suite.png`.

## A. Onboarding

Kroki:

1. organizacja,
2. branża i obszar,
3. wybór: szablon / od zera / zamów konfigurację,
4. branding,
5. test i publikacja,
6. instalacja.

Wymagania:

- zapis postępu,
- możliwość pominięcia tam, gdzie bezpieczna,
- powrót bez utraty danych,
- realistyczny szablon,
- jeden jasny następny krok,
- checklista uruchomienia,
- bez marketingowej karuzeli.

## B. Widget

### Struktura

- branding firmy,
- krok/progress,
- jedno pytanie,
- helper,
- odpowiedzi,
- back/next,
- privacy line,
- autosave.

### Typy

Zrenderuj wszystkie wspierane typy kroków z jednego silnika. Nie twórz osobnej wersji demo, która różni się od produkcji.

### Kontakt i zgody

- label,
- walidacja,
- osobne zgody,
- brak prechecked consent,
- jasna polityka,
- Turnstile w odpowiednim momencie,
- submit idempotentny.

### Wynik

- jasne potwierdzenie,
- orientacyjna cena/przedział/od/brak,
- najważniejsze odpowiedzi,
- disclaimer,
- kolejny krok,
- CTA termin/kontakt,
- numer zapytania,
- możliwość powrotu tylko zgodnie z logiką.

## C. Embed

- inline,
- popup,
- fullscreen,
- hosted,
- Shadow DOM lub równoważna izolacja,
- lazy load,
- brak globalnego CSS,
- stabilna wysokość,
- brak znaczącego wpływu na CWV.

## D. Stany

- odświeżenie,
- autosave restore,
- offline,
- upload progress/error,
- invalid file,
- flow unpublished/archived,
- outside service area,
- no price,
- server calculation error,
- duplicate submit,
- expired session,
- reduced motion,
- keyboard-only.

## QA

- 375/390 px,
- iOS safe area,
- keyboard visible,
- screen reader,
- slow 3G,
- host CSS collision,
- double load,
- back/refresh,
- E2E pełnej ścieżki do leada i e-maila.

## Gate

- onboarding kończy się realnym procesem,
- widget korzysta z produkcyjnego silnika,
- lead powstaje raz,
- wynik jest server-confirmed,
- mobile odpowiada referencji,
- zatrzymaj się.
