# 10 — Stany i edge cases UI

**Status:** CANONICAL

Każdy moduł musi mieć zaprojektowane stany inne niż happy path.

## 1. Globalne

- loading initial,
- background refresh,
- empty,
- partial data,
- error recoverable,
- error terminal,
- offline,
- session expired,
- permission denied,
- tenant switched,
- rate limited,
- maintenance,
- stale data,
- unsaved changes.

## 2. Dashboard

- brak leadów,
- tylko jeden proces,
- brak danych do wykresu,
- webhook failure,
- nieopublikowany proces,
- widget nieosadzony,
- opóźniona agregacja.

## 3. Leady

- brak wyników filtrów,
- lead bez e-maila,
- lead bez telefonu,
- lead bez ceny,
- lead poza ofertą,
- pliki niedostępne,
- eksport w toku/błąd,
- rekord usunięty w innej sesji,
- brak uprawnień do danych kontaktowych.

## 4. Builder

- autosave w toku,
- autosave failed,
- konflikt dwóch kart,
- krok użyty w regule,
- usuwanie opcji użytej w wersji,
- niedostępny krok,
- martwa ścieżka,
- pętla,
- brak wyniku,
- niepoprawna formuła,
- draft nowszy od publikacji,
- utrata połączenia,
- przywrócenie wersji.

## 5. Pricing/scoring

- min > max,
- brak waluty,
- mnożnik zero,
- overflow,
- niezdefiniowana odpowiedź,
- wynik poza limitem,
- konflikt reguł,
- score poniżej 0 lub powyżej 100,
- reguła wykluczająca,
- brak wyjaśnienia.

## 6. Instalacja

- flow nieopublikowany,
- domena niedozwolona,
- skrypt niezaładowany,
- CSS conflict,
- podwójne załadowanie,
- WordPress token wygasł,
- shortcode z błędnym ID,
- diagnostyka nie może połączyć się z hostem.

## 7. Integracje/webhooki

- OAuth cancelled,
- token expired,
- insufficient scope,
- webhook timeout,
- 4xx bez retry,
- 5xx z retry,
- invalid signature,
- replay,
- mapowanie niekompletne,
- provider unavailable.

## 8. Publiczny widget

- odświeżenie,
- powrót do poprzedniego kroku,
- dwie zakładki,
- utrata internetu,
- sesja wygasła,
- plik za duży,
- zły MIME,
- błąd Turnstile,
- flow archived,
- flow unpublished,
- użytkownik poza obszarem,
- wynik bez ceny,
- submit retry bez duplikacji leada,
- klawiatura ekranowa,
- screen reader.

## 9. Destructive actions

Każda akcja destrukcyjna musi jasno wskazać:

- co zostanie usunięte,
- czy operację można cofnąć,
- wpływ na opublikowane flow i leady,
- wymagane uprawnienia,
- confirmation text dla wysokiego ryzyka.
