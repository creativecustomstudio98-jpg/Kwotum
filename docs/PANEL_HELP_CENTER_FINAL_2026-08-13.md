# Tenantowe centrum pomocy — raport końcowy 2026-08-13

## Wynik

Zakładka „Pomoc” jest wewnętrzną częścią panelu pod
`/panel/[organizationId]/pomoc`. Zastępuje wcześniejsze przejście do
marketingowego `/jak-dziala` i opisuje wyłącznie funkcje obecne w aplikacji.
Implementacja nie dodaje kanału supportu, CRM, synchronizacji kalendarza,
billingu ani innych funkcji spoza zakresu produktu.

## Architektura informacji

Poradnik zawiera 19 instrukcji w siedmiu grupach:

1. pierwsze kroki;
2. leady i obsługa;
3. procesy i formularze;
4. dane i powiadomienia;
5. integracje;
6. administracja;
7. rozwiązywanie problemów.

Każda instrukcja ma krótki cel, konkretną sekwencję czynności oraz link do
rzeczywistego ekranu. Wyszukiwanie obejmuje tytuły, treść kroków i synonimy,
normalizuje wielkość liter oraz polskie znaki. Bez JavaScriptu serwer nadal
renderuje całą treść dostępną dla bieżącej roli; klient dodaje filtrowanie i
licznik wyników `aria-live`.

## Role i bezpieczeństwo

Strona wymaga aktywnego `TenantContext`. Instrukcje są filtrowane przez
`hasCapability`, tym samym mechanizmem co moduły panelu:

- Właściciel widzi pełny poradnik;
- Administrator widzi procesy i integracje, ale nie właścicielską prywatność;
- Sprzedaż widzi leady, podsumowanie analityczne, powiadomienia i pomoc
  operacyjną, bez buildera, integracji i ustawień właściciela.

Linki tenantowe są budowane z identyfikatora kontekstu. Strona ma `noindex`,
nie ujawnia sekretów ani danych klientów i przypomina o ich maskowaniu podczas
diagnostyki. Nie zmieniono RLS, API, bazy ani modelu uprawnień.

## Interfejs i dostępność

Desktop korzysta bezpośrednio z białej powierzchni workspace, bez dodatkowej
karty, wewnętrznego tła, obwódki i cienia. Separatory występują wyłącznie
między rzeczywistymi sekcjami poradnika. Lewy spis treści i prawa kolumna
instrukcji tworzą jeden płaski układ. Mobile zachowuje tę samą kolejność DOM,
zwija układ do jednej kolumny i udostępnia spis treści jako przewijalny zestaw skrótów.
Sekcje używają natywnego `details/summary`, działają z klawiatury i respektują
`prefers-reduced-motion` oraz forced colors.

Pierwszy audyt axe wykrył niedostateczny kontrast numerów szybkich ścieżek oraz
etykiety spisu treści. Kolory przyciemniono i powtórzony audyt WCAG A/AA nie
wykazał naruszeń. Oba viewporty mają 0 px poziomego overflow.

## Poprawka szczegółów leada

Wewnętrzny wrapper treści obu drugorzędnych akcji ma teraz `inline-flex`,
`align-items: center` oraz jawny `line-height: 1`; SVG jest elementem blokowym.
Naprawia to bazowe wyrównanie ikony kalendarza i znacznika wyboru bez zmiany
rozmiaru przycisków, dialogów ani zapisu zadań. E2E mierzy środek ikony i
tekstu; dopuszczalne odchylenie wynosi maksymalnie 1 px.

## Visual QA

Centrum pomocy nie ma osobnej referencji pixel-perfect. Używa zaakceptowanego
shella panelu P1 oraz płaskiej anatomii ekranów Ustawienia i Powiadomienia.
Nie raportujemy sztucznego RMSE ani overlayu dla nieistniejącego obrazu.

- wynik: 19/20;
- desktop: `artifacts/visual-qa/12zr-help-center/after-desktop-1536x1024.png`;
- mobile: `artifacts/visual-qa/12zr-help-center/after-mobile-390x844.png`;
- szczegóły leada:
  `artifacts/visual-qa/12o-lead-detail-responsive/after-production-1536x1024.png`.

## Weryfikacja

- `pnpm --filter @wyceno/web test` — 46 plików, 187 testów, PASS;
- `pnpm --filter @wyceno/web lint` — PASS;
- `pnpm --filter @wyceno/web typecheck` — PASS;
- `pnpm build` — 16/16, PASS;
- E2E Pomocy na produkcyjnym standalone — 1/1, PASS;
- E2E szczegółów leada na produkcyjnym standalone — 1/1, PASS;
- axe WCAG A/AA — 0 naruszeń po korekcie;
- cleanup jednorazowych tenantów — 0 pozostałości.

## Ryzyka i rollback

Treść poradnika musi być aktualizowana razem ze zmianami tras lub możliwości
modułów. Testy ról chronią przed podstawową regresją ujawnienia instrukcji, ale
przegląd treści pozostaje częścią Definition of Done nowej funkcji.

Rollback jest kodowy: przywrócić poprzedni link `/jak-dziala`, usunąć trasę
`pomoc` i jej style. Nie wymaga migracji ani modyfikacji danych.
