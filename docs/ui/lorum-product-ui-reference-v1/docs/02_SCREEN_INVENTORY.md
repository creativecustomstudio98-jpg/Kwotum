# 02 — Inwentarz ekranów

**Status:** CANONICAL

## A. Ekrany z pełną referencją wizualną

| Moduł | Widok | Desktop | Mobile | Referencja |
|---|---|---:|---:|---|
| Dashboard | stan operacyjny | tak | tak | `dashboard-desktop.png`, `dashboard-mobile.png` |
| Leady | lista i filtry | tak | tak | `leads-desktop.png`, `leads-mobile.png` |
| Leady | szczegóły | tak | tak | `lead-detail-desktop.png`, `lead-detail-mobile.png` |
| Builder | edycja kroku | tak | tak | `builder-desktop.png`, `builder-mobile.png` |
| Reguły | logika, wycena, scoring, wynik | tak | zasady responsive | `rules-desktop.png` |
| Analityka | lejek, trend, źródła | tak | zasady responsive | `analytics-desktop.png` |
| Szablony | biblioteka | tak | zasady responsive | `templates-desktop.png` |
| Instalacja | embed i WordPress | tak | zasady responsive | `installation-desktop.png` |
| Integracje | połączenia i webhooki | tak | zasady responsive | `integrations-desktop.png` |
| Agency | klienci | tak | zasady responsive | `clients-desktop.png` |
| Ustawienia | organizacja i obszar | tak | zasady responsive | `settings-desktop.png` |
| Onboarding | wybór punktu startowego | tak | tak | `onboarding-desktop.png`, `onboarding-mobile.png` |
| Widget | pytanie | tak | tak | `widget-desktop.png`, `widget-mobile.png` |
| Widget | wynik | tak | zasady responsive | `widget-result-desktop.png` |

Wszystkie pliki znajdują się w `reference/screenshots/`.

## B. Ekrany do implementacji przez analogię do referencji

### B1. Procesy

- lista procesów,
- szczegóły procesu / health,
- historia wersji,
- publikacja i porównanie draftu,
- archiwizacja,
- duplikowanie,
- permissions state.

### B2. Builder — podwidoki

- lista odpowiedzi,
- edycja odpowiedzi,
- typ pola,
- upload,
- dane kontaktowe,
- zgoda,
- ekran informacji,
- wynik,
- start screen,
- grupy kroków,
- zależności kroku,
- walidacja ścieżki.

### B3. Reguły

- lista reguł wyceny,
- edytor reguły ceny,
- lista reguł scoringu,
- explainability,
- warianty wyniku,
- test case runner,
- błędy pętli i martwe ścieżki.

### B4. Ustawienia

- branding widgetu,
- domeny,
- powiadomienia,
- szablony e-mail,
- zespół i role,
- prywatność i retencja,
- eksport/usuwanie danych,
- API keys,
- billing i usage,
- danger zone.

### B5. Integracje

- katalog integracji,
- konfiguracja połączenia,
- OAuth callback state,
- webhook detail,
- delivery log detail,
- retry confirmation,
- mapowanie pól,
- API documentation.

### B6. Agency

- szczegóły klienta,
- uprawnienia klienta,
- klonowanie procesu,
- rozliczenia i marża,
- white-label,
- zaproszenie klienta,
- limity i alerty usage.

### B7. Auth i konto

- logowanie,
- rejestracja,
- reset hasła,
- weryfikacja e-mail,
- zaproszenie do organizacji,
- brak dostępu,
- wygasła sesja,
- wybór organizacji.

### B8. Stany systemowe

- loading,
- skeleton,
- empty,
- error,
- offline,
- permission denied,
- 404,
- 500,
- maintenance,
- rate limit,
- flow unpublished,
- flow archived,
- hosted link unavailable.

## C. Zasada analogii

Ekran bez osobnego screenshotu nie daje Codexowi prawa do wymyślenia nowego języka wizualnego. Musi użyć:

- tego samego shellu,
- tych samych tokenów,
- tej samej gęstości,
- tych samych komponentów,
- tej samej logiki statusów,
- tej samej hierarchii,
- istniejących wzorców desktop/mobile.

Nowy wzorzec komponentu wymaga uzasadnienia i dopisania do `docs/DESIGN_SYSTEM.md` lub odpowiednika w repozytorium.
