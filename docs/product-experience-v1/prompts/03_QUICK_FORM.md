# PROMPT 03 — PX3 quick form

Zaimplementuj jeden ekran formularza na istniejącym silniku. Nie dodawaj kart
wizualnych, mediów, prefillu ani nowych outcome.

## Zachowanie

- Owner/Admin wybiera `quick_form` w builderze.
- Builder przed zapisem wyjaśnia zgodność grafu i blokuje nieobsługiwane
  rozgałęzienia zamiast je spłaszczać.
- Preview używa prawdziwego widget runtime.
- Wszystkie pola mają stałą kolejność, etykiety, opisy, wymagania i „nie wiem”.
- Błąd submitu prowadzi do pierwszego błędnego pola, zachowuje odpowiedzi i
  komunikuje problem bez czyszczenia formularza.
- Contact/privacy, Turnstile, idempotencja i serwerowa kalkulacja pozostają
  identyczne z guided flow.

## Kompozycja

Nie twórz landing page w środku widgetu. Użyj zwartej, spokojnej powierzchni,
czytelnych grup i jednej głównej akcji. Desktop nie może rozciągać pól na
nieczytelną szerokość; mobile nie może zmieniać kolejności semantycznej.

## Gate

E2E 1440/768/390/320, keyboard, axe, zoom, offline/retry, duplicate submit,
expired session, Turnstile failure, visual QA i pełny gate repo. Raport i STOP.
