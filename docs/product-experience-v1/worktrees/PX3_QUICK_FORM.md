# PX3 — quick form

**Główne pliki:** builder, preview, widget renderer/controller, E2E i CSS widgetu.  
**Zakazane:** visual cards, media, prefill, nowe outcome.

**Status:** implementacja techniczna ukończona lokalnie 2026-08-25; odbiór
wizualny właściciela otwarty; bez deployu.

## Wynik

Owner/Admin może wybrać `quick_form` dla zgodnego procesu. Builder wyjaśnia
ograniczenia grafu, preview używa prawdziwego runtime, a publiczny submit tworzy
ten sam bezpieczny lead co `guided_brief`.

Warstwa wizualna nie korzysta ze starych zdjęć ani wcześniejszych zrzutów jako
referencji. Generyczne rendery zostały odrzucone i nadpisane płaską,
jednokolumnową powierzchnią produktową bez kart, badge'y, cieni i hero-layoutu.

## Ryzyka

Przeciążenie mobile, nieczytelna walidacja wielu pól, podwójny submit i
ominięcie istniejącej kolejki odpowiedzi.
