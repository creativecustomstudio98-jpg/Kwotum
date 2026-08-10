# Raport blokady referencji Lorum V6

**Data:** 2026-07-27

## Integralność wejścia

- historyczny plik wejściowy: `nowydesign.zip`, usunięty po ekstrakcji
  2026-07-28;
- SHA-256:
  `f1e86da64f28788065d687e7c2b65e9199af162ca4ff1bec9e05266b838fc141`;
- test ZIP: bez błędów;
- 120 wpisów, 39 ścieżek PNG i 36 unikalnych obrazów.

## Pełne sumy głównych obrazów

```text
992ebb2bdfbe52306cd20cb3cf991fb01f31f91263a2a436148f197a1e201696  accepted-master-board.png
df3c7894a60bddfb2f3268b2e1525097abc93b25ff4535a6303741bab0a31101  product-app-board.png
e4d89c0910646de72e5bcfad73f80118e31446300810a3d3aefed49ed4bce657  landing-desktop-full.png
eb43b17ecfe45bdb086540d4ce9f58199975bf7d755ef06c8f30826c153c7063  landing-mobile-full.png
```

## Zakres przeglądu

- główny prompt V6 i zweryfikowane kopie źródłowe;
- siedem kontraktów `docs/ui`;
- 12 dokumentów kanonicznych produktu i 18 promptów etapowych;
- prototypy landingowe HTML/CSS i generator referencji produktu;
- cztery pełne plansze główne;
- pięć plansz produktu, 20 screenów produktu, osiem wycinków landingu i dwa
  pełne landingi;
- sześć załączonych kompozycji rozmowy, z czego builder został przesłany
  dwukrotnie.

## Wynik blokady

Referencja jest przyjęta jako kontrakt prezentacji z trzema ograniczeniami:

1. nowszy załącznik wygrywa tylko w swoim regionie;
2. obraz nie rozszerza zakresu funkcjonalnego;
3. brak lokalnego oryginału buildera lub leada blokuje pixel-perfect PASS dla
   tych ekranów.

## Zmiany w repozytorium

Pakiet źródłowy został skopiowany do `docs/ui/`. Nie zmieniono aplikacji.
Przyszłe etapy mają korzystać z lokalnych, wersjonowanych referencji zamiast z
tymczasowo rozpakowanego ZIP-a.

Master prompt otrzymał także oczekiwane ścieżki `references/` i `snippets/`.
Identyczna kopia promptu w `docs/ui/` oraz skrócone kopie czterech plansz w
`docs/ui/references/` zostały usunięte 2026-07-28. Pełne pakiety źródłowe
pozostają zachowane.
