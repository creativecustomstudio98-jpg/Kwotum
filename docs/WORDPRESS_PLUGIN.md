# Wtyczka WordPress

## Rola

Wtyczka jest konektorem do SaaS, nie kopią backendu. Nie przechowuje leadów, reguł ani sekretnego API key w froncie.

## MVP

- połączenie przez jednorazowy token instalacyjny wymieniany server-to-server;
- zaszyfrowany/chroniony credential po stronie WordPress i możliwość rotacji;
- lista opublikowanych flow i status połączenia;
- shortcode `[wyceno id="flow_public_id" mode="inline"]`;
- blok Gutenberg: flow, tryb, wysokość, podgląd i stan błędu;
- popup otwierany przez blok lub bezpieczny atrybut;
- diagnostyka wersji PHP/WP, REST, CSP i komunikacji;
- pełne odłączenie oraz usunięcie credentialu.

## Bezpieczeństwo i jakość

Capabilities i nonce dla admin mutations, sanitization/escaping, brak sekretów w HTML, pinned origin SaaS, minimalny skrypt na froncie, testy kompatybilności i procedura bezpiecznej aktualizacji. WordPress nie może modyfikować historycznej wersji flow.

## Zrealizowany kontrakt Etapu 11

Owner/Admin wpisuje dokładny origin HTTPS w
`/panel/[organizationId]/integracje/wordpress`. SaaS zwraca token 256-bitowy
ważny maksymalnie 10 minut. W bazie pozostaje tylko SHA-256 tokenu. Wtyczka
wymienia go server-to-server na credential 256-bitowy; SaaS przechowuje tylko
hash credentialu, a WordPress szyfruje go `sodium_crypto_secretbox` kluczem
wyprowadzonym z `AUTH_KEY` i `SECURE_AUTH_KEY`. Ponowne połączenie tego samego
originu unieważnia poprzedni credential.

Endpointy konektora:

- `POST /api/v1/integrations/wordpress/connect` — jednorazowa wymiana tokenu;
- `GET /api/v1/integrations/wordpress/flows` — allowlista `name/publicId/version`;
- `GET /api/v1/integrations/wordpress/diagnostics` — stan połączenia;
- `DELETE /api/v1/integrations/wordpress/connection` — revocation.

Credential jest wyłącznie w nagłówku Bearer. Endpointy nie mają CORS, nie
przyjmują credentialu w URL i odpowiadają `private, no-store`. Frontend
shortcodu/bloku dostaje tylko publiczny UUID i loader
`/widget/v1/loader.js`.

Owner/Admin może też unieważnić aktywne połączenie z panelu SaaS, gdy utraci
dostęp do WordPressa. Jest to audytowana revocation; lokalna wtyczka przy
kolejnym odświeżeniu zobaczy nieważne połączenie i wymaga ponownego bootstrapu.

Wtyczka w `apps/wordpress-plugin` udostępnia ustawienia, listę flow, shortcode,
dynamiczny blok Gutenberg, tryby inline/popup/fullscreen oraz diagnostykę PHP,
WordPress, REST, sodium, originu API, CSP i połączenia. Operacje administracyjne
wymagają `manage_options` i osobnego nonce. REST WordPressa z listą publicznych
flow wymaga `edit_posts`.

## Kompatybilność i testy

Minimum wtyczki to WordPress 6.8 i PHP 8.3. Wspierane pary:

| WordPress | PHP 8.3 | PHP 8.4 | PHP 8.5 |
| --------- | ------- | ------- | ------- |
| 6.8       | tak     | tak     | nie     |
| 6.9       | tak     | tak     | tak     |
| 7.0       | tak     | tak     | tak     |

`bash apps/wordpress-plugin/tests/run.sh` wykonuje lint PHP, kontrakt wtyczki i
skany secret/global conflict dla bieżącego PHP. GitHub Actions uruchamia każdą
wspieraną parę również na rzeczywistym WordPress/MySQL, aktywuje wtyczkę i
sprawdza shortcode oraz blok. Lokalnie dostępne PHP 8.5.2 pokrywa WordPress
6.9.2 i 7.0.2; pełna zdalna macierz czeka na odblokowanie billingowe Actions.

Produkcja musi przypiąć zatwierdzony `WYCENO_CONNECTOR_API_ORIGIN`. Aktualizacja
wymaga pełnej macierzy na stagingu, poprzedniego ZIP jako rollbacku i migracji
dla każdej zmiany formatu opcji. Rotacja salts celowo wymaga ponownego
połączenia.

## Poza MVP

Synchronizacja leadów do WP, WooCommerce, multisite white-label i własna kopia widgetu.
