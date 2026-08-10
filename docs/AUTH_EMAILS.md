# E-maile konta Kwotum

**Status:** procedura wdrożeniowa Etapu 13A
**Ostatni przegląd:** 2026-08-10

Ten dokument dotyczy wiadomości Supabase Auth: potwierdzenia rejestracji,
zaproszenia do konta, magic linku/OTP, zmiany adresu, resetu hasła i ponownej
weryfikacji. Powiadomienia o leadach i zaproszenia do formularzy mają osobny
outbox opisany w `NOTIFICATIONS.md`, ale korzystają z tego samego zatwierdzonego
dostawcy.

## Decyzja produkcyjna

- dostawca: Resend, zgodnie z ADR-018;
- odseparowana domena wysyłkowa: `mail.kwotum.pl`;
- Auth From: `Kwotum <konto@mail.kwotum.pl>`;
- outbox From: `Kwotum <powiadomienia@mail.kwotum.pl>`;
- link tracking i open tracking: wyłączone dla Auth;
- sekrety Supabase SMTP i aplikacji są osobnymi kluczami;
- szablony kanoniczne: `supabase/templates/*.html`.

Resend nie może zostać uznany za zatwierdzonego podprocesora wyłącznie na
podstawie konfiguracji technicznej. Przed prawdziwymi danymi wymagane są DPA,
ocena transferów i retencji oraz wpis do rejestru podprocesorów zgodnie z
ADR-018 i `DPA_AND_SUBPROCESSORS.md`.

## Stan produkcyjny 2026-08-10

- domena `mail.kwotum.pl` ma status `Verified` w Resend, region wysyłkowy
  `eu-west-1`;
- autorytatywne DNS home.pl zwracają rekordy DKIM, SPF, MX i DMARC wymagane
  przez Resend;
- oficjalna integracja Resend jest połączona z projektem Supabase
  `jymhjlhiafvmfrdlvxbx`;
- Supabase Auth używa custom SMTP `smtp.resend.com:465` oraz nadawcy
  `Kwotum <konto@mail.kwotum.pl>`;
- wszystkie sześć tematów i szablonów z tego repozytorium wdrożono do
  Supabase Authentication → Emails;
- syntetyczne potwierdzenie rejestracji zostało dostarczone przez Resend
  2026-08-10 o 17:13 CEST. Kontrola potwierdziła poprawnego nadawcę, polski
  temat i brak domyślnej angielskiej treści oraz brandingu Supabase;
- konto Auth użyte do testu zostało usunięte po odbiorze dowodu.

Techniczna konfiguracja Auth SMTP jest zakończona. Nadal otwarte są: formalne
zatwierdzenie Resend jako podprocesora, testy w rzeczywistych klientach
pocztowych oraz osobny klucz, scheduler i alerty aplikacyjnego outboxu.
Link potwierdzający nadal prowadzi przez host projektu Supabase. Własna domena
Auth może być osobnym ulepszeniem po ocenie planu i kosztu; nie należy mylić jej
z już zweryfikowaną domeną nadawcy `mail.kwotum.pl`.

## Wdrożenie

1. W Resend utworzyć domenę `mail.kwotum.pl` w regionie wysyłkowym UE, jeśli
   jest dostępny dla konta.
2. Skopiować dokładnie rekordy SPF i DKIM pokazane przez Resend do home.pl.
   Nie zastępować istniejących rekordów poczty domeny głównej. DMARC dodać po
   sprawdzeniu istniejącej polityki; nie tworzyć drugiego rekordu DMARC dla tej
   samej nazwy.
3. Poczekać na status domeny `Verified` i zapisać dowód bez sekretów.
4. Połączyć Resend z projektem Supabase `jymhjlhiafvmfrdlvxbx` przez oficjalną
   integrację. Ustawić nazwę nadawcy `Kwotum` i adres
   `konto@mail.kwotum.pl`.
5. W Supabase Authentication → Emails wdrożyć tematy i treści z mapy poniżej.
   Nie zmieniać nazw zmiennych Go Template i nie włączać śledzenia linków.
6. W Resend utworzyć osobny, ograniczony klucz API dla aplikacyjnego outboxu.
   W Vercel Production ustawić `RESEND_API_KEY`,
   `EMAIL_DELIVERY_MODE=resend` i
   `EMAIL_FROM=Kwotum <powiadomienia@mail.kwotum.pl>`.
7. Dopiero po skonfigurowaniu schedulera workera wysłać syntetyczny lead.
   Samo przełączenie trybu dostawy bez schedulera nie uruchamia kolejki.

Sekretów nie wpisuje się do repozytorium, dokumentacji, zgłoszeń, logów ani
czatu. Dowód konfiguracji pokazuje tylko nazwę hosta, port, domenę nadawcy,
status weryfikacji i zamaskowane credentiale.

## Mapa szablonów

| Supabase Auth        | Temat                                  | Plik                                       |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| Confirm sign up      | `Potwierdź adres e-mail w Kwotum`      | `supabase/templates/confirmation.html`     |
| Invite user          | `Zaproszenie do Kwotum`                | `supabase/templates/invite.html`           |
| Magic link or OTP    | `Bezpieczne logowanie do Kwotum`       | `supabase/templates/magic-link.html`       |
| Change email address | `Potwierdź nowy adres e-mail w Kwotum` | `supabase/templates/email-change.html`     |
| Reset password       | `Zresetuj hasło w Kwotum`              | `supabase/templates/recovery.html`         |
| Reauthentication     | `Kod weryfikacyjny Kwotum`             | `supabase/templates/reauthentication.html` |

Szablony nie używają danych profilu, zewnętrznych obrazów, skryptów, formularzy,
trackerów ani treści marketingowej. Każdy linkowy przepływ ma dokładnie jedno
`{{ .ConfirmationURL }}`, a reauthentication używa wyłącznie `{{ .Token }}`.
Kod weryfikacyjny występuje wyłącznie w treści, nie w temacie widocznym w
powiadomieniach systemowych i logach pocztowych.

## Test odbiorczy

Test przeprowadza się na danych syntetycznych kolejno dla: Gmail web/mobile,
Outlook web/desktop i Apple Mail/Safari. Dla każdej wiadomości należy sprawdzić:

- widocznego nadawcę `Kwotum` i domenę `mail.kwotum.pl`;
- SPF, DKIM i DMARC jako PASS w nagłówkach odbiorcy;
- polski temat, poprawny mobile layout i czytelny fallback bez obrazów;
- jeden działający CTA, docelowo `https://app.kwotum.pl/auth/callback`;
- jednorazowość linku/kodu, poprawny redirect i generyczny błąd po ponowieniu;
- brak tokenu, pełnego URL z query albo adresu odbiorcy w logach aplikacji;
- brak dostawy przez `mail.app.supabase.io` i brak stopki Supabase.

Po teście trzeba udokumentować datę, środowisko, typ wiadomości, klienta
pocztowego, wynik i ownera. Treści wiadomości ani nagłówków zawierających dane
nie zapisujemy w repozytorium.

## Rollback

Jeśli dostawa lub linki nie działają, należy wyłączyć rejestrację e-mailową i
zaproszenia, pozostawić dotychczasowe konta aktywne oraz wrócić do
`EMAIL_DELIVERY_MODE=test` dla outboxu. Nie wolno przywracać domyślnego SMTP
Supabase jako kanału produkcyjnego. Po usunięciu przyczyny wdraża się tę samą
wersję szablonów ponownie i powtarza pełny test odbiorczy.
