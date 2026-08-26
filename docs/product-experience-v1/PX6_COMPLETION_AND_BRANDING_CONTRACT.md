# PX6 — kontrakt zakończenia, kontaktu i brandingu

## Cel

PX6 zamyka główną ścieżkę po ostatniej odpowiedzi. Firma może świadomie wybrać
czy najpierw pokazać wynik, czy zebrać kontakt przed pełnym wynikiem, a klient
widzi wyłącznie pola potrzebne w danym procesie. Identyfikacja firmy pozostaje
minimalna i bezpieczna; nie jest systemem dowolnego stylowania widżetu.

## Kontrakt kontaktu v3

Dozwolone pola to wyłącznie imię, e-mail, telefon, preferowany kanał i
preferowana pora. Każde ma jawny stan: ukryte, opcjonalne albo wymagane. E-mail
jest wymaganym kanałem v3. Preferowany kanał ma wartości `email` lub `phone`, a
pora `morning`, `afternoon` lub `evening`. Serwer odrzuca preferencję telefonu
bez telefonu oraz każde brakujące pole oznaczone jako wymagane.

Kolejność ma dwa warianty:

1. `result_then_contact` — orientacyjny wynik, a potem formularz kontaktowy;
2. `contact_then_result` — formularz kontaktowy, zapis leada i dopiero pełny
   wynik potwierdzony przez serwer.

Stare snapshoty nie są migrowane semantycznie i zawsze zachowują wynik przed
kontaktem. Zgoda prywatności i opcjonalna zgoda marketingowa nadal mają osobne
wersje i hashe. Upload zachowuje dotychczasowy prywatny Storage, skanowanie,
limity i atomowy submit.

## Kontrakt publicznego outcome v2

Outcome jest deklaratywną decyzją snapshotu: formularz leada albo świadome
zakończenie bez zbierania danych. Nie może zależeć od kodu klienta, CSS ani
prywatnego score. Endpoint wyniku wylicza cenę i wybiera publiczne teksty z tej
samej immutable wersji, usuwa ślady pricing/scoring rules i nigdy nie zwraca
score ani kategorii.

Outcome bez leada nie może wymagać wcześniejszego kontaktu. Może mieć parę:
etykieta i prawdziwy URL HTTPS do awaryjnego kontaktu. Nie ma pola SLA, więc UI
nie może wygenerować obietnicy „odpowiemy w 15 minut” bez osobnej przyszłej
decyzji produktowej.

## Kontrakt brandingu

- nazwa firmy jest oddzielna od nazwy procesu;
- akcent przyjmuje wyłącznie kanoniczny `#RRGGBB`;
- tekst CTA jest czarny albo biały i wynika deterministycznie z koloru;
- brak konfiguracji daje `#0B6048` / `#FFFFFF` i nazwę organizacji;
- logo jest wyłącznie gotowym WebP z tenantowego rejestru assetów;
- publiczny URL logo jest same-origin i wskazuje wąski resolver aktywnego
  opublikowanego procesu;
- zewnętrzne URL-e obrazów, custom CSS, HTML, fonty i skrypty są niedozwolone.

## Propagacja i retencja

Preferencje trafiają do leada przed commitem transakcji. Panel pokazuje je
osobno od odpowiedzi i kontekstu hosta. Worker e-mail wzbogaca zarówno HTML,
jak i tekst, webhook emituje kontrakt `2026-08-25`, a eksport danych ma wersję 2. Usunięcie leada usuwa preferencje razem z rekordem; legal hold i dotychczasowa
retencja nie zmieniają znaczenia.

## Negatywne przypadki odbioru

- nie da się opublikować v3 bez wymaganego e-maila;
- preferowany telefon bez numeru jest odrzucany w API i bazie;
- `no_lead` za kolejnością kontakt → wynik jest odrzucany;
- submit dla `no_lead` jest odrzucany serwerowo;
- obcy tenant nie może ustawić logo ani brandingu;
- niegotowy asset oraz niezgodna para kontrastu są odrzucane;
- manifest ze stringiem CSS, złym kolorem lub zewnętrznym URL-em logo nie jest
  renderowany;
- historyczny manifest nie otrzymuje nowej kolejności.

## Rollback

Ukryć kontrolki v3 i branding oraz publikować dotychczasowy kontakt v2. Nie
usuwać kolumn, RPC, resolvera ani parserów po zapisaniu pierwszej wersji v3.
Webhook konsument może nadal obsługiwać `2026-08-09`; nowe dostawy mają wersję
`2026-08-25`. Korekta danych wymaga nowej migracji, nie edycji wdrożonej.
