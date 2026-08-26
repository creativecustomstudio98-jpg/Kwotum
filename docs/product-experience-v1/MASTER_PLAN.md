# Adaptive Intake — master plan

**Status:** kanoniczny dla programu PX1–PX7  
**Data:** 2026-08-25  
**Nadrzędne źródła:** `AGENTS.md`, `docs/DECISIONS.md`,
`docs/PRODUCT_REQUIREMENTS.md`, `docs/SECURITY.md`

## 1. Decyzja produktowa

Kwotum nie jest jednym długim formularzem. Jest warstwą intake przed sprzedażą,
która dobiera poziom prowadzenia do sytuacji klienta. Docelowo jeden opublikowany
proces deklaruje jeden główny `experienceMode`:

| Tryb                  | Kiedy używać                                        | Domyślna kompozycja                  | Czego nie robi                           |
| --------------------- | --------------------------------------------------- | ------------------------------------ | ---------------------------------------- |
| `quick_form`          | klient zna usługę, produkt lub model                | 3–8 pól na jednej stronie            | nie udaje konfiguratora                  |
| `guided_brief`        | zakres wymaga wywiadu                               | jedno pytanie lub mała grupa na krok | nie wymusza obrazu bez wartości          |
| `visual_configurator` | wybór jest przestrzenny, materiałowy lub produktowy | dostępne karty, próbki i media       | nie rekomenduje bez zatwierdzonych reguł |

Tryb jest częścią wersjonowanego snapshotu i publicznego manifestu. Nie zmienia
granicy zaufania: klient nadal nie przesyła ceny, score ani definicji procesu.

## 2. Zasady projektowania pytań

Prezentacja wynika z natury decyzji, nie z chęci dekorowania ekranu.

- `list` — budżet, termin, długie lub tekstowe rozróżnienia;
- `text_cards` — usługi i zakresy wymagające krótkiego objaśnienia;
- `icon_cards` — rozłączne, łatwo rozpoznawalne kategorie;
- `image_cards` — styl, materiał, produkt i różnice wizualne;
- `swatches` — kolor lub próbka, zawsze z nazwą tekstową;
- `segmented` — mały, zamknięty wybór, zwykle Tak/Nie;
- `select` — drugorzędna lista z wieloma pozycjami;
- `slider` — wyłącznie orientacyjny zakres z widoczną wartością i polem
  alternatywnym dla klawiatury.

Każdy wariant musi działać bez obrazu. Media są dodatkiem do semantycznej
etykiety, nie jedynym nośnikiem znaczenia.

## 3. Docelowy kontrakt prezentacyjny

To kierunek do doprecyzowania w PX2, nie gotowy schema diff:

```ts
type StepPresentation = {
  variant:
    "list" | "text_cards" | "icon_cards" | "image_cards" | "swatches" | "segmented" | "select";
  columns?: 1 | 2 | 3;
  density?: "comfortable" | "compact";
};

type OptionPresentation = {
  description?: string;
  iconKey?: ApprovedIconKey;
  mediaAssetId?: string;
  mediaAlt?: string;
  badge?: string;
};
```

Kontrakt musi mieć osobny `schemaVersion`, limity długości, allowlistę ikon,
kontrolę mediów, migrator, niezależną walidację PostgreSQL i projekcję publiczną.
Nie wolno przechowywać dowolnego HTML, URL użytkownika, CSS ani SVG.

## 4. Szybki formularz

`quick_form` nie jest nową tabelą ani osobnym endpointem. To alternatywna
kompozycja istniejących kroków:

- wszystkie osiągalne pola bez rozgałęzień są renderowane na jednej stronie;
- formularz ma jedną walidację i jeden finalny submit;
- dla rozgałęzienia przekraczającego kontrakt publikacja blokuje tryb albo
  wymaga przełączenia na `guided_brief`;
- pola kontaktowe i prywatność są częścią spójnego zakończenia;
- istniejące rate limit, origin allowlist, Turnstile i idempotencja pozostają;
- wynik może pojawić się przed lub po kontakcie wyłącznie według jawnej,
  wersjonowanej polityki.

## 5. Kontekst hosta i prefill

Strona hosta może przekazać wyłącznie skonfigurowane, typowane wartości, np.
`product_id`, `model`, `service_slug`, `cta_source`. Kontekst:

- ma tenantową allowlistę kluczy i typów;
- jest walidowany po stronie serwera;
- nie może nadpisywać ceny, score, zgód, tenant ID ani routingu;
- nie przyjmuje dowolnych metadanych;
- ma jawne rozróżnienie wartości widocznej, ukrytej i potwierdzanej przez klienta;
- jest snapshotowany przy leadzie wraz ze źródłem, bez kopiowania sekretów.

## 6. Kontakt i wynik

Proces potrzebuje wersjonowanej polityki zakończenia, która określa:

- położenie kontaktu: przed częściowym wynikiem albo po wyniku;
- widoczne i wymagane pola z zamkniętej listy;
- preferowany kanał i porę kontaktu;
- dostępność plików oraz miejsce uploadu;
- publiczny wynik zależny od zatwierdzonych reguł outcome;
- następny krok bez niepotwierdzonego SLA;
- awaryjny kanał kontaktu firmy.

Scoring pozostaje prywatny. Outcome nie może dyskryminować ani automatycznie
odrzucać osoby na podstawie danych wrażliwych.

## 7. Branding

Minimalny branding widgetu obejmuje logo, nazwę firmy i kolor akcentu. Kolor
przechodzi automatyczną kontrolę kontrastu, a niewłaściwa wartość używa
bezpiecznego fallbacku. Nie dopuszczamy dowolnego CSS, fontów z URL, HTML ani
skryptów. Branding nie zmienia marki panelu ani publicznych identyfikatorów
kompatybilności.

## 8. Szablony

Szablon produkcyjny jest pakietem hipotez i instrukcji kalibracji, nie gotową
prawdą branżową. Powinien zawierać:

- wskazany tryb doświadczenia i alternatywną szybką ścieżkę;
- pytania, prezentacje i uzasadnienie ich kolejności;
- reguły routingu, pricingu, scoringu i outcome;
- konfigurację kontaktu, prywatności, wyniku i powiadomień;
- listę wartości wymagających decyzji firmy;
- przypadki regresyjne i datę ostatniej walidacji.

Statusy: `hypothesis`, `pilot_validated`, `production_validated`. UI nie używa
słowa „zweryfikowany” dla `hypothesis`.

## 9. Metryki decyzji

Porównujemy tryby przy zachowaniu jakości leada:

- view → start → result → lead;
- czas ukończenia;
- błędy walidacji i drop-off kroku/pola;
- kompletność briefu według jawnego klucza firmy;
- czas do pierwszego kontaktu;
- accepted, quote, won/lost;
- reklamacje dotyczące wyniku;
- dostępność fallbacku i utracone submit’y.

Nie uznajemy wzrostu liczby leadów za sukces, jeśli spada kompletność,
dostarczalność albo wynik sprzedażowy.

## 10. Etapy

1. **PX1 — discovery i kontrakt:** ten pakiet, korekta obietnic, protokół badań.
2. **PX2 — schema prezentacji:** ADR, schema v3, migrator i walidacja bez UI.
3. **PX3 — quick form:** renderer i builder jednego ekranu.
4. **PX4 — visual choices:** karty tekstowe, ikony i kontrolowane media.
5. **PX5 — context/prefill:** bezpieczny kontrakt host → sesja → lead.
6. **PX6 — contact/outcomes/branding:** wersjonowane zakończenie i zaufanie.
7. **PX7 — pilot:** Fortez plus reprezentatywna firma usługowa, UAT i go/no-go.

Każdy etap ma osobny worktree, gate i prompt. PX2–PX6 są sekwencyjne, ponieważ
dotykają tego samego wersjonowanego agregatu i nie mogą powstawać na równoległych
założeniach.

## 11. Jawne non-goals programu

- pełny node-based builder;
- dowolny kod, formuły, HTML lub CSS użytkownika;
- generowanie ceny lub score przez AI;
- natywny CRM, kalendarz i billing;
- nieograniczony DAM lub biblioteka stockowa;
- automatyczna rekomendacja produktu bez zaakceptowanych reguł;
- usunięcie starego formularza, telefonu lub WhatsAppa podczas pilota.
