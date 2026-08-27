# M9.1 — porównanie Integracji

## Najważniejsze różnice usunięte

1. Zakładki z krótką linią zastąpiono wspólnym segmentowym trackiem 270 × 46 px.
2. Aktywny segment ma białą powierzchnię 132 × 40 px, cienką ramę i subtelny cień.
3. Stan integracji i formularz są jedną powierzchnią z ramą 1 px i promieniem 12 px.
4. Formularz nie konkuruje już z osobnym zestawem poziomych linii.
5. Pola URL mają 44 px wysokości, ramę 1 px i promień 9 px.
6. Połączone strony i endpointy znajdują się w lokalnych, obramowanych sekcjach.
7. Puste stany mają własną cienką ramę, ikonę, tytuł i instrukcję następnego kroku.
8. Historia dostaw pozostała osobną sekcją techniczną bez payloadu i danych osobowych.
9. Z WordPressa usunięto konkurującą akcję „Przejdź do instalacji procesu”; na ekranie
   pozostaje jedna główna akcja konfiguracji.
10. Mobile zachowuje kolejność stan → bezpieczeństwo → metryki → formularz → lista,
    bez poziomego overflow przy 390 i 320 px.

## Pomiary odbiorowe

- viewport referencyjny: 1651 × 953 px;
- desktop QA: 1440 × 900 px;
- tablet QA: 768 × 1024 px;
- mobile QA: 390 × 844 i 320 × 800 px;
- track: 270 × 46 px na desktopie;
- segment: 132 × 40 px;
- pole URL: 44 px;
- powierzchnie główne i podsekcje: border 1 px, radius 12 px;
- horizontal overflow: 0 px we wszystkich ośmiu kombinacjach trasy i viewportu;
- forced-colors focus outline: 3 px.

`before.png` pokazuje stan przed M9.1. `desktop-1440x900.png` jest finalnym
stanem. `overlay.png` i `difference.png` dokumentują zmianę kompozycji.
