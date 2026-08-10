# Landing mobile V1 — M2 before/after

## Zakres porównania

Porównanie obejmuje wyłącznie sekcję procesu. Obrazy są zestawione
side-by-side, ponieważ celem M2 jest świadoma zmiana wysokości i gęstości, więc
pixel overlay/RMSE nie opisuje jakości transformacji.

## Wynik

- sekcja spadła z około 1618 px do 1146–1179 px;
- karty spadły z około 377 px do 244–261 px;
- numer i ikona tworzą wspólny wiersz, a copy pozostaje pełne;
- łączniki mają 48 × 48 px i wspólną centralną oś;
- bezpieczne marginesy wynoszą 16 px przy 390/430 px i 12 px przy 320 px;
- nie występuje poziomy overflow ani clipping.

Manual visual review: **PASS, 19/20**.
