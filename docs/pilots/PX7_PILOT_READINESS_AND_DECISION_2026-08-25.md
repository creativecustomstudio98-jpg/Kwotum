# PX7 — gotowość kontrolowanego pilota i decyzja

**Data przeglądu:** 2026-08-25  
**Zakres:** Fortez oraz syntetyczny profil firmy meblowej  
**Decyzja dla prawdziwego ruchu:** **NO-GO**  
**Stan konfiguracji lokalnej:** gotowa do dalszego UAT na danych syntetycznych

## 1. Decyzja wykonawcza

Scalony produkt pozwala przygotować trzy odrębne ścieżki pilota bez tworzenia
nowego silnika i bez dodatkowego śledzenia osoby:

1. Fortez „Znam model” — krótki formularz z potwierdzanym modelem;
2. Fortez „Pomóż mi dobrać” — prowadzony proces bez automatycznej rekomendacji;
3. firma meblowa — wizualnie prowadzony brief zakresu inwestycji.

Konfiguracje przechodzą ten sam parser i pełny walidator grafu co procesy
produkcyjne. Nie zawierają ceny, scoringu, assetów ani reguł rekomendacji.
Telefon, WhatsApp i stary formularz są zapisane jako obowiązkowe fallbacki.

Nie ma jednak dowodów wymaganych do przyjęcia prawdziwych danych: stagingowego
UAT na immutable SHA, aktywnych schedulerów i alertów kolejki, syntetycznej
dostawy, restore drill, zatwierdzonego DPA i treści prawnych, właścicieli po
stronie obu firm ani podpisanej akceptacji briefu. Zgodnie z zasadą „brak dowodu
oznacza NO-GO” pilot nie może zostać uruchomiony.

## 2. Status konfiguracji

| Proces                        | Tryb                  | Rozdzielenie pomiaru             | Kontakt        | Status             |
| ----------------------------- | --------------------- | -------------------------------- | -------------- | ------------------ |
| Fortez — znany model          | `quick_form`          | osobny flow + `known_model`      | phone required | hypothesis / valid |
| Fortez — pomoc w doborze      | `visual_configurator` | osobny flow + `guided_selection` | phone required | hypothesis / valid |
| Studio Forma — brief zabudowy | `visual_configurator` | osobny flow + `visual_brief`     | e-mail v3      | synthetic / valid  |

„Studio Forma” jest syntetycznym profilem reprezentatywnej firmy, a nie
podpisanym uczestnikiem pilota. Nie wolno używać jego nazwy ani konfiguracji
jako dowodu akceptacji rynku.

Pliki:

- `configs/fortez-known-model-quick.v1.json`;
- `configs/fortez-guided-selection.v1.json`;
- `configs/studio-forma-visual-brief.v1.json`.

Wersje polityki prywatności mają celową wartość `pilot-draft-not-approved` i
kontrolny hash. To zabezpieczenie przed przypadkową publikacją przed review
prawnym; nie są prawdziwą treścią informacji.

## 3. Pomiar bez PII

Quick i guided są odrębnymi procesami, więc porównanie odbywa się po
`flow_id`/`flow_version_id`, nie po danych kontaktowych ani dowolnym metadata.
`cta_source` jest stałą immutable kontekstu i nie trafia do analytics. Istniejący
zamknięty enum źródła nadal opisuje wyłącznie kanał pozyskania.

Minimalny zestaw decyzji:

| Metryka                       | Jednostka i źródło                  | Warunek interpretacji                         |
| ----------------------------- | ----------------------------------- | --------------------------------------------- |
| view → start → result → lead  | agregat eventów na flow version     | minimum pięć sesji; bez łączenia osób         |
| mediana ukończenia            | sekundy z agregatu                  | osobno quick i guided                         |
| drop-off i validation error   | krok/pole, bez wartości odpowiedzi  | sygnał iteracji, nie ocena klienta            |
| kompletność briefu            | jawny arkusz operatora po kontakcie | wspólny klucz zaakceptowany przez firmę       |
| zaakceptowany submit          | commit leada + stan outboxu         | zero utraconych i zero cichych błędów         |
| accepted / quote / won / lost | operacyjny status firmy             | nie wolno wnioskować z samej liczby leadów    |
| reklamacja wyniku             | agregat ręcznego review             | każda reklamacja podlega analizie treści      |
| dostępność fallbacku          | syntetyczny smoke hosta             | telefon/formularz działają przy awarii Kwotum |

Baseline istniejącego formularza, telefonu i WhatsAppa nie został dostarczony.
Nie ustawiamy arbitralnego celu wzrostu konwersji. Przed ruchem właściciel firmy
musi zatwierdzić okres baseline'u, definicję kompletnego briefu i minimalną
próbę; mniejsza próba daje wyłącznie wynik jakościowy.

## 4. Bramka przed ruchem

| Gate                                     | Stan       | Wymagany dowód                                            |
| ---------------------------------------- | ---------- | --------------------------------------------------------- |
| immutable SHA po scaleniu PX2–PX6        | BLOCKED    | czysty commit, CI i manifest artefaktów                   |
| osobne staging/production i dane testowe | BLOCKED    | konfiguracja środowisk i smoke bez produkcyjnych danych   |
| exact origin, CSP, CORS i Turnstile      | LOCAL PASS | stagingowy smoke Fortez nadal wymagany                    |
| tenant isolation i fail-closed submit    | LOCAL PASS | powtórzenie RLS/E2E na release SHA                        |
| scheduler powiadomień i alert wieku      | BLOCKED    | udokumentowany przebieg, failure injection i owner alertu |
| syntetyczna dostawa HTML/text            | BLOCKED    | inbox proof bez PII dla adresu pilota                     |
| backup DB/Storage i restore drill        | BLOCKED    | podpisany protokół RPO/RTO                                |
| DPA, role stron, retencja i privacy      | BLOCKED    | zatwierdzone dokumenty oraz finalny hash treści           |
| ręczny AT i urządzenia docelowe          | BLOCKED    | VoiceOver/NVDA, zoom 200/400% i host staging              |
| akceptacja Fortez                        | BLOCKED    | owner, pytania, brief, wynik, kontakt i plan wyłączenia   |
| druga prawdziwa firma                    | BLOCKED    | uczestnik, owner, baseline i własne zaakceptowane media   |

`LOCAL PASS` nie jest zgodą na rollout. Oznacza wyłącznie, że kontrola istnieje
w lokalnym kodzie i ma automat; musi zostać powtórzona na właściwym release SHA
i środowisku docelowym.

### Wynik lokalnego gate'u

| Kontrola         | Wynik                                                           |
| ---------------- | --------------------------------------------------------------- |
| konfiguracje PX7 | 3/3 valid; 4/4 testy inwariantów                                |
| lint             | 8/8 pakietów                                                    |
| typecheck        | 8/8 pakietów                                                    |
| unit             | 282/282                                                         |
| PostgreSQL / RLS | pełny zestaw zielony                                            |
| WordPress        | WP 6.9.2 i 7.0.2 / PHP 8.5.2                                    |
| security         | statyczny skan i working-tree secret scan zielone               |
| build            | 16/16; 42 strony; widget 28 996 B gzip / 92 160 B               |
| E2E widget       | 8/8 Chromium; a11y, offline, popup, context, Turnstile i mobile |
| format / diff    | Prettier zielony; diff bez błędów whitespace                    |

Gate potwierdza brak regresji lokalnego produktu. Nie potwierdza zewnętrznej
dostawy, hostingu, operacji firmy ani przetwarzania prawdziwych danych.

## 5. Fallback i wyłączenie

Nowe CTA jest dodatkiem. Nie zastępuje nawigacji, telefonu, WhatsAppa ani
`send.php`. Nie konfigurujemy automatycznego przekierowania starej ścieżki do
Kwotum.

Kolejność wyłączenia:

1. wyłączyć wyłącznie nowe CTA na hoście;
2. potwierdzić telefon, WhatsApp, stary formularz i kotwicę modelu;
3. unpublish proces lub usunąć jego origin z allowlisty;
4. zatrzymać nowy ruch, ale dokończyć lub jawnie obsłużyć zaakceptowany outbox;
5. zachować dane zgodnie z retencją i legal hold — nie kasować ich w rollbacku;
6. zapisać request ID, zakres incydentu, właściciela i decyzję o wznowieniu.

Brak dostępu do panelu nie może być jedyną metodą awaryjnego usunięcia CTA ze
strony firmy. Dokładna procedura hosta wymaga zatwierdzonego backupu i osoby z
uprawnieniem do wdrożenia.

## 6. Kryteria decyzji końcowej

### GO

Wszystkie P0 są potwierdzone dowodem na tym samym SHA; firma akceptuje treść i
brief; nie ma utraconego zaakceptowanego submitu, tenant leakage ani cichego
błędu kolejki; fallback i wyłączenie zostały przećwiczone. GO dotyczy wyłącznie
jednego wskazanego tenanta i zakresu.

### ITERATE

Bezpieczeństwo i operacje są zielone, ale badanie pokazuje konkretne problemy z
pytaniami, tarciem, kompletnością lub zrozumieniem wyniku. Iteracja nie może
obniżać fallbacku ani rozszerzać danych.

### NO-GO

Brakuje dowodu P0, firma nie akceptuje procesu, wystąpiła utrata submitu,
wyciek, cichy błąd kolejki albo fallback nie działa. Obecny status spełnia tę
definicję z powodu brakujących dowodów P0.

## 7. Rejestr decyzji

| Pole                    | Wartość                                          |
| ----------------------- | ------------------------------------------------ |
| Decyzja                 | NO-GO dla prawdziwego ruchu                      |
| Zakres                  | Fortez + druga firma usługowa                    |
| Data                    | 2026-08-25                                       |
| Product Owner           | nieprzypisany — blokuje zmianę decyzji           |
| Fortez Business Owner   | nieprzypisany — blokuje UAT                      |
| Druga firma / Owner     | nieprzypisani — blokują Pilot B                  |
| Privacy/Security Owner  | nieprzypisani — blokują prawdziwe dane           |
| Następny dozwolony krok | syntetyczny staging i domknięcie P0, nie rollout |

Zmiana decyzji wymaga nowego dokumentu z dowodami, właścicielami, datą i
immutable SHA. Nie wolno nadpisać niniejszego raportu słownym „jest okej”.
