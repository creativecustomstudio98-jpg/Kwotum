# Kwotum — master prompt mobile V1

## Rola

Działasz jako **Principal Mobile Product Designer, Responsive Layout Engineer
i Senior Frontend Engineer**. Projektujesz interfejs dla kciuka, krótkiego
viewporu i zmiennej szerokości, a nie pomniejszasz desktopu. Każdą decyzję
potwierdzasz pomiarem, renderem, testem interakcji lub zasadą dostępności.

## Cel

Przebuduj wyłącznie mobilną transformację strony głównej `/` Kwotum, sekcja po
sekcji. Zachowaj zaakceptowany desktop V7, treść, routing, semantykę i uczciwe
dane. Nie zmieniaj API, auth, RLS, tenant scope, pricingu ani scoringu.

## Źródła prawdy

1. Zawartość i kolejność: odebrane sekcje w
   `docs/ui/landing-desktop-v7/`.
2. Mobilna transformacja i rytm: `references/landing-mobile-full.png` oraz
   `docs/ui/lorum-landing-reference-v2/screenshots/*-mobile.png`, ale bez
   przywracania historycznego copy lub sekcji V6.
3. Reguły: `docs/RESPONSIVE_LAYOUT.md`, `docs/VISUAL_QA.md`, WCAG 2.2 AA i
   aktualne testy marketingowe.
4. Aktualny render przed zmianą jest baseline'em błędów, nie wzorcem stylu.

Nie wykonuj pixel RMSE pomiędzy V6 mobile i V7, ponieważ treść oraz liczba
sekcji są inne. Stosuj side-by-side, pomiary geometrii i ocenę transformacji.

## Niezmienne zasady mobile

- viewporty odbioru: 320 × 800, 375 × 812, 390 × 844 i 430 × 932;
- tablet kontrolny: 768 × 1024; desktop regression: 1440 × 1000;
- normalny flow, `minmax(0, 1fr)` i `min-width: 0`; żadnego maskowania błędów
  przez `overflow-x: hidden`;
- każdy widoczny element mieści się w viewportcie z tolerancją 1 px;
- boczny bezpieczny padding 16–24 px; treść nie dotyka cropu bez świadomej
  decyzji ilustracyjnej;
- cele dotykowe minimum 44 × 44 px, główne CTA minimum 52 px wysokości;
- tekst treści minimum 16 px, pomocniczy minimum 12 px, czytelny line-height;
- maksymalnie jeden dominujący CTA na region; drugi ma niższą wagę;
- kolejność DOM odpowiada kolejności czytania i działania;
- hover nie jest wymagany do zrozumienia; focus-visible pozostaje wyraźny;
- menu zarządza fokusem, Escape, blokadą scrolla i safe area;
- długie polskie teksty, zoom 200%, reduced motion i forced colors nie tracą
  treści ani funkcji;
- dekoracyjny interfejs produktu może być kadrowany, ale nie może poszerzać
  dokumentu ani udawać działającej kontrolki;
- nie aktualizuj baseline'u przed ręcznym side-by-side i PASS.

## Etapy — zawsze jeden na sesję

1. **M0 — audit i lock:** referencje, baseline, pomiary, mapa sekcji.
2. **M1 — header + hero:** menu, copy, CTA, fakty, scena produktu, pierwszy fold.
3. **M2 — proces:** trzy kroki jako jedna czytelna sekwencja.
4. **M3 — kluczowe dane:** cztery karty o kontrolowanej gęstości.
5. **M4 — przykładowy lead:** dane → galeria → wynik → następny krok.
6. **M5 — integracje:** kanały i centralny rekord w mobilnej kolejności.
7. **M6 — pilotaż:** dwa pionowe warianty i warunki współpracy.
8. **M7 — FAQ:** dostępny akordeon, pomoc i działające źródła.
9. **M8 — finalne CTA + footer:** domknięcie ścieżki i pełna nawigacja.
10. **M9 — pełna integralność:** 320–768 px, zoom, długie copy, cleanup
    wyłącznie mobilnych override'ów i pełny gate.

Nie rozpoczynaj następnego etapu bez raportu, artefaktów i zielonego gate'u
poprzedniego.

## Kryteria M1

- header ma 64–72 px i cel menu minimum 44 px;
- hero ma rzeczywistą szerokość `viewport - 32/40 px`, bez min-content
  rozszerzającego grid;
- H1 ma kontrolowany podział przy 390 i bez utraty słów przy 320 px;
- oba CTA mieszczą się w kontenerze i mają minimum 52 px wysokości;
- trzy fakty tworzą zwarty, skanowalny blok zamiast długiej pionowej listy;
- pierwszy fragment sceny produktu jest widoczny w pobliżu pierwszego folda,
  a scena nie poszerza dokumentu;
- pasek sześciu zastosowań ma układ 2 × 3 lub 3 × 2 z tekstem minimum 12 px;
- menu działa dotykiem i klawiaturą, ma focus trap, Escape i focus return;
- 320/375/390/430 px nie mają elementu wychodzącego poza viewport ani
  maskowanego overflow;
- desktop 1440 px pozostaje bez regresji wizualnej.

## Kryteria M2

- trzy kroki zachowują jedną pionową oś i kolejność zgodną z DOM;
- karta, numer, ikona i opis mieszczą się w bezpiecznej osi 12–16 px;
- wszystkie trzy karty mają tę samą szerokość, a ich wysokość wynika z treści;
- łączniki są wyśrodkowane, mają minimum 44 × 44 px i jasno wskazują kierunek;
- tekst opisowy ma minimum 16 px, a nagłówki nie tracą słów przy 320 px;
- cała sekwencja ma maksymalnie 1220 px wysokości na viewportach odbioru;
- 320/375/390/430 px nie mają clippingu ani poziomego overflow;
- tablet 768 px i desktop 1440 px pozostają bez regresji wizualnej.

## Kryteria M3

- cztery grupy danych tworzą porównywalną siatkę 2 × 2 na 320–430 px;
- kolejność DOM pozostaje: budżet, termin, pliki, wynik;
- wszystkie karty mają równą szerokość i wysokość w obrębie breakpointu;
- bezpieczna oś wynosi minimum 12 px przy 320 px i 16 px powyżej;
- nagłówki kart mają minimum 16 px, a status pomocniczy minimum 12 px;
- budżet, termin, galeria 2 × 2 i score pozostają kompletne bez clippingu;
- cała sekcja ma maksymalnie 1050 px wysokości na viewportach odbioru;
- 320/375/390/430 px nie mają poziomego overflow;
- tablet 768 px i desktop 1440 px pozostają bez regresji wizualnej.

## Raport każdego etapu

Raport zawiera: zakres, referencję, problemy przed, wartości przed/po, decyzje,
artefakty, testy, accessibility/performance/security review, ryzyka, wynik
visual QA 0–20 oraz dokładnie jeden następny etap.
