# Prompt wykonawczy — bezpieczny podgląd i wysyłka procesu

## Cel

Zbuduj w panelu Kwotum produkcyjny przepływ `podgląd → publikacja →
udostępnienie`, który pozwala Ownerowi i Adminowi przejść cały opublikowany
formularz oraz wysłać jego hosted link do klienta. Nie używaj osobnej atrapy
formularza, `mailto:`, fikcyjnego statusu dostawy ani produkcyjnej sesji jako
trybu testowego.

## Zakres zamkniętego etapu

1. Zmień ekran instalacji procesu w ekran **Podgląd i udostępnianie**.
2. Podgląd ma używać tego samego `WycenoWidgetElement` i tego samego
   `WidgetSessionController`, lecz pamięciowego adaptera preview:
   - manifest pochodzi z immutable opublikowanej wersji;
   - odpowiedzi i pliki istnieją wyłącznie w pamięci karty;
   - analityka nie wykonuje requestów;
   - submit nie tworzy leada ani powiadomienia;
   - UI zawsze pokazuje, że jest to tryb podglądu;
   - restart czyści wyłącznie stan pamięciowy.
3. Dodaj wysyłkę formularza klientowi:
   - osobny tenantowy agregat `flow_invitations`;
   - odbiorca, opcjonalne imię i wiadomość, autor, data, wersja procesu;
   - idempotency key, kolejka, retry/backoff, historia prób i status końcowy;
   - wersjonowany e-mail HTML + text z hosted linkiem;
   - brak PII w URL, logach i odpowiedzi workera;
   - brak tracking pixela i śledzenia otwarć;
   - jawny test mode bez ruchu sieciowego.
4. Dodaj capability `flow:share` wyłącznie Ownerowi i Adminowi. Każda operacja
   serwerowa odtwarza tenant context i sprawdza capability; RLS pozostaje drugą
   warstwą.
5. Ekran desktop ma pokazywać duży podgląd urządzenia i boczny panel wysyłki;
   mobile składa je do jednej osi bez poziomego scrolla. Formularz ma stany
   loading, success, validation error i delivery failure. Historia pokazuje
   status, odbiorcę, autora oraz datę.
6. Zachowaj istniejące tryby widgetu, hosted link, WordPress i diagnostykę.
   Usuń mylące nazwy „Otwórz test” i „Uruchom test”.

## Ograniczenia bezpieczeństwa

- Podgląd nie może wykonać żadnego publicznego endpointu sesji, odpowiedzi,
  uploadu, submitu ani analityki.
- Zaproszenie może wskazywać wyłącznie aktualną opublikowaną wersję flow.
- Adres odbiorcy jest PII: podlega tenant scope, RLS, retencji i DSAR.
- Dostawa jest co najmniej jednokrotna i używa stabilnego klucza idempotencji.
- Provider produkcyjny pozostaje zablokowany do zatwierdzenia DPA, domeny
  nadawcy, SPF/DKIM/DMARC, schedulera i alertów.
- Nie dodawaj CRM, kalendarzy, webhooka ani innych pustych integracji.

## Kryteria odbioru

- Pełny formularz można przejść w panelu na desktopie i mobile.
- Test nie zwiększa liczby `widget_sessions`, `session_events`, `lead_files`,
  `leads` ani `notifications`.
- Podwójny submit tego samego zaproszenia tworzy najwyżej jeden rekord.
- Sales i drugi tenant nie mogą tworzyć ani odczytywać zaproszeń.
- Worker zapisuje próbę, retry albo sent bez ujawniania PII.
- Wiadomość HTML i text zawiera nazwę firmy, procesu, bezpieczny hosted link
  i opcjonalną wiadomość; nie zawiera score ani prywatnych reguł.
- Klawiatura, axe, 320/390/768/1440 px, forced colors i reduced motion nie
  powodują utraty funkcji ani overflow.
- Lint, typecheck, unit, RLS, WordPress, E2E i build przechodzą bez wyłączeń.

## Poza etapem

- śledzenie otwarć i kliknięć odbiorcy;
- jednorazowe lub wygasające linki indywidualne;
- webhook v1;
- CRM, kalendarze i synchronizacja leadów do WordPressa;
- aktywacja produkcyjnego providera i deployment.

## Następny osobny etap

Panel operacyjny leada nie jest częścią outboxu zaproszeń. Jego osobny,
zamknięty kontrakt wykonawczy znajduje się w
`LEAD_OPERATIONS_IMPLEMENTATION_2026-08-03.md` i obejmuje przypisanie,
priorytet, zadania, planowany kontakt oraz historię aktywności. Etap 12ZI nie
może osłabić ani rozszerzyć skutków ubocznych bezstanowego preview z Etapu
12ZH.
