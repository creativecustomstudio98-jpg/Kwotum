# Widget

Pakiet `@wyceno/widget` implementuje przeglądarkowy klient publicznego procesu:
kontrakty API, kontroler sesji, manifest, storage i loader osadzenia. Kod
wynikowy jest kopiowany do `apps/web/public/widget/` podczas builda i nie jest
wersjonowany.

## Granica zaufania

- widget nie oblicza autorytatywnej ceny ani score;
- token sesji nie trafia do URL, logów ani trwałego storage;
- manifest publiczny zawiera tylko dane potrzebne respondentowi;
- wznowienie sesji, zapis odpowiedzi, upload i submit są ponownie walidowane
  przez API;
- inline, popup, fullscreen i hosted link korzystają z tego samego kontraktu.

Architekturę i implementację opisują `../../docs/WIDGET_ARCHITECTURE.md` oraz
`../../docs/WIDGET_IMPLEMENTATION.md`.

## Weryfikacja

```bash
pnpm --filter @wyceno/widget lint
pnpm --filter @wyceno/widget typecheck
pnpm --filter @wyceno/widget test
pnpm e2e
```
