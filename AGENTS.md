# AGENTS.md — instrukcja pracy nad Wyceno

## Cel produktu

Wyceno to wielodostępny SaaS dla polskich firm usługowych i obsługujących je agencji. Zastępuje ogólne zapytanie „ile kosztuje?” prowadzonym procesem, który zbiera zakres, budżet, termin, lokalizację i materiały, oblicza niewiążący wynik, kwalifikuje lead oraz przekazuje firmie uporządkowany brief. Priorytety, w tej kolejności, to: bezpieczeństwo danych, poprawność logiki, kompletność głównej ścieżki, użyteczność, dostępność, wydajność, jakość wizualna i dopiero liczba funkcji.

## Źródła prawdy

1. Przeczytaj ten plik, `docs/INDEX.md` i `docs/TASKS.md` przed zmianami.
2. Zakres produktu: `docs/PRODUCT_REQUIREMENTS.md`, `docs/SCOPE.md`, `docs/NON_GOALS.md`.
3. Architektura: `docs/ARCHITECTURE.md`, dane: `docs/DATABASE.md`, bezpieczeństwo: `docs/SECURITY.md`.
4. Decyzje przekrojowe: `docs/DECISIONS.md`. Zmiana architektury wymaga wpisu ADR przed implementacją.
5. UI V6: `CODEX_MASTER_PROMPT.md`, `docs/UI_SCREEN_SPEC.md`,
   `docs/RESPONSIVE_LAYOUT.md`, `docs/VISUAL_QA.md` i
   `docs/ui/REFERENCE_MANIFEST.md`.
6. Nowszy zaakceptowany obraz może zastąpić starszy wyłącznie w pokazanym
   regionie; nie rozszerza zakresu produktu i nie obniża bezpieczeństwa.
7. W razie konfliktu nowsza zaakceptowana decyzja w `docs/DECISIONS.md` ma pierwszeństwo, o ile nie obniża bezpieczeństwa.

## Zasady pracy

- Najpierw przeczytaj dokumentację i sprawdź stan repozytorium.
- Wybierz jeden zamknięty etap z `docs/TASKS.md`; nie rozpoczynaj następnego bez spełnienia gate.
- Nie zmieniaj architektury bez ADR.
- Nie twórz atrap funkcji ani przycisków bez działania.
- Nie ignoruj błędów TypeScript, nie wyłączaj lintowania i nie używaj `any` bez udokumentowanego uzasadnienia.
- Nie pomijaj testów i nie obniżaj ich rygoru dla zielonego wyniku.
- Nie dodawaj zależności bez celu, sprawdzenia utrzymania, licencji, bezpieczeństwa i wpływu na bundle.
- Nie kopiuj template’u dashboardu ani domyślnego wyglądu biblioteki UI.
- Nie rozpoczynaj implementacji ekranu bez wskazania konkretnego obrazu,
  viewportu i artefaktów visual QA wymaganych przez `docs/VISUAL_QA.md`.
- Nie zmieniaj tokenów lokalnie; decyzje wizualne należą do `packages/ui`.
- Nie zapisuj sekretów, prawdziwych danych osobowych ani plików klientów w repozytorium.
- Nie obchodź RLS i nie wykonuj zapytań do danych organizacji bez jawnego tenant scope.
- Autoryzacja musi być sprawdzana po stronie serwera; ukrycie kontrolki nie jest kontrolą dostępu.
- Nie publikuj strony bez kontroli SEO i nie pozwalaj indeksować panelu ani danych leadów.
- Nie wdrażaj migracji bez rollback planu; wdrożone migracje są niezmienne.
- Cena i score są obliczane lub potwierdzane po stronie serwera.
- Mocki są dozwolone tylko w testach, Storybooku, seedzie i wyraźnym trybie demo.

## Definition of Done

Funkcja jest ukończona tylko wtedy, gdy:

- działa funkcjonalnie i spełnia kryteria akceptacji;
- ma walidację wejścia oraz kontrolę uprawnień i tenant scope;
- obsługuje loading, empty state i error state;
- działa na mobile i jest dostępna klawiaturą;
- ma adekwatne testy, w tym negatywne przypadki bezpieczeństwa;
- przechodzi lint, typecheck, testy i build bez wyłączeń;
- ma zaktualizowaną dokumentację i backlog;
- została sprawdzona pod kątem bezpieczeństwa, prywatności i wydajności.

## Procedura każdej sesji

1. Przeczytaj `AGENTS.md`, `docs/TASKS.md` i dokumenty właściwe dla zadania.
2. Sprawdź `git status` i zachowaj cudze, niezwiązane zmiany.
3. Uruchom bazowe testy etapu.
4. Zapisz krótki plan i ryzyka.
5. Wykonaj tylko wybrany etap.
6. Uruchom lint, typecheck, testy i build.
7. Wykonaj self-review zmian i diffu.
8. Zaktualizuj dokumentację, `docs/TASKS.md` i w razie potrzeby `CHANGELOG.md`.
9. Raport końcowy ma zawierać: wykonane zmiany, istotne pliki, decyzje, komendy i wyniki testów, ryzyka, kryteria odbioru i następny etap.

## Granice katalogów

Instrukcja obejmuje całe repozytorium. Bardziej szczegółowy `AGENTS.md` w podkatalogu może doprecyzować zasady, ale nie może osłabić wymagań bezpieczeństwa, testów ani tenant isolation.
