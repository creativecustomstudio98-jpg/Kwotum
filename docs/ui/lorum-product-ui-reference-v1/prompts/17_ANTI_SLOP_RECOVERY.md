# PROMPT 17 — TRYB NAPRAWCZY, GDY ITERACJA ZNOWU WYGLĄDA JAK AI SLOP


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

Użyj tego promptu tylko do naprawy nieudanej iteracji. Nie dodawaj nowych funkcji.

STOP. Obecny rezultat wizualny nie spełnia kontraktu Lorum. Nie próbuj go „upiększać”. Wykonaj diagnostykę i redukcję.

## 1. Zrób screenshoty

- aktualny ekran 1536×1024 lub 390×844,
- właściwa referencja obok,
- bez cropowania problematycznych fragmentów.

## 2. Wypisz różnice w kategoriach

### Geometria

- shell,
- szerokości,
- wysokości,
- kolumny,
- alignment,
- whitespace.

### Hierarchia

- co dominuje,
- co powinno dominować,
- liczba głównych CTA,
- kolejność informacji.

### System

- tokeny,
- radius,
- shadow,
- typography,
- icon style,
- density.

### AI slop inventory

Znajdź i usuń:

- gradienty,
- glow,
- glass,
- blobs,
- random cards,
- wielkie radiusy,
- kolorowe icon tiles,
- decorative empty space,
- fake chart/data,
- generic marketing copy,
- hover lift everywhere.

Dla każdego elementu wskaż plik i selektor/komponent.

## 3. Napraw w kolejności

1. Usuń dekoracje bez funkcji.
2. Przywróć prawidłowy shell i siatkę.
3. Zredukuj liczbę paneli.
4. Połącz dane należące do jednego zadania.
5. Ustaw typografię i spacing z tokenów.
6. Zmniejsz radius i cień.
7. Użyj status color tylko semantycznie.
8. Napraw mobile transformację.

## 4. Zakazy

- żadnych nowych bibliotek,
- żadnego nowego copy,
- żadnych nowych sekcji,
- żadnego „creative interpretation”,
- żadnej zmiany logiki,
- żadnego zamykania problemu bez drugiego screenshotu.

## 5. Odbiór

Po naprawie:

- screenshot,
- lista 5 pozostałych różnic,
- testy,
- pliki,
- zatrzymaj się.
