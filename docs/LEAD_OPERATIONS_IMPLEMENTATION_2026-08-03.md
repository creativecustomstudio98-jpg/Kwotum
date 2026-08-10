# Prompt wykonawczy — Lead Operations

## Cel

Przekształć prawą kolumnę szczegółu leada w produkcyjne miejsce codziennej
pracy zespołu. Widok ma łączyć istniejący status i notatki z rzeczywistym
przypisaniem właściciela, priorytetem, zadaniami, planowanym kontaktem i jedną
chronologiczną historią aktywności. Nie dodawaj kontrolek bez zapisu po stronie
serwera, fikcyjnych przypomnień ani danych przechowywanych wyłącznie w stanie
Reacta.

## Osobny zakres Etapu 12ZI

1. Dodaj tenantowy stan operacyjny jednego leada:
   - opcjonalny właściciel będący aktywnym członkiem tej samej organizacji;
   - priorytet `niski`, `średni` albo `wysoki`;
   - autor i czas ostatniej zmiany.
2. Dodaj zadania leada:
   - typ `kontakt` albo `zadanie`;
   - tytuł, opcjonalny opis, termin, osoba odpowiedzialna i twórca;
   - stan `otwarte`, `wykonane` albo `anulowane`;
   - idempotency key i historię utworzenia/zamknięcia.
3. „Następny krok” ma wynikać z najbliższego otwartego zadania. „Zaplanowany
   kontakt” ma wynikać z najbliższego otwartego zadania typu kontakt.
   „Ostatnia aktywność” ma być obliczana z utworzenia leada, statusów, notatek,
   przypisań, priorytetu i zadań — bez ręcznie utrzymywanego, rozbieżnego pola.
4. Przebuduj prawy panel szczegółu leada:
   - zwarta sekcja „Obsługa leada”;
   - status, właściciel, priorytet, następny krok, planowany kontakt i ostatnia
     aktywność;
   - formularz notatki i dwie najnowsze notatki z autorem oraz datą;
   - działające CTA „Rozpocznij obsługę”, „Zaplanuj kontakt” i „Utwórz zadanie”;
   - lista aktywnych zadań z możliwością wykonania albo anulowania;
   - pełna historia w istniejącej zakładce Historia.
5. Desktop używa jednej prawej powierzchni z hairline'ami, bez warstwowania
   kart. Mobile układa panel pod podsumowaniem i zachowuje pełną obsługę
   klawiaturą, focus, reflow i brak poziomego scrolla.

## Uprawnienia i bezpieczeństwo

- Owner/Admin mogą przypisywać właściciela spośród aktywnych członków tenanta.
- Owner/Admin/Sales mogą zmieniać priorytet, tworzyć zadania i planować kontakt.
- Sales może zamknąć zadanie tylko wtedy, gdy je utworzył albo jest jego
  właścicielem. Owner/Admin mogą zamknąć każde zadanie własnej organizacji.
- Każda server action odtwarza `TenantContext`, sprawdza capability i używa
  wąskiego RPC. Bezpośredni zapis tabel operacyjnych jest zabroniony.
- RLS jest niezależną drugą warstwą. Identyfikator leada, zadania, członka i
  organizacji muszą należeć do tego samego tenanta.
- Activity i audit log nie kopiują tytułów, opisów, e-maili ani notatek.
- Zadania i opisy podlegają eksportowi, retencji, DSAR, legal hold oraz
  usunięciu razem z leadem.

## Stany i walidacja

- loading/pending blokuje wyłącznie wykonywaną kontrolkę;
- sukces odświeża panel i czyści formularz;
- validation error jest związany z formularzem i czytelny dla screen readera;
- konflikt, obcy tenant, nieaktywny członek i brak zasobu zwracają generyczny
  błąd bez potwierdzania istnienia danych;
- termin musi być prawidłową datą i nie może być w przeszłości;
- tytuł ma 2–160 znaków, opis maksymalnie 2000 znaków;
- ponowienie tego samego `requestId` nie tworzy drugiego zadania.

## Kryteria odbioru

- wszystkie kontrolki zmieniają prawdziwe dane i przeżywają reload;
- przypisanie nie przyjmuje użytkownika spoza tenanta ani członka zawieszonego;
- drugi tenant i anonimowy klient nie widzą ani nie modyfikują operacji;
- Sales nie może przypisać właściciela ani zamknąć cudzego zadania;
- start obsługi ustawia `in_progress` i przypisuje bieżącego użytkownika, gdy
  lead nie ma właściciela;
- następny krok, kontakt i ostatnia aktywność są obliczone deterministycznie;
- eksport zawiera zadania, a usunięcie/retencja nie pozostawia rekordów
  osieroconych;
- testy unit, PostgreSQL/RLS, drugi tenant, idempotencja, mobile, klawiatura,
  axe, lint, typecheck i build przechodzą bez wyłączeń.

## Wynik implementacji 2026-08-03

- migrację zastosowano lokalnie po bezpiecznym uzgodnieniu wpisu Etapu 12ZH,
  bez resetowania danych;
- zapisane akcje są natychmiast projektowane w panelu po potwierdzeniu serwera,
  a odświeżenie RSC nie blokuje formularza ani zamknięcia dialogu;
- notatka pokazuje autora i czas, zadanie można utworzyć, wykonać albo anulować,
  a historia scala wszystkie typy aktywności chronologicznie;
- test E2E Chromium przechodzi z axe i geometrią dla 1536 × 1024 oraz
  390 × 844; dowody po implementacji są w
  `artifacts/visual-qa/12zi-lead-operations/`.

## Poza etapem

- synchronizacja z zewnętrznym CRM lub kalendarzem;
- wysyłka przypomnienia SMS/e-mail;
- recurring tasks, SLA automation i automatyczne reguły przypisania;
- kanban, pipeline sprzedażowy i raport wydajności pracowników.
