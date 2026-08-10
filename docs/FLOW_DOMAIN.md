# Domena procesów

## Zakres Etapu 4

Domena obejmuje edytowalny draft, kroki, opcje, ograniczone reguły przejścia,
konfigurację wyniku, walidację grafu, niezmienne wersje, aktywny alias publiczny
i archiwizację wersji. Renderowanie procesu, sesje respondenta i publiczny
manifest należą do Etapu 5. Opcjonalne rozszerzenie pricingu i scoringu zostało
dodane w Etapie 6 i jest opisane w `docs/ESTIMATION_ENGINE.md`.

## Dokumenty flow v1 i v2

Draft jest agregatem JSONB walidowanym przez `@wyceno/validation`. Zawiera:

- wersję schematu, tytuł, intro i `entryStepKey`;
- od 1 do 40 kroków z trwałym kluczem, typem, wymaganiem, obsługą „nie wiem”,
  jawnym `nextStepKey` i maksymalnie 20 opcjami;
- maksymalnie 50 reguł IF/THEN z operatorami `answered`, `equals`, `includes`
  oraz `not_equals`;
- wynik `consultation` albo `no_price`, wraz z nagłówkiem, następnym działaniem
  i niewiążącym zastrzeżeniem.

Cały dokument ma twardy limit 256 KiB niezależnie od limitów liczby elementów.

Typy kroku: `single_choice`, `multiple_choice`, `short_text`, `long_text`,
`number`, `yes_no`, `location`, `budget` i `date`. Dowolny JavaScript, formuły,
HTML nie są częścią dokumentu. Od Etapu 6 dokument może zawierać opcjonalny,
własno-wersjonowany agregat `estimation`; starszy dokument bez niego pozostaje
poprawny.

`FlowDocument v2` dodaje od 1 do 20 uporządkowanych sekcji `{key, title}` oraz
wymagany `sectionKey` każdego kroku. Tablica `steps` nadal jest jedyną
kanoniczną kolejnością wykonania. Sekcje muszą być unikalne, niepuste i tworzyć
spójne grupy; nie są osobnym grafem ani tabelą.

Builder tworzy nową sekcję razem z pierwszym poprawnym krokiem. Zmiana
kolejności sekcji przestawia tablicę `sections` i całe odpowiadające im grupy
`steps`, nie zmieniając kluczy przejść, reguł, wejścia ani estymacji. Usunięcie
sekcji wymaga wskazania innej istniejącej sekcji i jedynie przepisuje
`sectionKey` jej kroków; ostatniej sekcji nie można usunąć. Zwijanie sekcji jest
lokalnym stanem widoku i nie należy do dokumentu.

Krok v2 może mieć jedno typowane `validation`:

- `text_length` dla `short_text`, `long_text` i `location`;
- `number_range` dla `number` i `budget`;
- `date_range` dla `date`.

Granice są domknięte. Zakres wymaga co najmniej jednej granicy, zakres odwrócony
jest niedozwolony, a maksymalna długość nie może przekroczyć limitu bazowego
typu. Nie ma dowolnych regexów, kodu ani wykonywalnych wyrażeń użytkownika.

Parser odczytuje oba formaty. Draft v1 jest deterministycznie podnoszony do v2
wyłącznie w pamięci edytora i trafia do bazy jako v2 dopiero przy jego zapisie.
Historyczne `flow_versions.snapshot` pozostają niezmienione i mogą nadal być
publikowane jako v1.

Klucze kroków, opcji i reguł są stabilnymi identyfikatorami technicznymi:
małe litery ASCII, cyfry i podkreślenia. Zmiana etykiety nie zmienia klucza.

Routing jest deterministyczny: pierwsza pasująca reguła w kolejności dokumentu,
następnie override opcji pojedynczego wyboru, a na końcu `nextStepKey` kroku.
Opcje wielokrotnego wyboru nie mogą samodzielnie zmieniać trasy; używają reguły
`includes`, co usuwa niejednoznaczność przy zaznaczeniu kilku odpowiedzi.

## Walidacja publikacji

Walidator TypeScript dostarcza szybki feedback builderowi. Niezależny walidator
PostgreSQL działa ponownie wewnątrz atomowej funkcji publikującej, więc klient
nie może pominąć kontroli przez bezpośrednie wywołanie RPC.

Publikację blokują między innymi:

- niepoprawny schemat, typ kroku, wynik lub limity;
- powtórzone klucze kroków, opcji albo reguł;
- brak kroku startowego lub nieistniejący cel przejścia;
- reguła wskazująca nieistniejący krok lub opcję;
- krok nieosiągalny od wejścia;
- dowolna osiągalna pętla;
- brak osiągalnej ścieżki kończącej się wynikiem.
- błędna konfiguracja estymacji, referencja kroku, próg lub zakres arytmetyczny.
- brakująca, pusta, powtórzona lub nieuporządkowana sekcja v2;
- ograniczenie odpowiedzi niezgodne z typem albo z odwróconymi granicami.

Detekcja osiągalności i pętli ma ograniczony koszt dla maksymalnie 40 kroków.
Nie wykonuje kodu użytkownika i nie interpretuje dowolnych wyrażeń.

## Wersjonowanie

`flows` przechowuje stabilną tożsamość i draft. Każda zmiana dokumentu albo
edytowalnej nazwy procesu automatycznie zwiększa `draft_revision`. Zapis używa
oczekiwanej rewizji, aby nie nadpisywać równoległej edycji.

Builder serializuje autosave: jeden request działa, a oczekujące zmiany są
redukowane do najnowszego snapshotu. Konflikt zatrzymuje kolejkę i nie uruchamia
force overwrite. Undo/redo jest lokalną historią ograniczoną do 50 snapshotów;
cofnięty stan zapisuje się jako nowa rewizja, zamiast cofać historię bazy.
Szczegóły cyklu edycji określa ADR-031.

`publish_flow(flow_id, expected_revision)`:

1. blokuje rekord draftu;
2. sprawdza aktywną organizację i rolę Owner/Admin;
3. odrzuca konflikt rewizji;
4. uruchamia walidację PostgreSQL;
5. oblicza SHA-256 z kanonicznej reprezentacji JSONB;
6. tworzy wersję albo idempotentnie wykorzystuje identyczny snapshot;
7. atomowo aktualizuje jeden `published_flows.public_id`;
8. zapisuje audit event.

Snapshotu, hasha, numeru i właściciela wersji nie można zmienić nawet jako
właściciel tabeli — blokuje to trigger. Archiwizacja zmienia wyłącznie status i
metadane archiwum. Ponowne opublikowanie identycznego snapshotu przywraca tę
samą wersję bez tworzenia duplikatu.

## Szablony

Kod utrzymuje pięć syntetycznych szablonów tworzonych jako `FlowDocument v2`:

| Slug                 | Branża             | Poziom |
| -------------------- | ------------------ | ------ |
| `meble-na-wymiar`    | meble na wymiar    | pełny  |
| `ogrodzenia`         | ogrodzenia         | pełny  |
| `strony-internetowe` | strony internetowe | pełny  |
| `klimatyzacja`       | klimatyzacja       | bazowy |
| `remonty`            | remonty            | bazowy |

Trzy priorytetowe szablony mają po co najmniej siedem kroków, branżowe
słownictwo, możliwość „nie wiem”, budżet/termin/lokalizację i bezpieczny wynik
konsultacyjny. Każdy szablon przechodzi ten sam walidator co draft użytkownika.

Treści są realistyczną hipotezą przygotowaną na podstawie desk researchu, a nie
udawanym wynikiem wywiadów. Przed użyciem publicznym wymagają testów z firmami,
handlowcami, agencjami i klientami końcowymi opisanych w
`docs/research/USER_NEEDS.md`.

## Autoryzacja

Owner i Admin mają `flow:read`, `flow:write` i `flow:publish`. Sales nie widzi
draftów, reguł ani snapshotów. Każda tabela flow ma `organization_id`, RLS i
indeks tenantowy. Funkcje `security definer` powtarzają kontrolę użytkownika,
aktywnego członkostwa i roli; nie polegają wyłącznie na UI.

## Testy

- `packages/validation/src/flow.test.ts`: pięć szablonów, deterministyczny
  migrator v1 → v2, sekcje, ograniczenia, pętla, martwe kroki i nieistniejące
  cele;
- `supabase/tests/flow_domain.sql`: tworzenie, walidacja, idempotentna
  publikacja, nowa wersja, konflikt rewizji, archiwizacja, immutable snapshot,
  publikacja v1/v2, błędne sekcje/ograniczenia, Owner/Admin/Sales i drugi tenant;
- `supabase/tests/widget_sessions.sql`: manifesty v1/v2 oraz ponowna walidacja
  długości, liczby i daty na immutable snapshotcie;
- `pnpm test:rls`: świeży PostgreSQL ze wszystkimi migracjami i testami.
