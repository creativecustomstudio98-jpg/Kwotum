# Silnik pricingu i scoringu

## Zakres Etapu 6

Etap dostarcza wersjonowany kontrakt estymacji, referencyjny silnik TypeScript,
niezależną implementację PostgreSQL oraz publiczną prezentację wyniku. Nie
wprowadza edytora reguł, kontaktu ani utworzenia leada. Stawki w testach są
fixture'ami technicznymi, nie rekomendacją rynkową.

## Kontrakt `estimationSchemaVersion: 1`

Opcjonalne pole `estimation` rozszerza dokument flow v1 i v2. Jego brak
zachowuje dotychczasowy wynik `consultation` albo `no_price`.

Pricing zawiera:

- walutę z allowlisty: PLN, EUR, USD, GBP, CHF, CZK, SEK, NOK, DKK, JPY, BHD;
- bazowy `baseMinMinor` i `baseMaxMinor` w minor units;
- prezentację `exact`, `range` albo `from`;
- dodatni krok końcowego zaokrąglenia;
- maksymalnie 50 uporządkowanych reguł.

Operacje reguły:

- `add` — dodaje osobną wartość minimalną i maksymalną;
- `multiply` — mnoży oba końce przez całkowite basis points, gdzie 10 000
  oznacza 1,0;
- `add_per_unit` — dodaje stawkę razy odpowiedź z pola `number`. Ilość jest
  nieujemna, nie większa niż 1 000 000 i ma maksymalnie trzy miejsca po
  przecinku.

Scoring zaczyna od `initialPoints`, stosuje w kolejności reguły od -100 do 100
punktów i po każdej regule ogranicza wynik do 0–100. Kategorie mają unikalne,
ściśle rosnące progi; pierwsza zaczyna się od 0. Prywatny wynik zawiera score,
kategorię oraz uporządkowaną listę uruchomionych reguł z etykietą i zmianą.

Warunki pricingu i scoringu używają tego samego zamkniętego AST co nawigacja:
`answered`, `equals`, `not_equals` i `includes`. Nie ma `eval`, skryptów,
wyrażeń tekstowych ani odwołań do danych poza odpowiedziami bieżącej sesji.

## Arytmetyka i deterministyczność

Kwoty konfiguracji i wyniku są bezpiecznymi liczbami całkowitymi. Mnożenie,
stawka jednostkowa i końcowy krok stosują jawne round half-up. Reguły zawsze
wykonują się w kolejności tablicy. Przekroczenie `Number.MAX_SAFE_INTEGER`,
ujemny lub odwrócony przedział i nieprawidłowa precyzja ilości zatrzymują
kalkulację.

`@wyceno/validation` zawiera `calculateEstimation` i `formatMinorAmount`.
PostgreSQL wdraża ten sam model w
`app_private.calculate_estimation(snapshot, answers)`. Testy sprawdzają
kolejność, ślady reguł, clamp scoringu, PLN/EUR/JPY, progi, half-up,
stawki jednostkowe oraz overflow.

## Granica zaufania

`public.calculate_widget_result(session_token)`:

1. wyszukuje wyłącznie hash tokenu;
2. blokuje wygasłą lub nieukończoną sesję;
3. pobiera immutable snapshot przez przypięte `flow_version_id`;
4. buduje odpowiedzi z `session_answers`;
5. wywołuje prywatny kalkulator;
6. usuwa scoring i ślad reguł z publicznego wyniku.

Klient nie przesyła ceny, score ani konfiguracji. Route Handler waliduje surowy
wynik i formatuje minor units przez `Intl.NumberFormat("pl-PL")`. Endpoint
`GET /api/v1/public/sessions/current/result` zwraca `no-store`:

```json
{
  "headline": "Orientacyjny wynik",
  "disclaimer": "Wynik nie stanowi oferty.",
  "nextStepLabel": "Przekaż dane do konsultacji",
  "pricing": {
    "currency": "PLN",
    "presentation": "range",
    "minMinor": 1000000,
    "maxMinor": 1500000,
    "formattedMin": "10 000,00 zł",
    "formattedMax": "15 000,00 zł"
  }
}
```

Przy braku konfiguracji `pricing` ma wartość `null`. Manifest nadal nie zawiera
pricingu ani scoringu. Etap 7 może utrwalić prywatny wynik przy idempotentnym
submit, ale musi policzyć go ponownie i nie może przyjąć go od klienta.

## Walidacja i testy bezpieczeństwa

TypeScript waliduje strukturę, limity, referencje kroków, unikalność reguł oraz
progi kategorii. PostgreSQL niezależnie rozszerza `validate_flow`, blokuje
nieprawidłowy snapshot triggerem publikacji i sprawdza konfigurację ponownie
przed kalkulacją.

Test integracyjny potwierdza wynik i explainability, blokadę błędnej publikacji,
brak wyniku dla niepełnej sesji, brak pricingu/scoringu w manifeście, brak
scoringu i śladu reguł w publicznym wyniku oraz brak anonimowego dostępu do
funkcji prywatnej.
