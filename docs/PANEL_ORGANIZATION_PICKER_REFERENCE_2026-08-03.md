# Referencyjny wybór organizacji Kwotum — korekta 12M-Y

**Data:** 2026-08-03

**Zakres:** `/panel` po uwierzytelnieniu

**Decyzja:** Y w `docs/ui/REFERENCE_MANIFEST.md`

## Referencja

Zaakceptowany załącznik ma 2872 × 1608 px i SHA-256
`783b30ceadefada2a5841af73c1b5334cb672f10723e555a53309d929975f133`.
Jego proporcje i gęstość odpowiadają kontrolnemu viewportowi około
2048 × 1152 px. Obraz blokuje geometrię headera, osi treści, nagłówka, karty,
avatara i akcji, ale nie blokuje widocznych liczb demonstracyjnych.

Plik:
`artifacts/visual-qa/12m-panel-shell/organization-picker-kwotum/reference-2872x1608.png`.

## Implementacja

- header ma 6,4 rem i duży znak Kwotum po lewej oraz realne wylogowanie po
  prawej;
- zawartość ma maksymalnie 78,75 rem, zwiększony oddech górny i typografię
  zgodną z referencją;
- każda organizacja pozostaje osobnym elementem listy i ma kartę 14,5 rem,
  avatar 4,85 rem oraz dwa prawdziwe linki;
- główne CTA jest zielone, a drugie prowadzi do Procesów dla Owner/Admin lub
  do Leadów dla Sales;
- metadane pokazują liczbę rekordów `published_flows`, liczbę leadów w stanie
  `new`/`in_progress` oraz najnowsze `submitted_at` albo `updated_at`;
- zapytania używają bieżącej sesji, jawnego `organization_id` i istniejących
  polityk RLS. Nie użyto service role ani danych z innego tenanta;
- wartości są odmieniane po polsku, a aktywność ma wariant dzisiaj, wczoraj,
  datę lub brak aktywności.

## Responsive i dostępność

Przy szerokości do 56 rem karta przechodzi do jednej kolumny, avatar ma
3,25 rem, metadane tworzą pionową listę, a oba przyciski dzielą dostępną
szerokość. Live runtime przy 510 px potwierdził 0 px poziomego overflow,
trzy metadane i działające hrefy. Kolejność DOM pozostaje: tożsamość → dane →
akcje.

Kontrakt E2E mierzy 2048 × 1152 oraz 390 × 844, zapisuje screenshoty i uruchamia
axe. W bieżącym środowisku pełne E2E wymaga opcjonalnych `PANEL_E2E_*`; nie
obchodzono logowania ani RLS.

## Weryfikacja

| Kontrola           | Wynik                          |
| ------------------ | ------------------------------ |
| Prettier           | PASS                           |
| ESLint             | PASS                           |
| TypeScript         | PASS                           |
| Vitest             | PASS, 25 plików i 88/88 testów |
| Live mobile 510 px | PASS, 0 px overflow            |
| Produkcyjny build  | PASS — 39 tras                 |

## Ryzyka i odbiór

- podsumowanie wykonuje cztery małe, równoległe zapytania na organizację;
  organizacje należą wyłącznie do aktywnych membershipów użytkownika;
- dla Sales liczba procesów jest zastępowana komunikatem „Dostęp do leadów”,
  ponieważ RLS nie udostępnia mu draftów ani publikacji;
- odbiór wymaga zgodnej osi 1260 px, realnych danych, dwóch działających akcji,
  braku overflow oraz zachowania pustego stanu i listy wielu organizacji.
