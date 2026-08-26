# PX4 — raport lokalnej implementacji wizualnych wyborów

**Data:** 2026-08-25  
**Zakres:** builder, `text_cards`, `icon_cards`, bezpieczne `image_cards`, runtime i visual QA  
**Środowisko:** wyłącznie lokalne; bez deployu  
**Wynik:** zakres techniczny PX4 ukończony; docelowe fotografie pozostają własnością firmy i nie są zastępowane materiałem demonstracyjnym

## Wynik produktowy

Firma może dobrać sposób prezentacji do rodzaju decyzji zamiast zamieniać
każde pytanie w identyczną listę. Zwykła lista pozostaje domyślna. Karta
tekstowa służy wtedy, gdy odpowiedź wymaga krótkiego wyjaśnienia, karta ikonowa
— gdy kategorię można jednoznacznie przedstawić kontrolowanym symbolem, a karta
obrazowa — gdy realne zdjęcie materiału, produktu lub efektu zmienia jakość
decyzji klienta.

Builder nie generuje treści, opisów alternatywnych ani obrazów. Niekompletna
prezentacja blokuje zapis i wskazuje konkretne pole. `image_cards` wymagają
wyboru zdjęcia z prywatnej biblioteki danej organizacji oraz ręcznie
uzupełnionego, sensownego tekstu alternatywnego.

## Autorski kierunek wizualny

Shell `visual_configurator` jest płaskim, precyzyjnym dokumentem decyzyjnym:

- bez hero, gradientów, cieni, badge'y i ozdobnego logo-inicjału;
- jedna wąska oś treści, cienki postęp i typograficzna hierarchia;
- karty są kontrolkami wyboru, nie dekoracyjnymi kaflami dashboardu;
- jeden zielony akcent służy stanowi i działaniu;
- obraz ma stałe proporcje 4:3 i nie zmienia geometrii karty podczas ładowania;
- na telefonie akcje pozostają w naturalnym przepływie, bez nachodzącego paska;
- po zmianie kroku nagłówek wraca do viewportu, a `fieldset` otrzymuje fokus.

Nie użyto żadnego starego zdjęcia, stocka ani wygenerowanej dekoracji. Obrazy w
automatycznych testach są wyłącznie neutralnymi próbkami technicznymi do
sprawdzenia wymiarów, błędu ładowania i dostępności. Nie są częścią kierunku
artystycznego ani biblioteki produktu.

## Kontrakt kart

| Obszar    | Decyzja                                                                                    |
| --------- | ------------------------------------------------------------------------------------------ |
| Warianty  | `default`, `text_cards`, `icon_cards`, `image_cards`                                       |
| Opis      | jawny tekst 1–180 znaków dla każdej opcji karty tekstowej                                  |
| Ikona     | jedna z 24 zamkniętych wartości kontraktu                                                  |
| Obraz     | UUID gotowego assetu tej samej organizacji i ręczny tekst alternatywny                     |
| Renderer  | `textContent` i kontrolowane DOM; bez `innerHTML`, SVG/HTML użytkownika i dowolnych URL-i  |
| Semantyka | natywny radio/checkbox, etykieta tekstowa i opcjonalny opis                                |
| Preview   | ten sam Web Component i manifest co publiczny runtime; signed URL istnieje tylko w pamięci |

## Bezpieczny pipeline zdjęć

ADR-046 i migracja `20260825000300_stage12zp_px4_flow_media.sql` wprowadzają
prywatny, tenantowy rejestr `flow_media_assets`:

1. Owner/Admin wysyła JPEG, PNG albo WebP do 5 MiB.
2. Serwer sprawdza metadane, rozszerzenie, magic bytes i skan malware.
3. `sharp` dekoduje obraz z limitem pikseli, obraca według orientacji, usuwa
   metadata, ogranicza do 1600×1200 i zapisuje niezmienny WebP.
4. Baza rezerwuje rekord `pending`; prywatny Storage otrzymuje losową,
   tenantową ścieżkę; dopiero potwierdzony zapis przechodzi do `ready`.
5. Triggery bazy blokują draft i immutable snapshot wskazujący asset obcego
   tenanta, nieistniejący albo niegotowy.
6. Publiczna trasa rozwiązuje tylko asset przywołany przez wersję wskazanego,
   aktualnie opublikowanego flow. Nie ujawnia ścieżki Storage ani tenant ID.
7. Widget rezerwuje miejsce 4:3, ładuje obraz leniwie i pokazuje stabilny
   fallback bez utraty natywnej kontrolki wyboru.

Historyczne opublikowane wersje zachowują dostęp do przypiętych, niezmiennych
assetów. Polityka usuwania assetu używanego historycznie wymaga osobnego etapu
retencji; PX4 celowo nie dodaje destrukcyjnego przycisku bez tej decyzji.

## Visual QA

Karty tekstowe i ikonowe: `artifacts/visual-qa/px4-visual-choices/`.

- `visual-choices-1440.png` — dwukolumnowy wybór ikonowy;
- `visual-choices-390.png` — jednokolumnowy wybór ikonowy;
- `text-cards-390.png` — drugi krok po naprawie przewijania i fokusu.

Mechanika kart obrazowych: `artifacts/visual-qa/px4-image-cards/`.

- `image-cards-1440-fallback.png` — stały slot obrazu i fallback na desktopie;
- `image-cards-390-fallback.png` — ta sama semantyka bez overflow na telefonie.

E2E potwierdza etykiety, opisy, radio/checkbox, lazy loading, jawne wymiary,
brak layout shift po błędzie obrazu, nawigację, mobile overflow i axe WCAG
A/AA. RLS osobno potwierdza brak odczytu i użycia assetu innego tenanta.

## Gate lokalny

| Kontrola              | Wynik                                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| Format                | PASS — całe repozytorium                                                     |
| Lint                  | PASS — 8/8 pakietów, 0 ostrzeżeń                                             |
| Typecheck             | PASS — 8/8 pakietów                                                          |
| Testy jednostkowe     | PASS — 270/270                                                               |
| RLS/PostgreSQL        | PASS — pełny zestaw, w tym negatywne testy mediów                            |
| Build                 | PASS — 16/16; 41 generowanych stron                                          |
| Widget JavaScript     | PASS — 25 410 B gzip / 92 160 B                                              |
| E2E                   | PASS — karty tekstowe, ikonowe i obrazowe; desktop/mobile/axe                |
| SAST i secret scan    | PASS — kontrole lokalne                                                      |
| Audit zależności      | NIEWYKONANY — wymaga egressu do npm, poza lokalnym zakresem sesji            |
| Visual QA właściciela | otwarte — wybór prawdziwych zdjęć i finalny content wymaga świadomego review |

## Istotne pliki

- `packages/validation/src/flow.ts` — zamknięty kontrakt prezentacji.
- `apps/web/lib/flows/media.ts` — walidacja, normalizacja i prywatny zapis.
- `supabase/migrations/20260825000300_stage12zp_px4_flow_media.sql` — tenant
  registry, RLS, triggery integralności i wąski resolver publiczny.
- `packages/widget/src/element.ts` — semantyczne karty i fallback obrazu.
- `packages/ui/src/widget.css` — centralna kompozycja desktop/mobile.
- `apps/web/app/panel/[organizationId]/procesy/[flowId]/flow-builder.tsx` —
  biblioteka organizacji i konfiguracja opcji.
- `tests/e2e/widget.spec.ts` — funkcjonalny i wizualny gate runtime.
- `supabase/tests/flow_media.sql` — negatywne testy własności i projekcji.

## Granice po PX4

- brak stockowej biblioteki i automatycznie generowanych zdjęć jest świadomą
  decyzją jakościową;
- realne fotografie muszą pochodzić od firmy albo z odrębnej, zaakceptowanej
  produkcji, wraz z prawami do użycia;
- usuwanie, zastępowanie i retencja assetów przywołanych historycznie wymagają
  osobnej polityki i implementacji;
- środowisko inne niż loopback nadal wymaga skonfigurowanego prywatnego
  skanera malware — błąd lub brak odpowiedzi działa fail-closed;
- przed produkcją pozostają testy na rzeczywistym Storage, hostingu, domenie i
  materiałach pilota. Lokalny gate nie jest zgodą na deploy.
