# Prywatność

Dokument opisuje funkcje produktu, nie poradę prawną. Organizacja korzystająca
z Lorum określa podstawę, treści informacyjne, retencję i role stron.

## Privacy by design

- minimalizacja: pytania i tracking tylko potrzebne dla celu;
- brak identyfikacji przed podstawą prawną; eventy pre-submit używają pseudonimowej sesji;
- jawne, niezaznaczone potwierdzenie informacji prywatności oraz osobne zgody
  marketingowe i kanałowe, gdy są właściwą podstawą;
- zapis typu zgody, wersji/hash treści, czasu i źródła;
- konfigurowalny link do polityki i okres retencji;
- eksport, korekta, usunięcie lub anonimizacja;
- prywatne pliki i ograniczone logi;
- dane demonstracyjne wyraźnie oznaczone.

## Retencja

Oddzielne polityki dla niedokończonych sesji, leadów, plików, eventów, audytu i backupów. Usunięcie produkcyjne musi uwzględniać opóźnione wygaszenie kopii zapasowych oraz legal hold.

Etap 12 wdraża politykę retencji leadów jako opt-in Ownera w zakresie 30–3650
dni. Brak rekordu lub wartość `null` oznacza brak automatycznego usuwania.
Worker najpierw usuwa obiekty z prywatnego Storage, następnie ponownie sprawdza
termin i legal hold, a dopiero potem usuwa dane bazy. Niedokończona sesja może
zostać usunięta dzień po jej technicznym expiry. Scheduler i rzeczywiste okresy
muszą zostać zatwierdzone przed produkcją.

Owner może dla pojedynczego leada:

- pobrać wersjonowany JSON z kontaktem, odpowiedziami, zgodami, historią,
  notatkami, statusem dostawy i metadanymi plików;
- ustawić albo zwolnić blokadę prawną;
- trwale usunąć pliki i zależne rekordy po jawnym potwierdzeniu.

Po usunięciu pozostaje tylko tenantowy dowód operacji z przyczyną i licznikami,
bez ID leada i danych respondenta. Produkt wybiera pełne usunięcie zamiast
częściowej anonimizacji tekstu i plików, których faktycznej
nieidentyfikowalności nie da się zagwarantować automatycznie. Backupy, audit log
organizacji i logi hostingu wymagają osobnych, zatwierdzonych okresów.

Techniczne wznowienie widgetu przechowuje przez maksymalnie siedem dni token,
manifest i odpowiedzi w `localStorage` originu strony gospodarza oraz w sesji
serwerowej. Jest to limit operacyjny, nie zatwierdzona polityka retencji danych.
Przed produkcją właściciel danych musi zatwierdzić job trwałego usuwania,
informację dla respondenta i konsekwencje użycia skryptów third-party hosta.

Etap 7 zapisuje przy leadzie typ, wersję, SHA-256 treści i czas potwierdzenia
informacji prywatności. Opcjonalna zgoda marketingowa e-mail ma osobny rekord,
nie jest domyślnie zaznaczona i nie blokuje wysłania zapytania. Pełna treść
prawna pozostaje w immutable snapshotcie procesu, a publiczny manifest
otrzymuje tylko etykietę, wersję, hash i opcjonalny link. Jest to mechanizm
dowodowy produktu, nie rozstrzygnięcie podstawy prawnej organizacji.

Etap 8 utrwala adres odbiorcy przy rekordzie outboxu, aby późniejsza zmiana
członkostwa nie przepisała historii dostawy. Jest to dodatkowa kopia PII,
objęta tenantowym RLS, retencją, eksportem/usunięciem i DSAR. Próby dostawy nie
zawierają treści wiadomości. Logi oraz odpowiedź workera mają wyłącznie
techniczne statusy i liczniki.

Adapter Resend pozostaje wyłączony produkcyjnie do zatwierdzenia dostawcy.
Według dokumentacji dostawcy dane konta, metadane e-mail i logi API są
przechowywane w USA także przy regionie wysyłkowym UE; wymagają więc jawnej
oceny DPA, subprocesorów i transferu. Lokalny gate używa bezsieciowego test mode.

Etap 9 nie zapisuje żadnego eventu przed zgodą `analytics-v1`. Eventy
pre-submit są pseudonimowe, nie anonimowe: wskazują techniczną sesję, flow i
wersję, lecz nie mają odpowiedzi, PII, pełnego URL/referrera ani IP. Odmowa nie
blokuje wyceny, a wycofanie usuwa surowe eventy bieżącej sesji. Dashboard
obejmuje wyłącznie populację consented i ukrywa próbę/grupę poniżej 5.

Surowe eventy mają maksymalnie 90 dni retencji. Minimalne rekordy decyzji mają
osobną retencję do zatwierdzenia w Etapie 12. Brak zewnętrznego providera
analityki oznacza brak nowego transferu danych w Etapie 9.

## Przed produkcją

Ustalić role administrator/podmiot przetwarzający, DPA, subprocesorów, regiony danych, transfery, podstawy prawne, procedurę DSAR i incydentów z doradcą prawnym.

Materiał do tej decyzji i aktualny rejestr dostawców znajduje się w
`docs/DPA_AND_SUBPROCESSORS.md`. Brak review prawnego jest jawną blokadą danych
rzeczywistych, a nie technicznym domniemaniem zgodności.
