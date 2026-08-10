# PROMPT 01 — AUDYT REPOZYTORIUM I FREEZE UI


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

STOP. Nie zmieniaj jeszcze TSX, JSX, CSS, routingu, bazy ani logiki.

## Cel

Zbudować kompletną mapę istniejącej aplikacji przed kontrolowaną przebudową UI Lorum i zamrozić zakres funkcjonalny, którego nie wolno przypadkowo uszkodzić.

## Źródła

Przeczytaj:

- `AGENTS.md`,
- `package.json` i pliki workspace,
- strukturę aplikacji i pakietów,
- aktualne dokumenty,
- middleware/auth,
- API/routes/server actions,
- schemat bazy i migracje,
- komponenty UI,
- globalne i modułowe CSS,
- testy,
- `docs/ui/lorum-product-ui-reference-v1/docs/*`,
- wszystkie plansze `reference/boards/*`.

## Wykonaj role

### Product Lead

- zmapuj główną pętlę: proces → publikacja → widget → wynik → lead → obsługa → analityka,
- wskaż, które fragmenty już działają, są częściowe albo są atrapą,
- nie oceniaj wyglądu ogólnikami.

### UX Architect

- zmapuj trasy i ekrany,
- przypisz je do inwentarza z `docs/02_SCREEN_INVENTORY.md`,
- wskaż brakujące stany i nieciągłości flow.

### Visual Lead

- znajdź konkretne źródła obecnego AI-looku,
- wskaż plik, komponent, klasę/token i objaw,
- odróżnij problem systemowy od pojedynczego komponentu.

### Frontend Lead

- zmapuj komponenty współdzielone,
- określ, które można zachować logicznie, które przepisać prezentacyjnie, a które usunąć,
- wskaż zależności i ryzyko regresji.

### QA

- znajdź istniejące komendy lint/typecheck/test/build/e2e,
- zidentyfikuj testy krytycznej ścieżki,
- ustal sposób uruchomienia aplikacji i seed/demo tenant,
- wykonaj baseline screenshoty bez zmian kodu.

### Documentation Curator

- zinwentaryzuj wszystkie dokumenty,
- sklasyfikuj wstępnie KEEP / REPLACE / MERGE / ARCHIVE / DELETE,
- nie przenoś ani nie usuwaj jeszcze plików.

## Utwórz wyłącznie dokumenty audytowe

```text
docs/_migration/UI_REBUILD_AUDIT.md
docs/_migration/UI_DOC_INVENTORY.md
docs/_migration/UI_BASELINE_SCREENSHOTS.md
docs/_migration/UI_PROTECTED_BEHAVIOR.md
```

## Wymagany format problemu

Każdy problem opisz:

```text
miejsce
→ obecny stan
→ stan docelowy
→ odpowiedzialny plik/komponent
→ ryzyko
→ sposób walidacji
```

Zakazane sformułowania bez konkretu:

- „poprawić spacing”,
- „zrobić premium”,
- „ujednolicić karty”,
- „ulepszyć UX”,
- „odświeżyć dashboard”.

## Raport musi zawierać

1. mapę repozytorium,
2. mapę tras,
3. mapę ekranów,
4. mapę komponentów,
5. mapę CSS/tokenów,
6. mapę źródeł danych każdego ekranu,
7. elementy chronione,
8. atrapy i martwy kod,
9. problemy AI-looku z lokalizacją,
10. dokumenty do migracji,
11. komendy bazowe i wyniki,
12. listę screenshotów baseline,
13. małe milestone’y i przewidziane pliki,
14. ryzyka regresji,
15. pytania wymagające decyzji właściciela.

## Gate

Etap kończy się bez implementacji. Nie poprawiaj nawet „oczywistego” CSS. Zatrzymaj się po raporcie.
