# Architektura treści

## Strony podstawowe

`/`, `/produkt`, `/jak-dziala`, `/cennik`, `/dla-agencji`, `/wordpress`, `/szablony`, `/szablony/[slug]`, `/branze`, `/funkcje`, `/porownania`, `/blog`, `/blog/[slug]`, `/baza-wiedzy`, `/polityka-prywatnosci`, `/regulamin`, `/dpa`, `/status`.

## Branże

`/branze/meble-na-wymiar`, `/ogrodzenia`, `/strony-internetowe`, `/klimatyzacja`, `/remonty`. Pierwsze trzy otrzymują najpełniejsze demo i szablon.

## Funkcje

`/funkcje/kalkulator-wyceny`, `/formularz-wieloetapowy`, `/kwalifikacja-leadow`, `/lead-scoring`, `/widget-na-strone`.

## Porównania

`/porownania/wyceno-vs-typeform`, `/wyceno-vs-jotform`. Treść musi być datowana, źródłowa, uczciwa i regularnie weryfikowana.

## Strona główna

ADR-027 zastępuje ograniczenie ADR-026 do trzech beatów, nadal wyłącznie dla
`/`. Strona główna ma jedną zwartą, produktową narrację:

1. hero — teza „zamiast pytania ile kosztuje dostajesz lead gotowy do rozmowy”
   oraz code-native transformacja trzech odpowiedzi w dokument leada;
2. hairline-strip — zakres, budżet, termin, lokalizacja, pliki i następny krok
   jako jeden pas przejściowy, nie sześć kart;
3. porównanie i proces — typowe zapytanie zestawione z kompletnym leadem oraz
   cztery kroki od konfiguracji procesu do przejęcia leada przez firmę;
4. dopasowanie procesu — pytania wynikają z usługi i branży;
5. doświadczenie klienta — działający, bezstanowy fragment prowadzonego
   procesu;
6. wynik i kwalifikacja — odpowiedzi oraz przypięta wersja procesu prowadzą do
   serwerowego wyniku i wyjaśnienia score;
7. obsługa leada — odpowiedzi, pliki, status, historia, notatka i następny krok
   tworzą jeden rekord;
8. publikacja — jedna wersja zasila inline, popup, fullscreen, hosted link i
   WordPress bez kopiowania logiki;
9. firma i agencja — jawna granica odpowiedzialności oraz dostępu do danych;
10. program pilotażowy — konkretny zakres i przejście do `/cennik`, bez
    udawania istniejącego formularza zgłoszenia.

Na desktopie trzy pierwsze części mieszczą się w pierwszym widoku i początku
kolejnego. Dalsze rozdziały nie kopiują katalogów podstron: każdy wybiera jeden
konkretny mechanizm i prowadzi do istniejącej trasy po rozwinięcie. Na mobile
transformacja odpowiedzi → lead pozostaje pozioma, a pasek danych przechodzi w
układ 3 × 2. Landing nie dodaje testimonials, fikcyjnego trustu, tabel cenowych
ani generycznego FAQ.

## Stan Etapu 10

Wdrożona allowlista obejmuje stronę główną, produkt, jak działa, cennik,
agencje, WordPress, hub branż, pięć stron branżowych, hub funkcji i pięć stron
funkcyjnych. Cennik nie zawiera kwot, ponieważ model nie został zatwierdzony.
WordPress jawnie informuje o zakresie planowanego Etapu 11.

Nie utworzono pustych `/porownania`, `/blog`, `/baza-wiedzy`, stron prawnych,
statusu ani katalogu szablonów. Adresy wymagające treści źródłowej, danych
firmy, decyzji prawnej albo działającej funkcji powstaną dopiero po spełnieniu
odpowiedniej bramki. To świadome ograniczenie thin content, nie brakujący link
w aktualnej nawigacji.
