# 07 — Visual QA i kryteria odbioru

**Status:** CANONICAL

## 1. Cel

Build, lint i typecheck nie potwierdzają jakości wizualnej. Każdy etap wymaga renderu i porównania.

## 2. Procedura dla każdego ekranu

1. Uruchom aplikację z realnym seedem/testowym tenantem.
2. Otwórz właściwą trasę.
3. Wykonaj screenshot przed zmianami.
4. Zaimplementuj wyłącznie zakres bieżącego etapu.
5. Wykonaj screenshot po zmianach.
6. Porównaj z odpowiednią referencją.
7. Wypisz 10 największych różnic.
8. Napraw różnice w kolejności:
   - geometria,
   - hierarchia,
   - typografia,
   - spacing,
   - border/radius,
   - kolor,
   - cień,
   - motion.
9. Wykonaj drugi screenshot po korekcie.
10. Uruchom testy i zatrzymaj etap.

## 3. Viewporty

```text
Desktop: 1536×1024, 1440×900, 1280×800
Tablet:  768×1024
Mobile:  390×844, 375×812
```

## 4. Kryteria geometrii

- shell odpowiada referencji,
- sidebar nie zmienia losowo szerokości między ekranami,
- topbar ma stałą strukturę,
- główne kolumny zachowują proporcje,
- wiersze tabel są zwarte,
- CTA nie skaczą między pozycjami,
- nie ma przypadkowych pustych stref,
- treść nie jest rozciągana na całą szerokość bez powodu,
- mobile nie zawiera poziomego scrolla dla podstawowej ścieżki.

## 5. Kryteria hierarchii

Użytkownik powinien w 3 sekundy rozpoznać:

- gdzie jest,
- jaki jest stan,
- co wymaga uwagi,
- jaka jest główna akcja,
- gdzie znajdują się dane źródłowe.

## 6. Kryteria komponentów

- wszystkie buttony korzystają z systemu wariantów,
- wszystkie inputy mają spójne wysokości,
- statusy mają semantyczne kolory i tekst,
- ikony są z jednej biblioteki,
- panel nie ma unikalnego radiusu/cienia bez powodu,
- brak lokalnych hexów poza tokenami,
- brak kopiowania domyślnego wyglądu biblioteki.

## 7. Kryteria responsive

- dashboard przestawia priorytety,
- tabela leadów zmienia się w karty,
- lead detail ma sticky actions,
- builder używa drill-down,
- filtry trafiają do drawer/bottom sheet,
- mobile widget działa z klawiaturą ekranową,
- targety dotykowe są wystarczające,
- brak uciętych etykiet bez alternatywy.

## 8. Kryteria dostępności

- widoczny focus,
- logiczny tab order,
- dialogi mają focus trap,
- aria tylko tam, gdzie potrzebna,
- label i error są powiązane z polem,
- status nie jest komunikowany wyłącznie kolorem,
- kontrast spełnia WCAG 2.2 AA,
- reduced motion,
- test axe dla krytycznych widoków.

## 9. Kryteria funkcjonalne

- żadna widoczna akcja nie jest atrapą,
- loading/empty/error/permission state istnieją,
- formularze mają walidację client + server,
- odświeżenie nie niszczy istotnego postępu,
- publikacja i zapis mają jasny stan,
- destrukcyjne akcje wymagają potwierdzenia,
- dane tenantów pozostają odseparowane.

## 10. Automatyzacja visual regression

Dla krytycznych ekranów dodaj Playwright screenshot tests. Stabilizuj:

- seed,
- daty,
- fonty,
- animacje,
- viewport,
- losowe identyfikatory,
- requesty sieciowe.

Nie ustawiaj absurdalnie dużego progu różnicy tylko po to, by test przechodził.

## 11. Automatyczne odrzucenie etapu

Etap jest nieakceptowalny, jeśli pojawi się choć jeden z poniższych problemów:

- gradient/glow/blob bez zatwierdzenia,
- duże zaokrąglenia na wszystkich panelach,
- przypadkowa siatka jednakowych kart,
- desktopowa tabela na mobile,
- wymyślony social proof,
- fake data bez oznaczenia,
- zastąpienie źródłowych danych AI summary,
- zmiana logiki biznesowej bez zakresu,
- nowa zależność bez uzasadnienia,
- pominięcie testów i screenshotów.
