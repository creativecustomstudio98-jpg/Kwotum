# Visual QA — Etap 12ZK, polityka kontaktu buildera

## Zakres i źródło

- ekran: `/panel/[organizationId]/procesy/[flowId]`;
- zmieniony region: nowy obszar `Kontakt` w builderze procesu;
- referencja: geometria buildera zaakceptowana w Etapach 12W i 12X;
- viewporty: desktop 1448 × 1086 oraz mobile 390 × 844;
- wynik: **PASS, 19/20** — kompletność 4, geometria 4, typografia 4,
  gęstość i stany 3, transformacja mobile 4.

## Sprawdzone elementy

1. Osobna zakładka `Kontakt` nie zmienia granic i hierarchii istniejącego
   buildera.
2. Wymagany telefon oraz opcjonalny e-mail są opisane spójnie w ustawieniach,
   podglądzie i zapisywanej konfiguracji.
3. Informacja prywatności ma jawny tekst, wersję i opcjonalny adres HTTPS.
4. Załączniki pozostają wyłączone i zawierają ostrzeżenie o wymaganym skanerze
   malware.
5. Zgoda marketingowa pozostaje osobna i domyślnie wyłączona.
6. Desktop nie ma ucięć ani pionowego łamania informacji prawnej.
7. Mobile zachowuje czytelne pola, etykiety i pełną szerokość głównej akcji bez
   poziomego overflow.

## Artefakty

| Plik                            | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| `desktop/contact-1448x1086.png` | `c1fdf81d0470c0cf8fff53f0286a43c93a9e7e5b8bf60bc016b9b2f55817f530` |
| `mobile/contact-390x844.png`    | `f5e339de6bba006e64808e7d3a86fe118798eeb220269ab193c86ba2f752ef02` |

## Weryfikacja

- `PANEL_E2E_GREP='owner configures, previews and publishes pricing, scoring and result safely' PANEL_E2E_RETAIN_STAGE_ARTIFACTS=1 pnpm e2e:panel` — PASS, 1/1, axe bez naruszeń, cleanup 0;
- Web: 163/163 testów jednostkowych — PASS;
- lint, format, typecheck, build i RLS — PASS.

## Znane odchylenia

- zrzuty wykorzystują syntetyczny proces i syntetyczną treść prawną;
- opublikowanie pilota Fortez nadal wymaga akceptacji rzeczywistej informacji
  prywatności, UAT oraz zielonego gate'u scheduler/monitoring;
- załączniki nie mogą być włączone bez produkcyjnego skanera malware.
