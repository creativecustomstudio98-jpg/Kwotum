# Macierz doboru prezentacji pytania

Ta macierz nie wybiera „ładniejszego” wariantu. Pomaga dobrać najmniej złożoną
kompozycję, która poprawnie komunikuje decyzję.

| Sygnał                                | Wariant domyślny | Przykład Kwotum              | Warunek użycia                                         | Nie używać, gdy                            |
| ------------------------------------- | ---------------- | ---------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| 2–6 krótkich, rozłącznych kategorii   | `icon_cards`     | mieszkanie/dom/lokal         | ikona jest jednoznaczna i ma etykietę                  | pojęcia są abstrakcyjne lub podobne        |
| opcje wymagają jednego zdania różnicy | `text_cards`     | pakiet podstawowy/pełny      | opis zmienia decyzję                                   | odpowiedź jest oczywista bez opisu         |
| wygląd jest treścią decyzji           | `image_cards`    | styl kuchni, typ frontu      | istnieją prawdziwe, reprezentatywne media              | obraz jest tylko dekoracją                 |
| kolor lub materiał                    | `swatches`       | kolor profilu, próbka drewna | nazwa tekstowa i stan selected są niezależne od koloru | próbka nie odzwierciedla realnego produktu |
| przedziały finansowe/czasowe          | `list`           | budżet, termin               | ważna jest precyzja tekstu                             | ikonka mogłaby sugerować wartość           |
| 2–3 proste stany                      | `segmented`      | tak/nie/nie wiem             | etykiety są krótkie                                    | wymagane jest objaśnienie konsekwencji     |
| ponad 7 pozycji drugorzędnych         | `select`         | województwo, model z listy   | użytkownik zna nazwę lub może wyszukać                 | porównanie opcji jest ważne                |
| wartość liczbowa z jednostką          | pole liczbowe    | metry bieżące, metraż        | zakres i jednostka są jawne                            | użytkownik zwykle nie zna liczby           |
| jedna grupa 3–8 prostych pól          | `quick_form`     | zapytanie o znany model      | brak złożonego branchingu                              | klient potrzebuje prowadzenia              |

## Reguły bez wyjątków

1. Tekstowa etykieta jest obowiązkowa.
2. Kolor ani obraz nie mogą być jedynym nośnikiem znaczenia.
3. Brak media nie może zmienić logiki, ceny ani kolejności.
4. Wariant nie może pogarszać obsługi klawiaturą ani czytnikiem.
5. Na mobile kompozycja może zmienić liczbę kolumn, ale nie kolejność semantyczną.
6. Jeżeli dwa warianty są równie zrozumiałe, wybieramy prostszy i lżejszy.
