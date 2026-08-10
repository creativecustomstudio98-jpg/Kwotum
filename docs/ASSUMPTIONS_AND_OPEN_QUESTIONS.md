# Założenia i otwarte pytania

## Założenia robocze

- Pierwszym rynkiem i językiem jest Polska/polski; model nie zamyka drogi do lokalizacji.
- PLN jest walutą domyślną, ale kwoty przechowujemy z kodem ISO i w najmniejszej jednostce.
- Start łączy usługę done-for-you i self-service; oba używają tych samych domen produktu.
- Priorytetowe branże to meble na wymiar, ogrodzenia i strony internetowe.
- Wynik MVP jest orientacyjny i niewiążący; firma wybiera przedział, „od”, brak ceny lub konsultację.
- System jest multi-tenant od pierwszej migracji, nawet jeśli pierwszy pilot ma jedną organizację.
- Hosting oparty o Next.js + PostgreSQL/Supabase jest propozycją do zatwierdzenia ADR.
- Płatności, AI i pełny CRM nie są częścią MVP.
- Dane demonstracyjne są syntetyczne i oznaczone.

## Pytania do właściciela produktu

Nie blokują dokumentacji ani technicznego fundamentu, ale mają gate przed wskazanym etapem:

| Pytanie                                                      | Termin decyzji             |
| ------------------------------------------------------------ | -------------------------- |
| Które 3 firmy będą pilotami i kto prowadzi wywiady?          | przed Etapem 4             |
| Jaka produkcyjna retencja leadów i plików jest zatwierdzona? | przed Etapem 12/produkcją  |
| Czy Admin może eksportować leady, czy wyłącznie Owner?       | przed Etapem 12            |
| Jak wygląda delegacja agencji do organizacji klienta?        | przed Etapem 3             |
| Który dostawca e-mail i region danych zostają zatwierdzone?  | przed Etapem 8/produkcją   |
| Jaki model cenowy i limity planów przechodzą walidację?      | przed publicznym cennikiem |
| Czy „Lorum” przechodzi profesjonalne badanie znaku i domen?  | przed brandingiem/launch   |
| Kto jest właścicielem incydentów, prywatności i supportu?    | przed Etapem 13            |

## Zasada decyzji

Odpowiedź zmieniająca architekturę, security lub scope trafia najpierw do `docs/DECISIONS.md`, a następnie do wymagań i backlogu.

## Stan przed walidacją szablonów

Właściciel polecił kontynuować implementację etapami bez zatrzymania, mimo że
nie przekazano wyników wywiadów ani listy pilotów wymaganych przed Etapem 4.
Dlatego Etap 4 dostarcza technicznie kompletne, syntetyczne szablony oparte na
desk researchu, ale nie oznacza ich jako zwalidowanych rynkowo. Wywiady pozostają
bramką przed publicznym użyciem szablonów i przed uznaniem ich treści za
domyślną rekomendację produktową.

Przed Etapem 7 nie rozstrzygnięto domyślnego momentu pokazania pełnego wyniku
ani minimalnego zestawu danych leada. Etap 5 pokazywał wyłącznie
skonfigurowany, niewiążący wynik konsultacyjny i nie zbierał kontaktu.
Rozstrzygnięcia przyjęte później są zapisane poniżej i w ADR-017.

## Rozstrzygnięcia robocze Etapu 7

Zgodnie z ADR-017 wynik jest pokazywany przed kontaktem. Każdy lead wymaga
e-maila; imię i telefon są opcjonalne. Informacja prywatności wymaga
wersjonowanego potwierdzenia, a marketing e-mail ma osobną, opcjonalną zgodę.
Pliki są opcjonalne: maksymalnie 5 × 25 MiB, JPEG/PNG/WebP/PDF, wyłącznie w
prywatnym Storage. Owner/Admin/Sales obsługują leady i statusy; eksport nie jest
jeszcze wdrożony.

Nie przyjęto fikcyjnego okresu retencji ani interpretacji prawnej. Automatyczne
usuwanie, DSAR, eksport i skaner malware pozostają jawnie otwarte przed Etapem
12 i produkcją.

**Aktualizacja po Etapie 12:** Owner-only eksport, retencja opt-in, legal hold,
storage-first erasure i fail-closed ClamAV zostały wdrożone technicznie.
Zatwierdzenie okresów, procedury DSAR, regionów, dostawców i podstaw prawnych
pozostaje bramką pilota z prawdziwymi danymi oraz produkcji.

## Rozstrzygnięcia robocze Etapu 8

Zgodnie z ADR-018 submit dopisuje potwierdzenie dla klienta oraz alert dla
najstarszego aktywnego Ownera. Dostawa działa asynchronicznie przez outbox,
ograniczony retry i wspólny renderer HTML/text. Test mode jest kompletną
lokalną ścieżką bez ruchu sieciowego.

Nie zatwierdzono jeszcze produkcyjnego dostawcy ani regionu danych. Adapter
Resend jest implementacją warunkową, nie decyzją procurementową. Nie wolno
ustawić `EMAIL_DELIVERY_MODE=resend` w produkcji przed oceną DPA,
subprocesorów, transferów, retencji metadanych, domeny nadawcy i wymaganych
mechanizmów bounce/complaint.

## Rozstrzygnięcia robocze Etapu 9

Zgodnie z ADR-019 nie przyjęto nieudokumentowanej podstawy prawnej ani
zewnętrznego providera. First-party eventy są zapisywane wyłącznie po jawnej,
nieblokującej zgodzie `analytics-v1`; wynik dashboardu opisuje więc populację
consented, nie cały ruch. Surowy event wygasa po 90 dniach, a grupa mniejsza niż
5 jest ukrywana.

Retencja technicznego dowodu decyzji, procedura DSAR po wygaśnięciu tokenu i
produkcyjny harmonogram purge pozostają bramkami Etapów 12–13. Eventy klienta
nie są traktowane jako źródło rozliczeń ani ochrony przed nadużyciem.

## Rozstrzygnięcia robocze Etapu 10

Zgodnie z ADR-020 brak zatwierdzonego modelu cenowego nie został zastąpiony
fikcyjnymi planami. `/cennik` opisuje wyłącznie indywidualnie ustalany program
pilotażowy i jawnie oznacza self-service jako nieustalony. Nie jest to akceptacja
kwot, limitów ani płatności.

Nazwa nadal jest robocza. Implementacja lokalna nie upoważnia do publicznego
launchu, zakupu domeny ani wydatków brandingowych. WordPress opisuje planowany
connector, ale nie twierdzi, że wtyczka Etapu 11 jest dostępna. Blog,
porównania, treści prawne i status nie otrzymały placeholderów; wymagają
odpowiednio źródłowej treści, review konkurencji, danych firmy i decyzji
prawnych.
