# FTZ-03A — różnice i odbiór wizualny

## Zakres

- ekran: `/panel/[organizationId]/procesy/[flowId]/instalacja`;
- viewport desktop: 1536 × 1024;
- viewport mobile: 390 × 844, zrzut pełnej strony;
- referencja języka panelu: zaakceptowany szczegół leada
  `artifacts/visual-qa/12o-lead-detail-responsive/after-production-1536x1024.png`;
- stan odrzucony jako zbyt generyczny: `before-template-redesign.png`;
- porównanie: `reference.png`, `after.png`, `overlay.png`, `difference.png`,
  `redesign-before-after.png` i `redesign-difference.png`.

## Dziesięć kontrolowanych różnic

1. Pięć osobnych kart zastąpiono jedną powierzchnią roboczą z pionowym
   podziałem znanym ze szczegółu leada.
2. Status publikacji, sposób osadzenia, dozwolone domeny i kod są sekcjami
   oddzielonymi liniami zamiast „kartami w karcie”.
3. Cztery kafle sposobu osadzenia zastąpiono płaskim wyborem z aktywnym dolnym
   akcentem.
4. Kapsułkę „Ochrona aktywna” zastąpiono małą kropką i tekstem statusowym.
5. Pole wielowierszowe zachowuje exact originy i mieści się w rytmie formularzy
   panelu leadów.
6. Blok kodu zmienił ciężkie zielone tło na neutralną powierzchnię techniczną z
   cienką ramką.
7. WordPress i diagnostyka są jedną prawą kolumną operacyjną z separatorem,
   bez dwóch pływających kart.
8. Ikona WordPress ma neutralny obrys, a status połączenia jest tekstem zamiast
   kapsułki.
9. Usunięto dekoracyjną siatkę i cień z obszaru podglądu; sam widget zachowuje
   wyraźną granicę.
10. Mobile składa całą powierzchnię w jedną kolumnę bez poziomego overflow i
    zachowuje kolejność zadaniową.

## Wynik

**PASS, 19/20** — kompletność 4, geometria 4, typografia 4, gęstość i stany 4,
transformacja mobile 3. Osobna referencja projektowa mobile nie istnieje,
dlatego nie przyznano pełnego punktu za pixel fidelity telefonu. Playwright
potwierdza axe bez naruszeń, brak poziomego overflow, zapis po przeładowaniu,
blokadę obcego originu, poprawny preflight oraz `429` z `Retry-After`.
