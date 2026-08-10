# PROMPT 10 — SZABLONY, INSTALACJA I WORDPRESS


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Zamknąć ścieżkę od wyboru sprawdzonego procesu do jego realnego uruchomienia na stronie.

## Referencje

- `reference/screenshots/templates-desktop.png`,
- `reference/screenshots/installation-desktop.png`,
- `reference/boards/board-03-growth-delivery.png`.

## A. Szablony

Biblioteka ma pokazywać realną zawartość:

- branża,
- liczba pytań,
- liczba reguł,
- warianty wyniku,
- status Gotowy/Beta,
- zobacz proces,
- użyj szablonu.

Szablon kopiowany jest jako niezależny draft organizacji. Nie edytuj źródła globalnego.

Obowiązkowe branże:

- meble na wymiar,
- ogrodzenia i bramy,
- strony internetowe,
- klimatyzacja,
- remonty i wykończenia.

Nie używaj pustych stockowych kart. Obraz jest drugorzędny wobec struktury procesu.

## B. Instalacja

Tryby:

- inline,
- popup,
- fullscreen,
- hosted link,
- WordPress.

Ekran pokazuje:

- status publikacji,
- publiczny identyfikator,
- allowlist domen,
- kod instalacyjny,
- trigger button,
- diagnostykę,
- test,
- ostatni heartbeat/event widgetu.

Kod jest kopiowalny, ale sekrety nie trafiają do frontendu.

## C. WordPress

Wtyczka jest konektorem, nie kopią SaaS.

Panel SaaS:

- status połączenia,
- domena,
- wersja pluginu,
- lista flow,
- token instalacyjny/OAuth-like flow,
- diagnostyka,
- odłączenie.

Wtyczka:

- ekran połączenia,
- wybór flow,
- shortcode,
- Gutenberg block,
- popup trigger,
- status,
- diagnostyka,
- bezpieczne odłączenie.

Shortcode/komponenty muszą używać aktualnego public ID. Nie przenoś logiki pricing do WordPressa.

## D. Done-for-you

Konfiguracja wdrożeniowa może być przedstawiona jako rzeczowa opcja, nie marketingowy banner. Musi jasno opisywać zakres i CTA.

## QA

- nieopublikowany flow,
- niedozwolona domena,
- błędny ID,
- podwójne załadowanie,
- wygasły token WP,
- plugin offline,
- różne motywy CSS,
- inline/popup/fullscreen,
- Core Web Vitals,
- keyboard widget.

## Gate

- realny szablon można skopiować i opublikować,
- kod osadzenia działa,
- diagnostyka daje konkretny wynik,
- WP nie ujawnia sekretu,
- visual QA zakończone,
- zatrzymaj się.
