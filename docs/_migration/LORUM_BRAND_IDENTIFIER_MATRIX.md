# Matryca marki i identyfikatorów

**Status:** kanoniczna  
**Podstawa:** ADR-024, ADR-028 i nadrzędny dla widocznej marki ADR-033

| Element                       | Wartość                              | Zasada                                                            |
| ----------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Widoczna nazwa produktu       | `Kwotum`                             | używana w marketingu, panelu, widgetcie, e-mailach i WordPress UI |
| Historyczne nazwy             | `Lorum`, `Wyceno`                    | nie kopiować do nowej powierzchni                                 |
| Techniczne prefiksy `lorum:*` | istniejący kontrakt preferencji UI   | zachować                                                          |
| Pakiety                       | `@wyceno/*`                          | zachować                                                          |
| Custom element                | `<wyceno-widget>`                    | zachować                                                          |
| Eventy przeglądarki           | `wyceno:*`                           | zachować                                                          |
| Nagłówek sesji                | `X-Wyceno-Session`                   | zachować                                                          |
| Storage prefix                | techniczny `wyceno`                  | zachować                                                          |
| WordPress shortcode/namespace | istniejący kontrakt Wyceno           | zachować                                                          |
| Nazwy migracji i tabel        | istniejące techniczne identyfikatory | nie zmieniać w rebrandingu                                        |
| Dane demonstracyjne           | jawnie oznaczone                     | nie używać prawdziwych danych osobowych                           |

Zmiana dowolnego stabilnego identyfikatora wymaga osobnego ADR, matrycy
kompatybilności, okresu przejściowego i testów istniejących osadzeń.
