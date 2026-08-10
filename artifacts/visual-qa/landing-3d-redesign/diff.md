# Etap 12Q — landing 3D, raport visual QA

## Zakres

- trasa: `/`;
- kierunek: profesjonalny, minimalistyczny landing oparty na przestrzennych
  telefonach i rzeczywistych ekranach produktu;
- dyspozycja nadrzędna: tekstowa decyzja właściciela z 2026-07-29;
- before: lokalny stan strony przy 1425 × 1000 oraz 375 × 844;
- after: 1440 × 1000 oraz 390 × 844;
- dodatkowe viewporty automatyczne: 1024 × 900, 768 × 1000 i 320 × 844.

Nie dostarczono nowego obrazu referencyjnego dla kierunku 3D, dlatego raport
nie przypisuje pozornego RMSE ani pixel-perfect PASS. Overlay pokazuje skalę
świadomej przebudowy względem lokalnego `before`, a nie zgodność z zewnętrznym
projektem.

## Dziesięć największych zmian

1. Hero nie pokazuje pomniejszonego panelu desktopowego; używa trzech
   warstwowych telefonów w sekwencji zapytanie → proces → lead.
2. Nagłówek otrzymał mocniejszą, krótszą tezę i większą typografię z jednym
   zielonym akcentem zamiast markera pod tekstem.
3. Proof 3D jest code-native, responsywny i zawiera prawdziwe linki do demo
   oraz logowania, bez martwych przycisków.
4. Pasek sześciu informacji został uproszczony do spokojnych, okrągłych ikon
   i jednej linii danych.
5. Pięć szablonów branżowych jest prezentowanych jako mobilne ekrany procesu,
   a nie typowa siatka kart SaaS.
6. Porównanie i czterostopniowy proces tworzą jeden ciemnozielony rozdział;
   dokument leada ma subtelną perspektywę telefonu.
7. Interaktywne demo zachowuje pełną funkcję, ale otrzymało spokojniejszą
   oprawę i perspektywę produktu.
8. Proofy reguł, obsługi, publikacji i granicy agencji mają wspólne promienie,
   głębię i rytm zamiast kilku niezależnych stylów dashboardowych.
9. Końcowy program pilotażowy jest ciemnym, wyraźnym finałem z dwoma
   działającymi CTA.
10. Mobile zachowuje hierarchię hero, trzy telefony, siatkę 3 × 2 danych,
    dwukolumnowe urządzenia branżowe i tekst proofu minimum 12 px bez overflow.

## Ocena

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość danych oraz stany: 3/4;
- transformacja mobile: 4/4;
- razem: 19/20.

Punkt gęstości pozostaje odjęty, ponieważ pełna narracja produktowa nadal ma
jedenaście regionów i około 15 tys. px wysokości na mobile. Skrócenie wymagałoby
decyzji contentowej wykraczającej poza wizualny redesign.

## Artefakty

- `desktop/before.png`, `desktop/after-v2.png`, `desktop/overlay-v2.png`,
  `desktop/difference-v2.png`;
- `mobile/before.png`, `mobile/after-v2.png`, `mobile/overlay-v2.png`,
  `mobile/difference-v2.png`.

Po zamknięciu etapu pliki v1 przeniesiono do odzyskiwalnego Kosza zgodnie
z retencją Etapu 12ZD; nie dokumentowały decyzji innej niż finalny v2.

## Kontrole

- typografia proofów: minimum 12 px;
- brak poziomego overflow przy 390 i 320 px;
- hero, szablony i porównanie sprawdzone przy 1440, 1024, 768, 390 i 320 px;
- pełna obsługa klawiatury, menu mobilnego, demo i tablisty zachowana;
- no-JS, reduced motion, forced colors, SEO i budżet JavaScriptu sprawdzone
  przez test marketingowy;
- wdrożenie produkcyjne pozostaje poza zakresem etapu.
