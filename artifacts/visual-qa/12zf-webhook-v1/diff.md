# Etap 12ZF — webhook v1

## Źródło i viewporty

- źródło anatomii integracji: `artifacts/visual-qa/12s-remaining-screens/after/integrations-1536x1024.png`;
- SHA-256 źródła: `208f8d84508909fee0c5baed36c6ce773b8fee4d64dd0d1e406a14754c8c8296`;
- źródło znormalizowano wyłącznie do overlay 1448 × 1086; nie jest referencją
  treści webhooka ani podstawą do twierdzenia pixel-perfect;
- desktop: Chromium, viewport i finalny render 1448 × 1086;
- mobile: Chromium 390 × 844, zapis pełnej strony 390 × 1762;
- reflow i forced colors: 320 × 800.

## Wynik

**PASS — 19/20**

| Kryterium              | Wynik | Uzasadnienie                                                                      |
| ---------------------- | ----: | --------------------------------------------------------------------------------- |
| kompletność regionów   |   4/4 | konfiguracja, stany endpointu, akcje, sekret one-time i historia dostaw           |
| geometria i proporcje  |   4/4 | wspólny shell, oś treści, karty i rytm integracji zgodne z ekranem 12S            |
| typografia i spacing   |   4/4 | tokeny `packages/ui`, hierarchia i kod techniczny bez lokalnego driftu            |
| gęstość danych i stany |   4/4 | delivered, retry, dead-letter i brak PII w historii                               |
| transformacja mobile   |   3/4 | pełny reflow i cele 44 px; brak osobnej zaakceptowanej referencji webhooka mobile |

## Największe świadome różnice

1. Referencja 12S pokazuje WordPress, a finalny ekran rzeczywisty webhook v1.
2. Nagłówek opisuje podpisany `lead.created`, nie status wtyczki.
3. Górna karta zawiera działający formularz HTTPS zamiast klucza instalacji.
4. Sekret jest widoczny tylko po utworzeniu lub rotacji, nigdy w baseline.
5. Endpoint ma test, rotację i wyłączenie z potwierdzeniem ryzyka.
6. Historia pokazuje techniczne stany dostaw bez URL-u, payloadu i PII.
7. Dead letter jest jawnym stanem operacyjnym zamiast dekoracyjnego KPI.
8. Desktop ma większą wysokość, aby zmieścić realne stany i instrukcję HMAC.
9. Mobile składa kontrolki do pełnej szerokości i zachowuje dolną nawigację.
10. Brak fikcyjnych statystyk, logotypów odbiorców i nieistniejących providerów.

Różnice są wynikiem ADR-034 i prawdziwego modelu danych, nie brakiem
implementacji. Overlay służy do oceny osi, skali, hierarchii i gęstości.

## Dowody

- `reference-integrations-1448x1086.png` — deterministycznie znormalizowane
  źródło 12S;
- `desktop/webhook-1448x-full.png`, SHA-256
  `12d2ed42475bceb061d190142f9652359e786ab24f8e4efc8ab88f8f836c5ab4`;
- `mobile/webhook-390x-full.png`, SHA-256
  `da3a1962b70e3496ceb5f4e438bd4593c33e3b8a37e9feb23330d80c22974ae6`;
- `overlay-50.png` i `difference-x3.png` — pełny desktop 1448 × 1086;
- `pnpm --filter @wyceno/web e2e:panel`: 19/19, axe desktop/mobile bez
  naruszeń, brak overflow 1448/390/320, klawiatura, forced colors i cleanup 0;
- produkcyjny build: 41 tras, widget 19 016 B gzip.
