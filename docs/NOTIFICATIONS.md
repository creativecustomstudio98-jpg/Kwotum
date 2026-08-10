# Powiadomienia transakcyjne

Wiadomości konta wysyłane przez Supabase Auth mają osobny kontrakt i
wersjonowane szablony w `AUTH_EMAILS.md`. Oba kanały używają zatwierdzonej
domeny dostawcy, ale osobnych credentiali i różnych adresów From.

## Zakres Etapu 8

Po atomowym utworzeniu leada system dopisuje w tej samej transakcji:

- `lead_customer_confirmation` — potwierdzenie dla klienta, tylko gdy lead
  podał e-mail;
- `lead_company_alert` — alert na skonfigurowany tenantowy adres dostawy.

Owner/Admin ustawia adres alertów niezależnie od kont użytkowników panelu.
Adres może przekazywać pocztę do innej skrzynki. Dla starszych organizacji bez
konfiguracji pozostaje przejściowy fallback do najstarszego aktywnego Ownera.
Sales nie odczytuje ani nie zmienia konfiguracji.

Adres odbiorcy jest snapshotem zdarzenia. Unikalność `(lead_id, kind)` sprawia,
że ponowiony submit nie tworzy kolejnych wiadomości. Etap nie obejmuje
marketingu, webhooków dostawcy, bounce ani complaint handling.

## Outbox i stany

`notifications` przechowuje stan `pending`, `processing`, `retry`, `sent` albo
`failed`. `notification_delivery_attempts` przechowuje każdą próbę i jej
bezpieczny kod wyniku. Tabele mają `organization_id`, wymuszone RLS i są
bezpośrednio tylko do odczytu dla aktywnych członków tenanta. Anonimowy klient i
zwykły użytkownik nie mogą pobierać kolejki ani zmieniać jej stanu.

Worker pobiera maksymalnie 25 gotowych rekordów przez kontrolowane RPC,
`FOR UPDATE SKIP LOCKED` i losowy lock token. Zawieszony rekord `processing`
wraca do retry po 15 minutach. Błędy sieci, HTTP 429 i 5xx są ponawiane po
1 minucie, 5 minutach, 30 minutach i 2 godzinach. Piąta nieudana próba kończy
rekord statusem `failed`; trwałe 4xx i błędna konfiguracja kończą go od razu.

Dostawa jest co najmniej jednokrotna. Adapter wysyła stabilny
`Idempotency-Key: notification/<notification_id>`, aby ograniczyć duplikat w
oknie awarii między dostawcą a zapisem statusu.

## Szablony

`@wyceno/email` zawiera wersjonowane szablony:

- `lead-customer-v1`;
- `lead-company-v1`;
- `flow-invitation-v1`.

Każdy render zwraca temat, pełny HTML i odpowiednik tekstowy. HTML ma język
polski, tytuł, jeden główny region i nagłówek pierwszego poziomu; treść pozostaje
czytelna bez CSS. Dane dynamiczne są escapowane, a temat usuwa znaki sterujące.
Wiadomość klienta nie zawiera prywatnego score ani linku do panelu. Wiadomość
firmy jest samodzielnym briefem: zawiera dostępne dane kontaktowe, w tym telefon
leada phone-first, oraz zapisane odpowiedzi. Link do tenantowego szczegółu
pozostaje dodatkową akcją, nie warunkiem obsługi leada.

`flow-invitation-v1` służy do wysłania klientowi aktualnego hosted flow przed
powstaniem leada. Zawiera nazwę firmy i procesu, opcjonalne imię oraz osobistą
wiadomość i zwykły link `/f/{publicId}`. Nie zawiera score, prywatnych reguł,
identyfikatora zaproszenia, PII w URL, piksela śledzącego ani deklaracji o
otwarciu wiadomości.

Zmiana treści lub kontraktu danych wymaga nowej wersji szablonu, testów obu
formatów i kompatybilnego odczytu istniejących rekordów outboxu.

## Konfiguracja i uruchomienie

Wymagane zmienne server-side:

```dotenv
EMAIL_DELIVERY_MODE=test
EMAIL_FROM=powiadomienia@example.test
NOTIFICATION_WORKER_SECRET=minimum-32-znaki-losowego-sekretu
```

Tryb `test` uruchamia rzeczywisty renderer, kolejkę i zapis statusów, lecz nie
wykonuje połączeń sieciowych. Zwraca deterministyczny identyfikator dostawy.
Jest domyślnym trybem weryfikacji Etapu 8.

Opcjonalny tryb dostawcy wymaga dodatkowo:

```dotenv
EMAIL_DELIVERY_MODE=resend
RESEND_API_KEY=...
```

Produkcyjny nadawca może zawierać bezpieczną nazwę prezentacyjną, np.
`EMAIL_FROM=Kwotum <powiadomienia@mail.kwotum.pl>`. Walidacja odrzuca znaki
nowej linii i niepoprawny adres, aby nagłówek nie mógł zostać rozszerzony przez
iniekcję.

Scheduler wywołuje:

```http
POST /api/v1/internal/notifications/process
Authorization: Bearer <NOTIFICATION_WORKER_SECRET>
```

Odpowiedź zawiera wyłącznie liczniki `claimed`, `sent`, `retrying` i `failed`.
Endpoint zawsze używa `private, no-store`; błąd nie ujawnia odbiorcy, tematu ani
treści. Scheduler i jego alerty produkcyjne powstają przy wdrożeniu Etapu 13.

Ten sam chroniony endpoint przetwarza również osobny outbox
`flow_invitations`. Odpowiedź sumuje bezpieczne liczniki obu kolejek. Worker
zaproszeń używa stabilnego
`Idempotency-Key: flow-invitation/<invitation_id>`, tej samej klasyfikacji
błędów i tego samego backoffu, ale zachowuje osobną historię oraz kontrakt
retencji.

## Prywatność i obserwowalność

Adres odbiorcy jest dodatkową kopią PII. Obejmuje go tenantowe RLS, retencja,
eksport/usunięcie i procedura DSAR. Do logów i odpowiedzi workera nie trafiają
e-maile, imiona, tematy, treści ani odpowiedzi leada. Dozwolone są wyłącznie
liczniki, techniczne identyfikatory, status, kod błędu i czas.

Adapter Resend jest gotowy technicznie, ale pozostaje wyłączony produkcyjnie do
zatwierdzenia DPA, subprocesorów, regionów i transferów. Resend dokumentuje
przechowywanie danych konta, metadanych e-mail i logów API w USA także wtedy,
gdy region wysyłkowy jest ustawiony na UE.

## Weryfikacja

- testy szablonów sprawdzają HTML/text, semantykę, escapowanie i minimalizację
  danych klienta;
- test adaptera sprawdza idempotency key i klasyfikację 4xx/429/5xx;
- test workera sprawdza wysyłkę bez sieci, retry i brak PII w logach;
- `pnpm test:rls` sprawdza enqueue w transakcji submitu, politykę phone-first,
  uprawnienia konfiguracji odbiorcy, izolację tenantów,
  minimalne granty, retry oraz historię prób;
- statusy są widoczne w tenantowym szczególe leada;
- `flow-invitation-v1` ma testy HTML/text, escapowania i braku trackingu;
- worker zaproszeń ma test sent/retry/configuration bez ruchu sieciowego;
- `supabase/tests/flow_invitations.sql` sprawdza idempotencję, aktualną
  publikację, role, drugi tenant, minimalne granty i historię prób;
- panel pokazuje status, wersję, autora i datę każdej wysyłki.

## Ograniczenia produkcyjne

Przed produkcją trzeba zatwierdzić dostawcę i transfery, ustawić zweryfikowaną
domenę nadawcy, wdrożyć scheduler z alertem na brak postępu kolejki oraz
przeprowadzić ręczny test dostawy do reprezentatywnych klientów pocztowych.
Bounce, complaint i provider webhook należą do późniejszego zakresu.
