# Kwotum Connector

Cienka wtyczka WordPress osadza publiczny widget Kwotum. Nie przechowuje
leadów, odpowiedzi, plików, reguł ani snapshotów flow.

## Wymagania i instalacja

- WordPress 6.8–7.0;
- PHP 8.3–8.5 zgodnie z macierzą poniżej;
- rozszerzenie sodium i unikalne WordPress salts;
- HTTPS;
- przypięty origin API ustawiony przed aktywacją/pakowaniem:

```php
define('WYCENO_CONNECTOR_API_ORIGIN', 'https://zatwierdzony-origin-saas.example');
```

W panelu SaaS Owner/Admin wskazuje dokładny origin strony i generuje
jednorazowy token ważny 10 minut. Administrator WordPress wkleja token w
`Ustawienia → Kwotum`. Credential jest wymieniany serwer-serwer, szyfrowany
authenticated encryption i nigdy nie jest dodawany do HTML ani JavaScriptu.

Shortcode:

```text
[wyceno id="publiczny-uuid-flow" mode="inline" height="720"]
```

Tryby: `inline`, `popup`, `fullscreen`. Ten sam kontrakt udostępnia blok
Gutenberg „Kwotum”.

## Macierz kompatybilności

| WordPress | PHP 8.3 | PHP 8.4 | PHP 8.5 |
| --------- | ------- | ------- | ------- |
| 6.8       | tak     | tak     | nie     |
| 6.9       | tak     | tak     | tak     |
| 7.0       | tak     | tak     | tak     |

Macierz wynika z oficjalnej tabeli WordPress. Test harness uruchamia kontrakt
wtyczki dla każdej wspieranej pary; CI wykonuje go na PHP 8.3, 8.4 i 8.5.

## Bezpieczeństwo i aktualizacja

- mutacje admina wymagają `manage_options` oraz nonce;
- zdalne żądania mają TLS verification, zero redirectów i stały origin;
- pełne odłączenie unieważnia credential w SaaS i usuwa lokalny sekret/cache;
- zmiana salts wymaga ponownego połączenia;
- przed wydaniem uruchom `bash apps/wordpress-plugin/tests/run.sh`, pełny gate
  repozytorium i test na stagingu dla każdej pary macierzy;
- aktualizuj małymi wersjami, zachowaj rollback do poprzedniego ZIP i nie zmieniaj
  formatu opcji bez migracji oraz testu powrotu.
