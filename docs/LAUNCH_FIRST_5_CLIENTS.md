# Start sprzedaży — pierwszych pięciu klientów Kwotum

**Status:** plan operacyjny, wdrożenie zablokowane przez P0  
**Ostatni przegląd:** 2026-08-09

## Model pierwszego etapu

Kwotum jest usługą wdrażaną przez właściciela, nie pustym self-service. Klient
otrzymuje wspólnie skonfigurowany proces kwalifikacji, gotowy embed/hosted link,
panel leadów i pierwszą optymalizację. Początkowy segment to firmy wykonujące
drogie, niestandardowe usługi — przede wszystkim meble, kuchnie i zabudowy na
wymiar. Kwotum pozostaje CRM-light i nie zastępuje pełnego CRM.

Prawdziwe dane wolno przyjąć dopiero po zamknięciu P0 w
`PRODUCTION_READINESS.md`, podpisanym UAT i decyzji GO dla jednej organizacji.

## Oferta Founding Client

### Standard — 599 zł netto / miesiąc

- jeden proces i jedna domena;
- podstawowa logika warunkowa i scoring;
- panel leadów, powiadomienia i branding;
- podstawowa optymalizacja procesu.

### Pro — 999 zł netto / miesiąc

- do trzech procesów;
- zaawansowana logika i upload plików;
- rozbudowany scoring;
- webhook lub jedna integracja dopiero po zamknięciu ADR-033/Etapu 12ZF;
- analityka procesu, regularna optymalizacja i priorytetowe wsparcie.

Warunki programu: pierwszy miesiąc abonamentu gratis, osobna opłata
wdrożeniowa, maksymalnie pięć firm, preferencyjna cena przez 12 miesięcy.
Wysokość opłaty wdrożeniowej, podatki, regulamin i zakres wsparcia wymagają
zatwierdzenia przed publikacją. Nie stosujemy fikcyjnego licznika miejsc.

## Lejek sprzedażowy do wdrożenia

1. Landing komunikuje: „Otrzymuj kompletne zapytania, zanim oddzwonisz”.
2. Główne CTA: „Umów audyt zapytań” albo „Zobacz proces dla swojej firmy”.
3. Drugie CTA: „Zobacz przykładowe zapytanie”.
4. Działające demo pokazuje zakres → budżet → termin → lokalizację → materiały
   → gotowy brief.
5. Formularz kwalifikacyjny zbiera wyłącznie dane potrzebne do rozmowy:
   firmę, WWW, branżę, wolumen i wartość zapytań, źródła, obecny proces,
   brakujące informacje, CRM, osobę odpowiedzialną, e-mail, telefon i termin.
6. Zgłoszenie trafia do wyznaczonego właściciela i ma status oraz źródło/UTM.
7. Po wysłaniu użytkownik dostaje jednoznaczne potwierdzenie i następny krok.

CTA, formularza i kwot nie uznaje się za wdrożone, dopóki E2E nie potwierdzi
realnej dostawy zgłoszenia. Analytics nie może otrzymywać PII ani odpowiedzi.

Minimalne eventy sprzedażowe: `marketing_page_view`, `primary_cta_click`,
`demo_start`, `demo_step_complete`, `demo_complete`, `founding_form_start`,
`founding_form_submit`, `meeting_click`, `meeting_booked`.

## Onboarding jednego klienta

1. Zweryfikować podpisane DPA, role stron i zakaz danych szczególnych.
2. Utworzyć osobny tenant i zaprosić użytkownika klienta.
3. Wybrać szablon branżowy.
4. Przeprowadzić warsztat pytań i wyjątków.
5. Skonfigurować pricing, scoring, consultation/no-price i disclaimer.
6. Ustawić treść informacji, zgody i retencję.
7. Dopasować branding bez lokalnej zmiany tokenów produktu.
8. Ustawić domenę/origin i sposób publikacji.
9. Zainstalować widget lub przygotować hosted link.
10. Sprawdzić desktop, mobile, klawiaturę i czytnik ekranu.
11. Sprawdzić upload, skan, signed URL i plik obcego tenanta.
12. Sprawdzić e-mail klienta i firmy.
13. Sprawdzić role Owner/Admin/Sales i odmowę drugiej organizacji.
14. Wysłać syntetyczny lead testowy i zmienić jego status.
15. Potwierdzić analitykę bez PII.
16. Wykonać backup point i potwierdzić możliwość rollbacku.
17. Podpisać UAT oraz protokół GO/NO-GO.
18. Opublikować z możliwością natychmiastowego wyłączenia embedu.
19. Monitorować pierwszy tydzień w trybie hypercare.
20. Po pierwszych danych przeprowadzić wspólną optymalizację.

Docelowy czas standardowego wdrożenia to jeden dzień roboczy po otrzymaniu
kompletnych, zatwierdzonych informacji. Do czasu pomiaru pierwszych wdrożeń jest
to cel operacyjny, nie obietnica marketingowa.

## Checklista przed każdym uruchomieniem

- [ ] immutable SHA i zielone CI/Semgrep CE/Gitleaks;
- [ ] staging smoke oraz aktualne migracje;
- [ ] tenant, role, RLS i test drugiej organizacji;
- [ ] zatwierdzony flow, wersja, pricing/scoring i disclaimer;
- [ ] domena/origin, TLS, CSP i noindex prywatnych tras;
- [ ] upload/ClamAV, signed URL i retencja;
- [ ] e-mail, scheduler, alerty i dane kontaktowe supportu;
- [ ] backup point, restore drill aktualny i rollback gotowy;
- [ ] UAT desktop/mobile/accessibility;
- [ ] syntetyczny submit, lead w panelu, status i powiadomienie;
- [ ] DPA, privacy, regulamin i zgody zatwierdzone;
- [ ] decyzja GO z ownerem, datą i planem wyłączenia.

## Metryki pierwszych pięciu wdrożeń

Mierzymy bez PII: czas konfiguracji, installation verified, test lead, first
real lead, completion rate, drop-off, odsetek kompletnych leadów, czas do
kontaktu, accepted/rejected, meeting, quote i won/lost. Przed startem każdej
firmy zapisujemy baseline oraz próg go/no-go. Wyników pięciu firm nie
przedstawiamy jako dowodu rynkowego bez kontekstu i zgody.
