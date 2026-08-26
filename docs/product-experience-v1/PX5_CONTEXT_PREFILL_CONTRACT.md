# PX5 — kontrakt kontekstu i prefillu

## Cel

Kontekst przenosi krótki wybór dokonany na stronie firmy — na przykład model
lub wariant — do sesji Kwotum. Nie jest workiem `metadata`, odpowiedzią klienta
ani kanałem sterowania ceną, scoringiem, routingiem, tenantem lub zgodami.

## Model zaufania

- `Origin` identyfikuje dozwoloną witrynę, ale nie nadaje jej skryptom zaufania
  biznesowego. Każdą wartość hosta traktujemy jako niezaufaną.
- Publikowana wersja procesu jest jedynym źródłem dozwolonych kluczy, typów,
  trybów, list wartości i stałych systemowych.
- Serwer buduje kanoniczny snapshot. Klient nie może przesłać pola systemowego,
  nieznanego klucza ani klucza zastrzeżonego.
- Kontekst nigdy nie uczestniczy w kalkulacji ceny, score, routingu ani dowodzie
  zgody. Wartości nie trafiają do zdarzeń analitycznych ani URL.
- Dostęp do sesji nadal wymaga niejawnego tokenu, a odczyt leada podlega tenant
  scope i RLS.

## Wersjonowany model

`FlowDocument` w wersji 3 może zawierać `contextSchema` w wersji 1 z maksymalnie
ośmioma polami. Pole ma jawny `key`, `label`, `type`, `mode` i `required`.

Typy:

- `text` — krótki tekst do 120 znaków;
- `enum` — jedna z maksymalnie 30 opublikowanych wartości.

Tryby:

- `informational` — wartość hosta widoczna, ale nieedytowalna;
- `confirm` — wartość widoczna i potwierdzana lub poprawiana przed pierwszą
  odpowiedzią;
- `system` — stała z opublikowanej wersji, niewidoczna dla hosta i widżetu,
  zachowana w snapshotcie leada.

Zastrzeżone prefiksy: `consent`, `organization`, `price`, `routing`, `score`,
`tenant`. Wartości wyglądające jak e-mail, URL, sam numer telefonu, zawierające
znaki sterujące albo przekraczające limit są odrzucane fail-closed.

## Przepływ

1. Integracja ustawia mały obiekt `contextValues` na elemencie widżetu albo
   przekazuje go przez atrybut WordPress `context`.
2. `POST /public/flows/{publicId}/sessions` waliduje body i dokładny origin.
3. RPC porównuje payload z niezmiennym snapshotem opublikowanego procesu,
   dodaje wartości systemowe i zapisuje kanoniczny `context_snapshot`.
4. Jeżeli istnieje pole `confirm`, sesja blokuje zapis odpowiedzi do wywołania
   `PUT /public/sessions/current/context`.
5. Potwierdzenie jest jednorazowe i idempotentne dla tego samego `mutationId`.
6. Przy utworzeniu leada trigger kopiuje snapshot sesji. Panel wyświetla go w
   osobnej sekcji „Kontekst wejścia”, bez mieszania z odpowiedziami klienta.

## Integracja

```html
<wyceno-widget public-id="…"></wyceno-widget>
<script>
  document.querySelector("wyceno-widget").contextValues = {
    model: "M2",
    product_id: "fortez-42",
  };
</script>
```

WordPress zachowuje dotychczasowe shortcode’y. Opcjonalny kontekst:

```text
[wyceno id="…" context='{"model":"M2","product_id":"fortez-42"}']
```

Hosted link nie przyjmuje kontekstu w query stringu. Proces wymagający wartości
hosta powinien być osadzony; zwykły proces bez `contextSchema` działa bez zmian.

## Threat model i testy negatywne

Kontrole obejmują: obcy origin w publicznym guardzie, obcy tenant przez RLS,
nieznany i zastrzeżony klucz, zły typ, więcej niż osiem pól, payload ponad limit,
PII/URL, próbę przesłania pola systemowego, odpowiedź przed potwierdzeniem,
zmianę po potwierdzeniu, replay z innym `mutationId` oraz wygasłą sesję.

## Rollback

Integracje mogą natychmiast przestać wysyłać kontekst. Procesy bez
`contextSchema` i istniejący jednargumentowy RPC tworzenia sesji pozostają
zgodne. Kolumn nie usuwamy po pojawieniu się ruchu; ewentualna korekta zachowuje
snapshoty jako dane audytowe i wyłącza wyłącznie nowe przyjmowanie wartości.
