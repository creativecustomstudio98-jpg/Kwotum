# DPA i rejestr podmiotów przetwarzających

## Status dokumentu

Materiał do review administratora danych i prawnika, nie podpisana umowa ani
porada prawna. Kod nie aktywuje produkcyjnego Resend, zewnętrznej analityki ani
danych rzeczywistych na podstawie tego dokumentu.

RODO wymaga m.in. ograniczenia czasu przechowywania, prawa dostępu i kopii,
usunięcia z wyjątkami, umowy z procesorem oraz adekwatnych i regularnie
testowanych zabezpieczeń ([art. 5, 15, 17, 28 i 32 RODO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)).
EDPB wskazuje też, że administrator powinien mieć łatwo dostępne tożsamości
procesorów i podprocesorów oraz zachowuje odpowiedzialność za wybór
([opinia EDPB 22/2024](https://www.edpb.europa.eu/news/edpb-adopts-opinion-on-processors-guidelines-on-legitimate-interest-statement-on-draft_ga)).

## Role do zatwierdzenia

- firma korzystająca z Lorum: co do zasady administrator danych respondentów;
- operator Lorum: podmiot przetwarzający na udokumentowane polecenie firmy;
- agencja obsługująca firmę: rola zależy od rzeczywistej decyzyjności i umowy;
- dostawca infrastruktury/e-maila: dalszy podmiot przetwarzający operatora.

Jeżeli agencja jest procesorem firmy, Lorum może być jej podprocesorem.
Rozstrzygnięcie musi znaleźć się w podpisanej umowie dla konkretnego wdrożenia.

## Załącznik przetwarzania — materiał roboczy

| Pole                 | Zakres                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Przedmiot i cel      | zebranie briefu, niewiążąca estymacja, kwalifikacja leada, przekazanie firmie, opcjonalne powiadomienie                      |
| Osoby                | respondenci i kontakty leadów, użytkownicy panelu, administratorzy WordPress                                                 |
| Dane                 | imię, e-mail, telefon, lokalizacja, odpowiedzi, budżet/termin, pliki, zgody, status i notatki; techniczne dane konta i sesji |
| Szczególne kategorie | niedozwolone przez założony cel; firma ma nie konfigurować pytań o takie dane                                                |
| Czas                 | przez okres umowy i zatwierdzoną politykę organizacji; lead retention domyślnie wyłączona                                    |
| Operacje             | zapis, organizacja, kalkulacja, odczyt, eksport, powiadomienie i trwałe usunięcie                                            |
| Instrukcje           | konfiguracja firmy, podpisana DPA i udokumentowane dyspozycje DSAR                                                           |
| Zakończenie          | eksport lub usunięcie zgodnie z wyborem administratora, z wyjątkami prawa i cyklem backupu                                   |

## Rejestr dostawców

| Dostawca        | Status w produkcie                                                        | Zakres                                           | Region/transfer                                                             | Wymagane działanie                                                |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Supabase        | wymagany przez obecną architekturę, instancja produkcyjna niezatwierdzona | PostgreSQL, Auth, Storage i operacje platformowe | region projektu do wyboru; własny łańcuch podprocesorów i możliwe transfery | wybrać region, zaakceptować aktualną DPA, TIA/SCC i subprocesorów |
| Resend          | adapter gotowy, produkcyjnie wyłączony                                    | adres odbiorcy, metadata i treść e-maila         | dostawca opisuje podstawowe operacje w USA                                  | zaakceptować DPA/TIA/subprocesorów albo wybrać innego dostawcę    |
| Hosting Next.js | niewybrany                                                                | requesty aplikacji, logi techniczne, runtime     | TBD                                                                         | procurement, DPA, region, retencja logów                          |
| ClamAV          | self-hosted w przyjętym wariancie                                         | bajty uploadu podczas skanu                      | ta sama zaufana infrastruktura                                              | nie wysyłać plików do publicznej usługi skanującej                |

Aktualna DPA Supabase z 1 czerwca 2026 wymienia podprocesorów w Schedule 3,
zobowiązania ochronne i 30-dniowe powiadomienie o zmianach
([Supabase DPA](https://supabase.com/downloads/docs/Supabase%2BDPA%2B260601.pdf)).
Lista musi zostać ponownie sprawdzona w dniu akceptacji, nie skopiowana na stałe
do umowy.

Resend publikuje DPA z SCC i 14-dniowym powiadomieniem o zmianach
([Resend DPA](https://resend.com/legal/dpa)). Jego
[lista podprocesorów](https://resend.com/legal/subprocessors) była
zaktualizowana 15 lipca 2026 i obejmuje dostawców w USA. Aktywacja Resend
wymaga osobnej decyzji o transferze; sama obecność adaptera nie jest zgodą.

## Checklist review prawnego i procurement

- [ ] Ustalić i podpisać role stron oraz załącznik art. 28.
- [ ] Wybrać region produkcyjny Supabase i hostingu.
- [ ] Zweryfikować SCC/TIA, jurysdykcje i dodatkowe zabezpieczenia.
- [ ] Zatwierdzić okresy: leady/pliki, niedokończone sesje, consent, audit, logi i backup.
- [ ] Ustalić procedurę sprzeciwu wobec nowych podprocesorów.
- [ ] Ustalić kontakty i terminy pomocy przy DSAR oraz incydencie.
- [ ] Zatwierdzić treści informacji prywatności i podstawy prawne.
- [ ] Zapisać datę, osobę zatwierdzającą, wersje dokumentów dostawców i dowody akceptacji.

Do wykonania checklisty status pozostaje `LEGAL REVIEW REQUIRED`.
