# Database

Pakiet `@wyceno/database` udostępnia wygenerowane typy bazy oraz wspólne
kontrakty tenant context, capabilities i autoryzacji zasobów organizacji.
Schemat, migracje i polityki RLS pozostają w `supabase/`.

## Granica bezpieczeństwa

- każda operacja na danych organizacji wymaga jawnego tenant context;
- capability w interfejsie nie zastępuje autoryzacji serwerowej ani RLS;
- nie wolno osłabiać forced RLS ani używać service role w ścieżce użytkownika;
- zmiana schematu wymaga migracji, aktualizacji typów i testów negatywnych.

Kontrakty danych opisują `../../docs/DATABASE.md` i
`../../docs/AUTHORIZATION.md`.

## Weryfikacja

```bash
pnpm --filter @wyceno/database lint
pnpm --filter @wyceno/database typecheck
pnpm --filter @wyceno/database test
pnpm test:rls
```
