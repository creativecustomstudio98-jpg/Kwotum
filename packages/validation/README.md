# Validation

Pakiet `@wyceno/validation` zawiera współdzielone, wersjonowane kontrakty Zod
dla procesu, estymacji, scoringu, szablonów, widgetu i zapisu leada. Jest
jedynym współdzielonym parserem `FlowDocument`; aplikacja nie utrzymuje
równoległego modelu formularza.

## Zasady

- dane z klienta są nieufne i zawsze przechodzą walidację serwerową;
- cena i score są obliczane lub potwierdzane po stronie serwera;
- opublikowane snapshoty procesu są niezmienne;
- publiczny kontrakt nie ujawnia prywatnych reguł scoringu;
- zmiana schematu wymaga testu kompatybilności lub jawnej migracji wersji.

Kontrakty domenowe opisują `../../docs/FLOW_DOMAIN.md` i
`../../docs/ESTIMATION_ENGINE.md`.

## Weryfikacja

```bash
pnpm --filter @wyceno/validation lint
pnpm --filter @wyceno/validation typecheck
pnpm --filter @wyceno/validation test
```
