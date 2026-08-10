# M1 mobile header + hero — visual diff

## Przed

- H1 i CTA przekraczały prawą krawędź o około 23 px przy 390 px i 43 px przy
  320 px;
- `overflow: hidden` maskował błąd, więc samo `scrollWidth` nie było dowodem;
- trzy fakty tworzyły długą pionową listę;
- scena produktu zaczynała się dopiero około y=794;
- hero miał około 1505 px wysokości przy 390 px.

## Po

- wszystkie kontrolowane regiony kończą się 16 px przed krawędzią, a przy
  320 px 12 px przed krawędzią;
- H1 zachowuje pełne słowa i trzywierszową hierarchię;
- CTA mają 358/296 px szerokości i 56 px wysokości;
- fakty tworzą zwartą siatkę 3-kolumnową;
- scena zaczyna się przy y≈670 i pokazuje relację formularz → lead w pierwszym
  przewinięciu;
- menu ma stabilny hamburger/X, 44 px przycisk, 60 px wiersze i 52 px akcje;
- hero jest krótszy o około 220 px przy 390 px bez utraty treści.

## Wynik

PASS na 320/375/390/430 px oraz bez regresji 768/1024/1440 px. RMSE nie jest
stosowany do różnych treści V6/V7. Visual QA: 19/20.
