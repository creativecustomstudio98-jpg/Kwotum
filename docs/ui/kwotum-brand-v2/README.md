# Kwotum brand mark V2

**Status:** zaakceptowana referencja znaku  
**Data:** 2026-08-11

## Źródło

- referencja właściciela: `reference-logo-1254x1254.png`;
- rozmiar: 1254 × 1254 px;
- SHA-256: `0d54c6c8673089fc65c52762b903765eccceb3ade5aeeb2a1a615497f9f9d5e9`.

Referencja zastępuje wcześniejszy symbol w miejscach prezentujących markę
Kwotum. Nie zmienia nazwy, typografii słownej ani tokenów kolorystycznych.

## Przygotowanie runtime

Korekta właścicielska z 2026-08-11 zastępuje wcześniejszy wariant dokładnym
znakiem dostarczonym jako `ikonka-kwotum (1).svg`. Zewnętrzne tło oraz światło
wewnątrz litery Q są przezroczyste; gradientowy obwód, trzy linie i znacznik
potwierdzenia pozostają częścią logo. Runtime używa:

| Plik                                      | Rozmiar   | SHA-256                                                            |
| ----------------------------------------- | --------- | ------------------------------------------------------------------ |
| `apps/web/public/kwotum-logo-v3.png`      | 768 × 768 | `9c552e5edbec779374b7b9439e096513768f7972a29913541eb4525a4b75367c` |
| `apps/web/public/kwotum-logo-icon-v3.png` | 192 × 192 | `fed363f683e31f8ed55712565444e33dc8e43efcf1fa3b87fea8a0e088e60344` |
| `apps/web/public/apple-touch-icon-v3.png` | 180 × 180 | `ca8666c75417f0eaed0d78db57292cce6d2000bc86d582c2b9ec4dd83acc110d` |

Wariant 768 px jest źródłem dla komponentów obrazu i wiadomości e-mail.
Wariant 192 px służy faviconie oraz małym, bezpośrednim tłom CSS. Sufiks `-v3`
wymusza odświeżenie wcześniejszego znaku w cache przeglądarek i optymalizatora
obrazów. Wszystkie trzy pliki mają przezroczyste narożniki.

## Zakres użycia

- header i footer stron publicznych;
- demonstracyjne widoki produktu i integracji;
- logowanie, rejestracja i odzyskiwanie dostępu;
- wybór organizacji i sidebar panelu;
- favicon i Apple touch icon;
- sześć szablonów Supabase Auth;
- transakcyjne e-maile leada i zaproszenia do procesu.

Logo klienta wewnątrz widgetu pozostaje tenantowe i nie jest zastępowane
znakiem Kwotum.

Ekran wyboru organizacji korzysta z aktywnego kontraktu
`../panel-minimal-v1/README.md`. Zachowuje prawdziwe role i tenantowe
podsumowania; niniejszy pakiet steruje wyłącznie znakiem marki.
