# Dekompozycja referencji V6

**Status:** kanoniczna mapa regionów  
**Ostatni przegląd:** 2026-07-27

## Strona główna `/`

| Region               | Źródło                        | Kod docelowy                                  |
| -------------------- | ----------------------------- | --------------------------------------------- |
| Navigation           | landing board 1               | `marketing-header.tsx`                        |
| Hero copy            | landing board 1 + załącznik E | `page.tsx`, `home-reference.module.css`       |
| Odpowiedzi → lead    | załącznik E + accepted master | `home-proof.tsx`                              |
| Data strip           | landing board 1               | `page.tsx`                                    |
| Problem/result       | landing board 1               | `home-proof.tsx`                              |
| How it works         | landing board 1               | `page.tsx`                                    |
| Interactive demo     | landing board 2               | `home-interactive-demo.tsx`                   |
| Industries/templates | landing board 2               | `home-industry-templates.tsx`                 |
| Feature sequence     | landing board 3               | nowy home-only moduł                          |
| WordPress            | landing board 3               | proof oparty na istniejącej integracji        |
| Agency               | landing board 3               | proof granic organizacji, bez atrap           |
| Evidence             | landing board 3               | metodologia, bezpieczeństwo, wersje           |
| Pilot scope          | landing board 4               | link do `/cennik`, bez niezatwierdzonych kwot |
| FAQ                  | landing board 4               | odpowiedzi o rzeczywistym zakresie            |
| Final CTA/footer     | landing board 4               | istniejące trasy i legalne linki              |

## Panel

| Ekran                        | Dominujące regiony                                                     | Najnowsze źródło  |
| ---------------------------- | ---------------------------------------------------------------------- | ----------------- |
| Dashboard                    | uwaga, KPI, trend, jakość, leady, następny krok                        | board 01          |
| Leady                        | tabs, search, filters, tabela/lista, status, score                     | board 01          |
| Lead detail                  | header, scope, budget/time/location, files, explainability, operations | załącznik C       |
| Procesy                      | kompaktowa lista, wersja, stan publikacji                              | product app board |
| Builder                      | rail, toolbar, question tree, preview, inspector                       | załączniki A/B    |
| Logic/pricing/scoring/result | reguły, symulacja, powody i preview                                    | board 02          |
| Analytics                    | filtry, lejek, drop-off, źródła, urządzenia                            | board 03          |
| Installation                 | tryby osadzenia, kod, WordPress, diagnostyka                           | board 03          |
| Agency                       | organizacje, kopiowanie procesu, scope                                 | board 03          |
| Settings                     | kategorie, formularze, retencja, danger zone                           | board 04          |
| Onboarding                   | progress, wybór startu, jawna publikacja                               | board 04          |
| Integrations                 | connections, webhook deliveries, retry                                 | board 04          |
| Widget/result                | pytanie, postęp, wynik, disclaimer, następny krok                      | board 02/04       |

## Mobile

Mobilne źródła nie są cropami desktopu:

- dashboard priorytetyzuje uwagę i najnowsze leady;
- tabela leadów staje się listą z telefonem i e-mailem;
- lead detail ma jedną kolejność i sticky action;
- builder używa widoków Kroki / Podgląd / Ustawienia;
- onboarding pokazuje jeden wybór na ekran;
- widget zachowuje pojedyncze pytanie i bezpieczne dolne akcje.

## Auth

| Ekran               | Dominujące regiony                                                             | Najnowsze źródło          |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| Logowanie desktop   | branding + ilustracja produktu / formularz / cztery benefity + blok zaufania   | załącznik I               |
| Rejestracja desktop | branding + pionowy stack procesu / formularz / cztery benefity + blok zaufania | załącznik I               |
| Reset i statusy     | uproszczony wspólny shell, formularz albo komunikat i CTA                      | wyłącznie prompt tekstowy |
| Auth mobile         | skrócony hero, formularz, benefity niżej                                       | brak obrazu krytycznego   |

Pełna anatomia, przybliżone pomiary i konflikty zakresu są zapisane w
`AUTH_REFERENCE_ANALYSIS_2026-07-27.md`. Załącznik I jest planszą porównawczą;
nie oznacza, że logowanie i rejestracja mają występować na jednej trasie.
Nowszy załącznik J wymaga, by każdy z tych ekranów osobno zajmował cały pierwszy
viewport. Zewnętrzny pasek marki i podpis planszy nie należą do trasy, a sekcja
pięciu cech znajduje się w następnym regionie dokumentu.

## Elementy nieprzenoszone bezpośrednio

- nazwa „Wyceno” z historycznych plansz;
- graf node-based;
- niezatwierdzone kwoty planów;
- fikcyjne CRM-y, kalendarze i billing;
- stockowe avatary i prawdziwie wyglądające dane osobowe;
- dekoracyjne gradienty obecne w generatorze v1;
- fikcyjny testimonial, niepotwierdzony trial i martwe przyciski OAuth z
  planszy auth.
