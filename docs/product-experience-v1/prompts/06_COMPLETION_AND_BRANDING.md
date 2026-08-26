# PROMPT 06 — PX6 kontakt, outcome i branding

Rozszerz zakończenie bez ujawniania prywatnego scoringu i bez dark patterns.

## Kontakt

- zamknięta lista pól i jawne required/optional;
- co najmniej jeden kanał dla lead capture;
- preferowany kontakt i pora tylko jako typowane pola;
- wersjonowana kolejność częściowy wynik/kontakt/pełny wynik;
- tekst zgód pozostaje wersjonowany i niezależny od marketingu;
- upload zachowuje obecne limity, skaner i prywatny Storage.

## Outcome

- outcome wynika wyłącznie z deklaratywnych, zatwierdzonych reguł;
- serwer potwierdza wynik na immutable snapshotcie;
- publiczny payload nie zawiera score ani śladu prywatnych reguł;
- każde CTA ma prawdziwy następny krok i nie obiecuje SLA bez konfiguracji;
- wariant poza zakresem nie usuwa awaryjnego kontaktu, jeśli firma go wymaga.

## Branding

- logo z kontrolowanego tenantowego assetu;
- nazwa firmy oddzielona od nazwy procesu;
- kolor akcentu z automatycznym kontrastem i bezpiecznym fallbackiem;
- brak custom CSS, font URL, HTML i skryptów.

## Gate

Historyczny snapshot zachowuje wynik → kontakt. E-mail HTML/text, webhook,
eksport, panel i retencja obsługują nową wersję. Visual QA obejmuje branding
poprawny, błędny i brak brandingu. Raport i STOP.
