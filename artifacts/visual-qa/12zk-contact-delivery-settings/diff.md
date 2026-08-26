# Visual QA — Etap 12ZK

## Zakres i źródło

- trasa: `/panel/[organizationId]/ustawienia`;
- zmieniony region: nowa karta `Dostawa nowych leadów` dla Owner/Admin;
- kanoniczny stan przed: `artifacts/visual-qa/12s-remaining-screens/after/organization-settings-1536x1024.png`, SHA-256 `af0e83d101f559587ba060072a20a56429102fcca4606001685c88f40f135766`;
- desktop: viewport 1536 × 1024;
- mobile: viewport 390 × 844, zrzut po przewinięciu do dolnej części strony;
- wynik: **PASS, 19/20** — kompletność 4, geometria 4, typografia 4, gęstość i stany 3, transformacja mobile 4.

## Największe różnice

1. Pomiędzy danymi organizacji a granicą danych pojawia się osobna karta dostawy leadów.
2. Nagłówek jednoznacznie oddziela adres operacyjny od kont użytkowników panelu.
3. Chip `Owner / Admin` pokazuje rzeczywisty zakres uprawnień.
4. Pole ma etykietę, typ `email`, walidację serwerową i neutralny placeholder.
5. Tekst pomocniczy wyjaśnia obsługę przekierowania oraz brak wymogu konta odbiorcy.
6. Akcja `Zapisz adres` jest prawdziwym formularzem, nie atrapą.
7. Desktop zachowuje wspólną oś, szerokość kart i rytm istniejących ustawień.
8. Mobile składa kartę do jednej kolumny; etykieta, pole, opis i przycisk pozostają czytelne.
9. Przy 390 px nie występuje poziomy overflow, a dolna nawigacja nie blokuje akcji po przewinięciu.
10. Różnica pełnoekranowa zawiera także losowe identyfikatory fixture oraz równoległe zmiany marki Etapu 12ZL; nie są one częścią decyzji 12ZK.

## Artefakty

| Plik                       | SHA-256                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `before-1536x1024.png`     | `af0e83d101f559587ba060072a20a56429102fcca4606001685c88f40f135766` |
| `after-1536x1024.png`      | `17f8b71b8eec24c86c0dafef8bb8f0cd7f697a379b36f6279a1756e59d274f75` |
| `difference-1536x1024.png` | `a801a6631a829271f9bb6db50ddc92e3a6b422b9bd76d7c550cef89bf63280fe` |
| `after-390x844.png`        | `672aef3fa5a2254f3b38fc73ec471d8988f0892b3596ea1955036e079018143c` |

## Weryfikacja

- `PANEL_E2E_GREP='remaining operational screens' PANEL_E2E_RETAIN_STAGE_ARTIFACTS=1 pnpm e2e:panel` — PASS, 1/1, axe bez naruszeń, cleanup 0;
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — PASS;
- pełny `pnpm e2e:panel` nie jest zielonym gate'em bieżącego drzewa z powodu równoległego Etapu 12ZL: jego ekran wyboru organizacji zgłasza istniejące naruszenia kontrastu. Scenariusz 12ZK pozostaje izolowany i zielony.

## Znane odchylenia

- brak osobnej zewnętrznej referencji dla tej funkcjonalnej karty; jej anatomia dziedziczy zaakceptowany ekran ustawień 12S;
- screenshot pokazuje stan początkowy pola; zachowanie zapisu, odmowy ról i tenant isolation pokrywają testy serwisowe i SQL;
- wdrożenie migracji oraz syntetyczny test rzeczywistej dostawy pozostają produkcyjnym gate'em.
