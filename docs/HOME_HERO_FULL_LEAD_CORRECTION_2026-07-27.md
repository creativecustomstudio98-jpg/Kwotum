# Pełny dokument leada w hero — korekta Etapu 12H

## Decyzja

Najnowszy ekran dołączony w rozmowie jednoznacznie zastępuje kompaktową
interpretację z Etapu 12G. Hero `/` ma pokazywać pełny dokument leada z ciemnym
railem aplikacji, a nie uproszczoną białą kartę.

Marka pozostaje Lorum. W railu oraz centralnym węźle używany jest rzeczywisty
`/Logoicon.svg`, a nie code-native znak zastępczy.

## Zakres korekty

- pełny dokument leada z railem, metadanymi, wynikiem 85/100 i trzema powodami
  dopasowania;
- pięć pól briefu, zdjęcia, następny krok i trzy działania;
- trzy odpowiedzi połączone rozgałęzioną linią z centralnym węzłem;
- sześć elementów pod hero: zakres, budżet, termin, lokalizacja, pliki i
  następny krok;
- zielony kolor oraz jasne zielone tło ikon;
- powrót CTA „Zobacz przykładowy proces”, danych demonstracyjnych i linii
  „Pierwsze procesy”;
- mobilny wariant zachowujący odpowiedzi i skrócony dokument obok siebie.

## Portret demonstracyjny

Portret Anny Kowalskiej jest całkowicie fikcyjnym obrazem wygenerowanym
wbudowanym narzędziem ImageGen. Plik projektu:

`apps/web/public/images/redesign/anna-kowalska-avatar-v1.webp`

Parametry: 256 × 256 px, WebP, około 6,3 KiB.

Końcowy prompt:

> Use case: photorealistic-natural
>
> Asset type: square profile photo for a small avatar in a Polish B2B SaaS demo
> interface
>
> Primary request: create a realistic fictional professional headshot of Anna
> Kowalska, a Polish woman in her early 30s, approachable and competent, subtle
> natural smile.
>
> Scene/backdrop: clean warm off-white studio background with very soft depth.
>
> Subject: fictional person, shoulder-length medium brown hair, natural makeup,
> dark forest-green business-casual blouse.
>
> Style/medium: believable modern corporate portrait photography, natural skin
> texture, not stock-photo glossy.
>
> Composition/framing: centered head and shoulders, direct eye contact, square
> crop, face remains clear at 32–48 px avatar size, generous but compact
> headroom.
>
> Lighting/mood: soft diffused daylight, calm, trustworthy, professional.
>
> Color palette: warm neutrals, natural skin tones, muted forest green.
>
> Constraints: entirely fictional person; no text, no logo, no watermark, no
> jewelry that reads as a brand, no exaggerated retouching, no busy background.

## Gate

Kontrolowane są viewporty 1440, 1024, 768, 390 i 320 px. Testy obejmują visual
regression, axe, klawiaturę, no-JS, reduced motion, forced colors, minimalny
tekst 12 px i brak poziomego overflow.

Końcowe kadry odbiorowe znajdują się w
`artifacts/visual-qa/12h-full-lead-hero/`.

Końcowa weryfikacja:

- `pnpm format:check` — PASS;
- `pnpm lint` i `pnpm typecheck` — PASS, 8/8;
- `pnpm test` — PASS, 87 testów jednostkowych oraz PostgreSQL/RLS i WordPress;
- `pnpm security:scan` — PASS;
- `pnpm build` — PASS, 8/8, 37 tras, widget 15 903 B gzip;
- `pnpm e2e` — PASS, 32/32.

Etap nie zmienia API, danych, tenant scope ani tras poza `/` i nie daje zgody
na deployment.
