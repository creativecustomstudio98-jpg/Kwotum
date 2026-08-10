# Landing mobile V1 — M3 before/after

## Zakres porównania

Porównanie obejmuje wyłącznie sekcję czterech kluczowych grup danych.
Side-by-side jest właściwym artefaktem, ponieważ M3 świadomie zmienia reflow z
jednej kolumny na siatkę 2 × 2; RMSE nie opisuje jakości tej transformacji.

## Wynik

- wysokość sekcji spadła o około połowę do 965–1046 px;
- cztery karty mają dwie kolumny, równe wymiary i kolejność zgodną z DOM;
- bezpieczne marginesy wynoszą 12 px przy 320 px i 16 px powyżej;
- tytuły mają 16 px, wartości pozostają kompletne i mogą łamać się na 2 linie;
- galeria zachowuje cztery elementy w siatce 2 × 2;
- score 87 i status pozostają czytelne bez clippingu;
- 320/375/390/430 px nie mają poziomego overflow.
- odpowiednik zoomu 200% przechodzi do jednej kolumny bez utraty treści.

Manual visual review: **PASS, 19/20**.
