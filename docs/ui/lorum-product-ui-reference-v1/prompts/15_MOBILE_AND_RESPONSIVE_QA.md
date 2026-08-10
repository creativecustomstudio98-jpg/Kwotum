# PROMPT 15 — GLOBALNY MOBILE I RESPONSIVE QA


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

Nie projektuj nowych funkcji. Ten etap służy przeglądowi wszystkich ukończonych modułów.

## Cel

Usunąć przypadki, w których desktop został tylko zwężony, oraz potwierdzić kompletność tablet/mobile.

## Referencje

- `reference/boards/board-05-mobile-suite.png`,
- wszystkie pliki `*-mobile.png`,
- `docs/04_RESPONSIVE_RULES.md`.

## Ekrany obowiązkowe

- dashboard,
- leady,
- szczegóły leada,
- procesy,
- builder,
- reguły,
- analityka,
- szablony,
- instalacja,
- integracje,
- agency,
- ustawienia,
- onboarding,
- widget,
- wynik,
- auth/system states.

## Dla każdego ekranu odpowiedz

1. Co jest priorytetem na mobile?
2. Co zostało przeniesione do drawer/menu?
3. Gdzie znajduje się główna akcja?
4. Czy jest sticky?
5. Czy użytkownik może wykonać główny JTBD jedną ręką?
6. Czy klawiatura zasłania pole/CTA?
7. Czy istnieje poziomy scroll?
8. Czy statusy i dane są czytelne przy 200% zoom?
9. Czy touch targety są wystarczające?
10. Czy nawigacja i back behavior są spójne?

## Viewport matrix

- 320 px sanity check,
- 375×812,
- 390×844,
- 430×932,
- 768×1024,
- landscape mobile dla widgetu.

## QA

- Safari iOS lub emulacja,
- Chrome Android lub emulacja,
- keyboard only,
- screen reader smoke,
- reduced motion,
- high contrast/forced colors smoke,
- long Polish copy,
- długie e-maile/nazwy firm,
- empty/error/loading.

## Naprawa

Naprawiaj systemowo. Jeżeli ten sam problem występuje w 6 ekranach, popraw komponent/token/layout primitive, nie sześć lokalnych wyjątków.

## Gate

- brak krytycznego overflow,
- wszystkie JTBD wykonalne,
- builder ma drill-down,
- tabela leadów jest listą,
- sticky actions nie zasłaniają treści,
- screenshoty wszystkich widoków,
- zatrzymaj się.
