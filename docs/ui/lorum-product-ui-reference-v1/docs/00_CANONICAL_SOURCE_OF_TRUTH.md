# 00 — Kanoniczne źródło prawdy

**Status:** CANONICAL  
**Zakres:** cały interfejs produktu Lorum  
**Wersja:** 1.0  
**Nadpisuje:** wcześniejsze, niespójne specyfikacje wizualne i luźne prompty UI

## 1. Hierarchia decyzji

W przypadku konfliktu stosuj kolejność:

1. bezpieczeństwo danych, autoryzacja i separacja tenantów,
2. działające kontrakty domenowe i API,
3. dokumenty kanoniczne w tym pakiecie,
4. screenshoty referencyjne,
5. istniejące testy zachowania,
6. stara dokumentacja po weryfikacji,
7. aktualny wygląd aplikacji wyłącznie jako materiał do audytu.

Aktualny interfejs nie jest wzorcem wizualnym. Zachowujemy z niego tylko to, co funkcjonalnie poprawne: logikę, dane, routing, kontrakty, autoryzację, walidację i semantykę domeny.

## 2. Cel przebudowy

Stworzyć spójny, produkcyjny interfejs B2B SaaS, który:

- porządkuje realne dane zamiast dekorować puste ekrany,
- pozwala szybko zrozumieć stan procesu i kolejny krok,
- jest zwarty na desktopie i celowo zaprojektowany na mobile,
- wygląda jak rezultat pracy doświadczonego zespołu produktowego,
- nie wygląda jak domyślny template, shadcn demo ani wygenerowany landing AI,
- zachowuje istniejącą logikę biznesową i nie psuje głównej pętli produktu.

## 3. Główna pętla produktu

```text
konfiguracja procesu
→ publikacja
→ przejście publicznego widgetu
→ obliczenie wyniku
→ zapis leada
→ powiadomienie
→ obsługa leada w panelu
→ analiza jakości i konwersji
```

Wszystkie ekrany mają wspierać tę pętlę. Elementy, które nie pomagają jej wykonać albo zrozumieć, nie powinny dominować w interfejsie.

## 4. Marka i nazewnictwo

- Nazwa widoczna w UI, marketingu i nowych dokumentach: **Lorum**.
- „Wyceno” jest nazwą historyczną i nie może pozostać w aktywnym copy produktu.
- Nie wykonuj automatycznej globalnej zmiany technicznych identyfikatorów.
- Zmiany nazw tabel, zmiennych, callbacków, adresów, kluczy, bucketów, pakietów i publicznych identyfikatorów wymagają osobnego planu migracji i ADR.

## 5. Referencje wizualne

Źródło kierunku:

```text
reference/accepted-style-board.png
```

Rozwinięcie aplikacji:

```text
reference/boards/
reference/screenshots/
```

Screenshoty są wzorcem:

- układu,
- proporcji,
- hierarchii,
- gęstości,
- sposobu grupowania,
- zachowania na mobile,
- stylu komponentów.

Nie są nakazem kopiowania demonstracyjnych danych 1:1 do produkcji.

## 6. Zasady niepodlegające negocjacji

- Brak gradientów dekoracyjnych.
- Brak glassmorphismu, neonów, glow i rozmytych kul.
- Brak przypadkowych kart 3×3.
- Brak gigantycznych promieni.
- Brak pływających widgetów bez funkcji.
- Brak ikon w kolorowych kwadratach przy każdej pozycji.
- Brak fake dashboardów i wymyślonych danych nieoznaczonych jako demo.
- Brak sztucznego social proof.
- Brak ukrywania danych źródłowych pod wygenerowanym podsumowaniem.
- Brak desktopowej tabeli ściśniętej do szerokości telefonu.
- Brak lokalnych tokenów koloru, radiusu i cienia w przypadkowych komponentach.

## 7. Warunek ukończenia

Ekran jest ukończony dopiero, gdy:

- działa z realnym przepływem danych,
- posiada loading, empty, error i permission state,
- działa klawiaturą,
- przechodzi lint, typecheck, test i build,
- został wyrenderowany w viewportach kontrolnych,
- został porównany z referencją,
- nie zawiera krytycznych rozbieżności geometrii,
- dokumentacja i backlog zostały zaktualizowane.
