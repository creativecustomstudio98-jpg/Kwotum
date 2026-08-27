# M9.2 — porównanie Ustawień

## Najważniejsze różnice usunięte

1. Trzy trasy Ustawień tworzą wspólny segmentowy track z ikonami i wyraźnym
   aktywnym stanem zamiast luźnych linków z dolną linią.
2. Tytuły i opisy sekcji znajdują się poza powierzchnią formularza; rama
   obejmuje tylko powiązane pola i właściwą akcję.
3. Dane organizacji zachowują dwie kolumny, a techniczny identyfikator, konto i
   rola pozostają spokojnymi polami tylko do odczytu.
4. Podgląd brandingu jest częścią tej samej relacji z nazwą, akcentem i
   bezpiecznym wyborem logo.
5. Dostawa leadów pokazuje jedyny rzeczywiście obsługiwany kanał email i jego
   stan zamiast atrap przełączników Slack/Webhook.
6. Granica danych nie udaje KPI: prezentuje wyłącznie prawdziwą datę utworzenia
   i Tenant ID.
7. Pola mają dokładnie 44 px wysokości, ramę 1 px i promień 8 px; powierzchnie
   mają ramę 1 px i promień 12 px.
8. Mobile składa formularze do jednej kolumny, a trzy segmenty przewijają się
   wewnątrz własnego regionu bez overflow dokumentu.

## Pomiary odbiorowe

- referencja: 997 × 1577 px, SHA-256
  `fa1a565edae9cbe4971a4d7791f7a0d5cbece171488f2f5ab2c67575850962eb`;
- track tras przy 997 px: 432,8 × 46 px;
- pole: 44 px, border 1 px, radius 8 px;
- cztery powierzchnie: border 1 px, radius 12 px;
- horizontal overflow: 0 px dla 320, 375, 390, 430, 720, 768, 1024, 1280,
  1440 i 1536 px;
- forced-colors focus outline: 3 px;
- axe: 0 naruszeń.

`before-1440x900.png` pokazuje stan przed M9.2, `desktop-1440x900.png` stan
finalny, a `overlay-50.png` i `difference.png` dokumentują zmianę kompozycji.
Render 997 × 1577 oraz reprezentatywne viewporty 390 × 844 i 320 × 800 są
zachowane obok pomiarów.
