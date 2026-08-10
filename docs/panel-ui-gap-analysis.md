# Analiza luk obecnego panelu Lorum

**Status:** zamknięty audyt stanu sprzed rekonstrukcji Etapu 12A  
**Data:** 2026-07-27

## 1. Inwentarz tras

| Istniejąca trasa                               | Obecny komponent                | Widok docelowy                 | Referencja                                          | Decyzja                                                               |
| ---------------------------------------------- | ------------------------------- | ------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------- |
| `/panel`                                       | `app/panel/page.tsx`            | zwarty wybór organizacji       | język form i list z planszy produktu                | zachować auth i query; przebudować kompozycję                         |
| `/panel/[organizationId]/leady`                | `leady/page.tsx`                | gęsta lista leadów             | `leads-list.png`                                    | zachować tenant query i filtry; dodać toolbar, liczniki i mobile list |
| `/panel/[organizationId]/leady/[leadId]`       | `leady/[leadId]/page.tsx`       | lead operacyjny                | pełny ekran 1448 × 1086                             | zachować wszystkie realne dane, signed URL i akcje; przebudować układ |
| `/panel/[organizationId]/analityka`            | `analityka/page.tsx`            | analityka operacyjna           | `analytics.png`, `dashboard.png`                    | zachować prywatny agregat i próg próbki; przebudować KPI i wykresy    |
| `/panel/[organizationId]/integracje/wordpress` | `integracje/wordpress/page.tsx` | zwarta konfiguracja integracji | `integrations.png`                                  | zachować token single-use, origin i revocation                        |
| `/panel/[organizationId]/prywatnosc`           | `prywatnosc/page.tsx`           | ustawienia prywatności         | `company-settings.png`, `notification-settings.png` | zachować owner-only i realny formularz retencji                       |

## 2. Brakujące powierzchnie względem MVP

| Powierzchnia              | Stan domeny                                        | Stan UI                     | Bezpieczny kierunek                                      |
| ------------------------- | -------------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| Dashboard organizacji     | dane leadów i agregaty istnieją                    | brak route’u                | osobny route z realnych agregatów; bez syntetycznych KPI |
| Lista procesów            | `flows`, wersje i RLS istnieją                     | brak route’u                | lista rzeczywistych draftów/wersji                       |
| Szablony branżowe         | pięć walidowanych szablonów w `@wyceno/validation` | brak route’u                | realna akcja tworzenia draftu z szablonu                 |
| Builder                   | draft JSONB, save, validate i publish istnieją     | brak route’u                | formularz trzyobszarowy nad istniejącym kontraktem       |
| Profil firmy              | częściowe dane organizacji istnieją                | brak bezpiecznej mutacji UI | nie pozorować zapisu; osobny etap domenowy               |
| Preferencje powiadomień   | outbox istnieje, preferencje nie                   | brak                        | nie renderować martwych toggle’i                         |
| Opiekun i kalendarz leada | brak modelu                                        | brak                        | nie wdrażać na podstawie obrazu                          |
| Node canvas               | funkcja poza MVP                                   | brak                        | jawnie wykluczyć                                         |

## 3. Mapa komponentów

| Docelowa rola          | Obecne źródło                    | Zachować                             | Przebudować lub dodać                      |
| ---------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------ |
| `PanelShell`           | `panel-app-shell`, `panel-shell` | Server Component layouts             | geometria rail/topbar/content              |
| `SidebarRail`          | `PanelNavigation`                | role-based items, aktywny route      | logo SVG, tooltips, mobile drawer/nav      |
| `PanelTopbar`          | lokalne `panel-header`           | semantyczne nagłówki                 | kontekst route’u i zwarte actions          |
| `StatusBadge`          | `wy-badge`, klasy statusu        | tekstowe statusy                     | wspólne warianty i gęstość                 |
| `DataTable`            | natywne tabele                   | semantyka `table`, `th`, tenant data | wysokości, toolbar, mobile transform       |
| `MetricCard`           | `analytics-stats`                | prawdziwe agregaty                   | jednolita wysokość i typografia            |
| `ChartCard`            | `progress`/listy                 | dostępne wartości tekstowe           | code-native SVG bars/ring bez zależności   |
| `LeadDocument`         | `lead-detail`                    | wszystkie dane i akcje               | pełna kompozycja referencyjna              |
| `ActivityTimeline`     | history, notes, notifications    | istniejące dane                      | jedna zwarta oś czasu                      |
| `IntegrationRow`       | tabela WordPress                 | token/revoke                         | kompaktowa lista i panel szczegółu         |
| `SettingsForm`         | `RetentionForm`                  | server action i walidacja            | gęsty układ pól, switch z natywnym input   |
| `Empty/Error/Skeleton` | `@wyceno/ui` i route boundaries  | komunikaty i retry                   | dopasowanie do shellu bez dużych dekoracji |

## 4. Elementy możliwe do zachowania

- App Router, Server Components i `force-dynamic`;
- `requireTenantContext`, capability checks i RLS;
- usługi leadów, analityki, prywatności, WordPress i flow;
- server actions statusu, notatki, retencji, tokenu i revocation;
- semantyczne tabele, formularze, labele i komunikaty live;
- współdzielone tokeny oraz prymitywy `@wyceno/ui`;
- `noindex` i `private, no-store` dla panelu;
- polskie formatowanie dat, walut i liczb;
- loading/error boundaries.

## 5. Elementy wymagające przebudowy

### Shell

- rail ma 68 px zamiast referencyjnych około 78–80 px;
- wordmark jest pionowym tekstem zamiast znaku `Logoicon.svg`;
- brak topbara wspólnego dla tras;
- tablet zamienia rail w stale widoczny poziomy pasek, a nie task-aware
  nawigację;
- content używa ogólnego max-width 78 rem i dużego górnego paddingu, przez co
  traci gęstość referencji.

### Leady

- brak toolbaru wyszukiwania, liczników filtrów i paginacji;
- wiersze są zbyt wysokie, header tabeli zbyt ciężki;
- brak avatara/inicjałów i wyraźnej osi wartości;
- mobile jest długim blokiem definicji zamiast zwartej listy leadów.

### Lead detail

- cały ekran jest jedną dużą dwukolumnową kartą z cieniem;
- brak nagłówkowej karty kontaktu i osobnych modułów wyniku/pliku;
- działania, notatki, historia, zgody i powiadomienia nie tworzą
  uporządkowanego panelu operacyjnego;
- brak kompaktowych tabs/anchor navigation;
- score i przyczyny nie mają hierarchii z pełnej referencji.

### Analityka

- pięć KPI nie odpowiada układowi referencji;
- listy `progress` nie budują czytelnego trendu ani rozkładu;
- zbyt dużo pionowych przerw, brak spójnych kart;
- zakres czasu jest oddzielnym paskiem, nie częścią nagłówka.

### Integracja i prywatność

- formularze są luźnymi sekcjami bez wspólnego settings shell;
- WordPress używa szerokiej tabeli zamiast listy integracji i panelu
  konfiguracji;
- checkbox retencji nie ma referencyjnej prezentacji switcha;
- przyciski i komunikaty mają niespójną gęstość.

## 6. Duplikacje i stare wzorce

- `panel-header` pełni jednocześnie page header, toolbar i breadcrumb;
- `lead-card`, `wordpress-card`, `analytics-card` i `wy-data-surface` opisują
  podobne powierzchnie różnymi regułami;
- statusy leadów mają lokalne klasy zamiast jednego mapowania wariantów;
- trzy tabele powielają padding, border i header;
- panel ma lokalne SVG obok wspólnego systemu ikon;
- desktopowy cień całego lead detail jest cięższy niż referencja;
- max-width i wysokie paddingi wywodzą się z marketingowej kompozycji, nie z
  narzędzia pracy.

Nie wykryto Tailwinda ani klas `rounded-xl`/`rounded-2xl`. Problemem nie jest
biblioteka, tylko niespójne lokalne kompozycje.

## 7. Brakujące stany

| Obszar          | Loading                     | Empty                     | Error                  | Permission               |
| --------------- | --------------------------- | ------------------------- | ---------------------- | ------------------------ |
| Leady           | istnieje skeleton           | istnieje                  | istnieje retry         | egzekwowane przez layout |
| Lead detail     | brak dedykowanego skeletonu | częściowe per sekcja      | wspólny boundary listy | generyczne 404           |
| Analityka       | istnieje                    | istnieje próg małej próby | istnieje retry         | capability w service     |
| WordPress       | istnieje                    | istnieje                  | istnieje retry         | ukryte przez capability  |
| Prywatność      | istnieje                    | n/d                       | istnieje retry         | owner-only               |
| Procesy/builder | brak UI                     | brak UI                   | brak UI                | domena ma capability     |

Nowe ekrany muszą mieć równoległe loading, empty, error i permission states.
Nie wolno zastępować normalnej aplikacji fixture’em wizualnym.

## 8. Ryzyka implementacyjne

1. Worktree zawiera rozległe, cudze zmiany, w tym aktywny Etap 12K auth.
   Zmiany panelu muszą pozostać w jego katalogach, usługach i dokumentacji.
2. Bazowy typecheck/build był początkowo czerwony przez równoległą zmianę
   `app/logowanie/sign-in-form.tsx`; poza zakresem panelu został później
   doprowadzony do zielonego stanu, więc wynik końcowy nie ukrywa tej historii.
3. Dashboard nie może obchodzić progu prywatności ani liczyć KPI w kliencie.
4. Nowy builder nie może wysyłać ceny/score jako wyniku klienta ani modyfikować
   opublikowanej wersji.
5. Mobile nie może maskować overflow przez `overflow-x: hidden`.
6. Brakujące pola z referencji nie mogą prowadzić do migracji danych w tym
   etapie.

## 9. Kryteria odbioru rekonstrukcji

- wszystkie istniejące trasy panelu używają jednego shellu i języka danych;
- żadna istniejąca funkcja, action, capability ani tenant filter nie znika;
- lista leadów pozostaje tabelą desktop i zwartą listą mobile;
- lead detail odtwarza pełny dokument i prawy panel na 1448 × 1086;
- analityka używa realnego agregatu i zachowuje prywatność małej próby;
- WordPress i retencja wykonują realne akcje;
- nowe powierzchnie flow korzystają wyłącznie z istniejącego kontraktu domeny;
- 320–1536 px nie mają niekontrolowanego overflow;
- klawiatura, focus, reduced motion, forced colors i axe przechodzą;
- istnieją reference/before/after/overlay/diff dla wdrożonych ekranów;
- lint, testy panelu i build nie zyskują nowych błędów.

## 10. Zamknięcie luk

Rekonstrukcja z 2026-07-27 zamknęła luki dashboardu, listy procesów, biblioteki
szablonów i buildera. Wszystkie trasy z sekcji 1 korzystają z jednego shellu,
a nowe route’y są indeksowane w `panel-visual-qa.md`. Profil firmy,
preferencje powiadomień, opiekun, kalendarz, źródło leada i node canvas
pozostają świadomie poza zakresem, ponieważ nie mają kompletnego kontraktu
domeny.

Ryzyko bazowego typecheck/build z sekcji 8 było prawdziwe na początku sesji;
końcowy pipeline po niezależnym domknięciu zmian auth jest zielony. Dokument
pozostaje zapisem porównania „przed”, a nie opisem aktualnego UI.
