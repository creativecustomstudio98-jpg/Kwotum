# Visual QA — mobilna nawigacja panelu

**Data:** 2026-07-29  
**Zakres:** wspólna nawigacja `/panel/[organizationId]` przy 320–768 px  
**Referencja rozmowy:**
`docs/ui/lorum-product-ui-reference-v1/reference/screenshots/dashboard-mobile.png`,
390 × 844  
**Stan przed:** `before.png`, 375 × 812  
**Stan końcowy:** `after-v2-dashboard-390x844.png` i
`after-v2-more-390x844.png`, 390 × 844

## Decyzja

Desktopowy sidebar pozostaje bez zmian. Na mobile zastępuje go osobna,
nieprzewijana nawigacja dolna na białej powierzchni. Cztery najczęstsze
destynacje są zawsze dostępne: Start, Leady, Procesy i Analityka. Piąta pozycja
„Więcej” otwiera modalny arkusz dolny dla rzadszych narzędzi, konta i pomocy.
Widoczność pozycji nadal wynika z uprawnień użytkownika.

Na szczególe leada, w builderze procesu i podczas instalacji procesu globalny
pasek znika. Są to widoki zadaniowe z własną nawigacją i akcjami; utrzymywanie
drugiego stałego paska zmniejszałoby przestrzeń oraz tworzyło konkurujące
kontrolki.

## Różnice i uzasadnienie

1. Ciemnozielony, poziomo przewijany pasek został zastąpiony białą powierzchnią
   zgodną z zaakceptowaną referencją.
2. Liczbę pozycji pierwszego poziomu ograniczono do pięciu, dzięki czemu pasek
   nie przewija się nawet przy 320 px.
3. „Dashboard” skrócono na mobile do „Start”, aby poprawić skanowanie i
   szerokość celu dotykowego.
4. Aktywna pozycja używa zielonej ikony, miękkiego pola oraz cienkiego
   wskaźnika przy górnej krawędzi zamiast dużego, ciemnego prostokąta.
5. Ikony mają wspólny obrys 1,6–1,7 px i rozmiar 20 px. „Więcej” używa siatki
   czterech modułów zamiast niejednoznacznych kropek.
6. Cele dotykowe mają co najmniej około 54 px wysokości, a pasek uwzględnia
   `safe-area-inset-bottom`.
7. Na tabletach pozycje nie rozciągają się na całą szerokość ekranu; wspólny
   obszar ma maksymalnie 576 px i pozostaje wycentrowany.
8. Arkusz „Więcej” grupuje Szablony, Integracje, Ustawienia, prywatność,
   powiadomienia i pomoc bez tworzenia nieaktywnych skrótów.
9. Arkusz blokuje scroll tła, przenosi fokus na zamknięcie, zamyka się klawiszem
   Escape i zatrzymuje Tab wewnątrz dialogu.
10. Treść strony rezerwuje wysokość paska, więc ostatnie elementy nie są
    zasłaniane. Po ukryciu paska w widokach zadaniowych rezerwa znika.

## Ocena

| Kryterium            |     Wynik |
| -------------------- | --------: |
| Kompletność          |       4/4 |
| Geometria            |       4/4 |
| Typografia i ikony   |       3/4 |
| Gęstość informacji   |       4/4 |
| Transformacja mobile |       4/4 |
| **Łącznie**          | **19/20** |

Punkt typograficzny pozostaje świadomie otwarty: etykiety 10,4 px odpowiadają
gęstości referencji i przeszły kontrast, ale w przyszłości warto je sprawdzić
na urządzeniach z wymuszonym bardzo dużym tekstem systemowym.

## Dowody

- `side-by-side-v2.png` — referencja, stan przed i stan końcowy;
- `overlay-v2.png` — 50% referencja / stan końcowy;
- `difference-v2.png` — różnica znormalizowanych cropów;
- `after-v2-dashboard-390x844.png` — pasek na prawdziwych danych QA;
- `after-v2-more-390x844.png` — pełny arkusz „Więcej”.
- `after-v2-more-sheet-crop.png` — czysty crop powierzchni arkusza.

Playwright potwierdza 320, 390, 430 i 768 px, brak poziomego overflow,
nieprzewijaną geometrię paska, focus trap, Escape, przywrócenie fokusu,
blokadę scrolla, ukrycie w drill-down oraz brak naruszeń axe WCAG A/AA.
