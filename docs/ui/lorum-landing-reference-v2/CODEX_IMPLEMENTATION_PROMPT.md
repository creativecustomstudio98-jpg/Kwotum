# Prompt implementacyjny do Codexa


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

Przeczytaj w całości:

- `AGENTS.md`,
- istniejącą dokumentację projektu,
- `docs/ui/lorum-landing-reference-v2/LORUM_LANDING_VISUAL_SPEC.md`,
- `docs/ui/lorum-landing-reference-v2/index.html`,
- `docs/ui/lorum-landing-reference-v2/styles.css`.

Obejrzyj:

- `docs/ui/lorum-landing-reference-v2/screenshots/lorum-landing-desktop-full.png`,
- `docs/ui/lorum-landing-reference-v2/screenshots/lorum-landing-mobile-full.png`,
- wszystkie pliki `lorum-board-*-desktop.png`,
- wszystkie pliki `lorum-board-*-mobile.png`.

## Cel

Przenieś zamknięty, zaakceptowany wygląd landingu Lorum do istniejącej aplikacji.

Nie projektujesz nowego landingu. Nie interpretujesz referencji. Nie dodajesz własnych sekcji, kart, dekoracji, animacji ani copy.

Aktualny interfejs aplikacji nie jest źródłem stylistycznym. Zachowaj z niego wyłącznie:

- routing,
- dane,
- logikę biznesową,
- integracje,
- istniejące funkcjonalne komponenty, jeżeli można je przestylować bez regresji.

## Etap 0 — audyt, bez implementacji

Najpierw utwórz:

`docs/ui/LANDING_IMPLEMENTATION_AUDIT.md`

Dokument ma zawierać:

1. obecną trasę strony głównej,
2. komponenty każdej istniejącej sekcji,
3. pliki CSS i tokeny,
4. elementy logiki, których nie wolno zmienić,
5. listę komponentów do zachowania, przestylowania, przepisania i usunięcia,
6. mapę docelowych 15 sekcji,
7. listę plików przewidzianych do zmiany,
8. plan wdrożenia w czterech milestone’ach zgodnych z planszami,
9. ryzyka regresji,
10. komendy walidacyjne.

Nie zmieniaj kodu przed zatwierdzeniem audytu.

## Milestone 1

Zakres wyłącznie:

- navigation,
- hero,
- pasek zbieranych danych,
- problem kontra rezultat,
- Jak działa.

Źródła prawdy:

- `lorum-board-1-desktop.png`,
- `lorum-board-1-mobile.png`.

Po implementacji:

- lint,
- typecheck,
- test,
- build,
- screenshot 1536 px,
- screenshot 390 px,
- lista pięciu największych różnic,
- druga iteracja poprawek,
- stop.

## Milestone 2

Zakres wyłącznie:

- interaktywne demo,
- szablony branżowe.

Źródła prawdy:

- `lorum-board-2-desktop.png`,
- `lorum-board-2-mobile.png`.

Ta sama procedura QA i stop.

## Milestone 3

Zakres wyłącznie:

- funkcje jako sekwencja,
- WordPress,
- dla agencji,
- dowody.

Źródła prawdy:

- `lorum-board-3-desktop.png`,
- `lorum-board-3-mobile.png`.

Ta sama procedura QA i stop.

## Milestone 4

Zakres wyłącznie:

- cennik,
- FAQ,
- final CTA,
- footer.

Źródła prawdy:

- `lorum-board-4-desktop.png`,
- `lorum-board-4-mobile.png`.

Ta sama procedura QA i stop.

## Twarde zasady

- Widoczna marka: Lorum.
- Nie dodawaj zależności bez zgody.
- Nie zmieniaj logiki produktu ani API.
- Nie używaj gotowego wyglądu shadcn/ui.
- Nie twórz lokalnych wyjątków od tokenów.
- Nie stosuj gradientów dekoracyjnych, glassmorphismu, neonów, glow, losowych kart, wielkich promieni i ikon w kolorowych kafelkach.
- Nie zamieniaj demo na statyczny laptop lub telefon.
- Nie wymyślaj finalnych cen, wyników klientów ani social proof.
- Mobile jest osobnym layoutem, nie desktopem ściśniętym do 390 px.

## Format raportu po każdym milestone

### Wykonano

### Zmienione pliki

### Zachowana logika

### Komendy i wyniki

### Screenshoty

### Pięć największych różnic względem referencji

### Poprawki drugiej iteracji

### Nierozwiązane ryzyka

### Stop — oczekiwanie na akceptację
