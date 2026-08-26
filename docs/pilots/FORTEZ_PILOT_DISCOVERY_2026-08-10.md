# Fortez — discovery i kontrakt pierwszego pilotażu

**Status:** discovery techniczne ukończone; prawdziwe dane nadal `NO-GO`  
**Data kontroli:** 2026-08-10  
**Status:** discovery techniczne ukończone; prawdziwe dane nadal `NO-GO`
**Data kontroli:** 2026-08-10
**Zakres:** jedna organizacja, jeden proces, kontrolowany ruch, równoległy
kanał kontaktu i możliwość natychmiastowego wyłączenia

Dokument nie zawiera danych dostępowych, prywatnej korespondencji ani danych
osobowych klienta. Adres odbiorczy, osoby odpowiedzialne, dokumenty prawne i
sekrety środowiska muszą zostać skonfigurowane poza repozytorium.

## 1. Decyzja po discovery

Fortez jest właściwym kandydatem do pierwszego pilotażu, ale nie wolno jeszcze
podłączać prawdziwego ruchu do Kwotum. Aktualna strona i obecny kontrakt leada
Kwotum różnią się w dwóch krytycznych miejscach:

1. Fortez wymaga telefonu i dopuszcza brak e-maila; Kwotum v1 wymaga e-maila.
2. Fortez nie będzie operacyjnie korzystać z panelu; alert firmy w Kwotum v1
   jest kierowany do najstarszego aktywnego Ownera zamiast do osobno
   skonfigurowanego adresu dostawy.

Przed UAT trzeba wdrożyć wersjonowaną politykę kontaktu `phone_required` oraz
tenantowy adres alertów niezależny od konta użytkownika. Zmiana wymaga ADR,
migracji forward-only, tenantowego RLS, testów negatywnych i kompatybilności z
istniejącymi procesami `email_required`.

**Aktualizacja 2026-08-11:** migracje FTZ-01/FTZ-02 są zastosowane na
produkcji, a tenant Fortez ma skonfigurowany niezależny adres dostawy poza
repozytorium. Podczas przygotowania draftu wykryto brak kontrolki buildera dla
`phone_required`; poprawka z osobnym obszarem Kontakt, wersjonowaną informacją
prywatności i serwerowym przeliczaniem hashy consentu przechodzi lokalny gate.
Prawdziwe dane pozostają `NO-GO` do wdrożenia tej poprawki, schedulera,
monitoringu, review prawnego, warsztatu i pełnego UAT dostawy.

## 2. Potwierdzony stan strony Fortez

Kontrolę wykonano na publicznej produkcji `https://fortez-przyczepy.pl` oraz
na lokalnym źródle statycznego serwisu. Nie wysyłano formularza i nie
przekazywano żadnych danych do firmy.

### 2.1. Architektura i powierzchnia

- serwis jest statycznym HTML/CSS/JavaScript na Apache/home.pl;
- publiczny katalog obejmuje 26 modeli w 6 seriach;
- istnieje porównywarka, 6 stron kategorii, 25 kart produktów, strony lokalne,
  blog, polityka prywatności, sitemap i robots;
- karty produktów przekazują model przez
  `/?model=GNxxx#kontakt` i zachowują `product_id`;
- formularz wysyła `FormData` przez `POST /send.php` do skrzynki firmowej;
- aktualny formularz zbiera imię, telefon, opcjonalny e-mail, model, wiadomość
  i wymagane potwierdzenie informacji prywatności;
- istnieje honeypot, limit rozmiaru, walidacja serwerowa, prosty limit per IP,
  neutralne komunikaty błędów i telefoniczny fallback;
- analityka Google uruchamia się dopiero po zgodzie, a dozwolona warstwa danych
  nie zawiera wartości pól formularza;
- mobile ma sticky CTA telefonu i WhatsApp; desktop zachowuje równoległe CTA;
- publiczne nagłówki obejmują HSTS, CSP, `nosniff`, `SAMEORIGIN`, ograniczone
  Permissions Policy i referrer policy.

### 2.2. Obecna ścieżka użytkownika

1. Użytkownik wybiera zastosowanie, serię, porównanie albo konkretny model.
2. Karta produktu prowadzi do formularza z ustawionym `GNxxx`.
3. Użytkownik podaje telefon, opcjonalnie e-mail i krótką wiadomość.
4. `send.php` przyjmuje zapytanie do wysyłki e-mail.
5. Firma oddzwania i ręcznie doprecyzowuje zastosowanie, ładunek,
   konfigurację, dostępność i termin.

Kwotum ma skrócić punkt 5 przez zebranie kompletnego briefu, a nie zastąpić
katalog, bieżące ceny, telefon, WhatsApp ani prosty formularz dla osoby, która
zna już model.

## 3. Cel pilotażu

Pilotaż odpowiada na jedno pytanie biznesowe:

> Czy prowadzony proces dla osób, które nie znają modelu, dostarcza Fortez
> bardziej kompletny brief bez pogorszenia liczby i niezawodności obecnych
> kontaktów?

Zakres v1:

- jeden proces: **Dobór przyczepy Neptun**;
- odbiorca: osoba, która zna zastosowanie, ale nie zna modelu lub konfiguracji;
- wynik: konsultacja i uporządkowany brief, nie automatyczna rekomendacja
  produktu, oferta ani gwarancja dostępności;
- bez uploadu plików w pierwszym rolloutcie;
- bez webhooka do zewnętrznego CRM;
- alert firmy e-mailem z retry i idempotencją;
- panel pozostaje dostępny operatorowi Kwotum, ale nie jest wymagany od Fortez;
- obecny formularz, telefon i WhatsApp pozostają aktywne przez cały pilotaż.

## 4. Proponowany proces v1

Poniższe pytania są hipotezą discovery. Publikacja wymaga warsztatu i akceptacji
Fortez; nie wolno traktować ich jako zatwierdzonych reguł sprzedażowych.

### Sekcja A — zastosowanie

1. Co chcesz przewozić?
   - dom, ogród lub remont;
   - materiały i regularna praca;
   - maszyny, quad lub sprzęt;
   - motocykl;
   - łódź albo skuter wodny;
   - inne / potrzebuję konsultacji.
2. Co dokładnie będzie najczęstszym ładunkiem?
3. Jaka jest orientacyjna masa ładunku?
   - bez wymuszania wiedzy technicznej;
   - opcja „nie wiem”.
4. Jak często przyczepa będzie używana?

### Sekcja B — wymagania i konfiguracja

5. Czy znasz już serię lub symbol modelu?
6. Jakiej długości lub przestrzeni ładunkowej potrzebujesz?
7. Które cechy są ważne?
   - uchylna skrzynia;
   - resory / łagodniejsze tłumienie;
   - jedna albo dwie osie;
   - demontowalne burty;
   - plandeka, stelaż, nadstawki lub inne akcesoria;
   - nie wiem — proszę o dobór.
8. Czy zestaw ma szczególne ograniczenia auta, haka lub DMC?

### Sekcja C — zakup i następny krok

9. Kiedy planowany jest zakup?
10. Jaki jest orientacyjny budżet albo czy użytkownik oczekuje konsultacji bez
    deklarowania budżetu?
11. Czy finansowanie gotówką, przelewem, leasingiem lub ratami ma znaczenie?
12. Z jakiej miejscowości jest użytkownik i czy może odwiedzić punkt po
    wcześniejszym potwierdzeniu terminu?

### Sekcja D — kontakt i informacja prywatności

13. Imię lub nazwa kontaktowa.
14. Telefon — wymagany dla procesu Fortez.
15. E-mail — opcjonalny.
16. Preferowana pora lub sposób kontaktu.
17. Wymagane, wersjonowane potwierdzenie informacji prywatności.

Nie dodajemy domyślnej zgody marketingowej. Jeżeli e-mail nie został podany,
nie tworzymy potwierdzenia e-mail dla respondenta, ale nadal tworzymy alert dla
firmy i kompletny lead.

## 5. Wynik, scoring i treści

### Wynik publiczny

Bezpieczny wynik v1:

- potwierdza przyjęcie odpowiedzi;
- przypomina, że dobór, cena, dostępność i termin wymagają potwierdzenia;
- informuje o spodziewanym następnym kroku bez obiecywania stałego SLA;
- nie pokazuje prywatnego score ani automatycznej decyzji.

### Scoring prywatny

Scoring może porządkować zapytania dopiero po warsztacie. Kandydaci do reguł:

- znany termin zakupu;
- wystarczający opis ładunku i masy;
- wskazany model albo konkretne wymagania;
- możliwość kontaktu i odwiedzenia punktu;
- kompletność, nie deklarowana „wartość” osoby.

Score nie może automatycznie odrzucać zapytania, dyskryminować ani być
przedstawiany jako rekomendacja produktu. Każda reguła wymaga przypadku
regresyjnego i akceptacji biznesowej.

## 6. Integracja ze stroną

### 6.1. Wariant startowy

Pierwszy rollout używa `mode="popup"` i osobnego CTA, np. **„Pomóż mi dobrać
przyczepę”**. CTA należy umieścić przy ścieżce „Nie znam modelu”, nie zamiast
przycisków „Zapytaj o model”.

Powody:

- użytkownik znający `GNxxx` zachowuje krótką ścieżkę;
- proces nie potrzebuje jeszcze zaufanego prefillu z hosta;
- wyłączenie pilota nie wymaga przebudowy katalogu;
- można mierzyć nową ścieżkę oddzielnie od obecnego `generate_lead`;
- awaria Kwotum nie blokuje telefonu, WhatsAppa ani `send.php`.

### 6.2. Zmiana CSP Fortez

Przed embedem CSP musi jawnie dopuścić wyłącznie produkcyjny origin Kwotum:

- `script-src`: `https://app.kwotum.pl`;
- `script-src`: `https://challenges.cloudflare.com` dla oficjalnego skryptu
  Turnstile;
- `style-src`: `https://app.kwotum.pl` dla arkusza `widget.css` w Shadow DOM;
- `connect-src`: `https://app.kwotum.pl`;
- `frame-src`: `https://challenges.cloudflare.com` dla adaptacyjnego challenge;
- pozostałe dyrektywy bez rozszerzania do wildcardów.

Loader `https://app.kwotum.pl/widget/v1/loader.js` zwraca CORS `*` i ładuje
wersjonowany `element.js` oraz `widget.css`. Docelowy test musi potwierdzić
loader, styl, API, preflight, błędy i brak konfliktu z CSP na Fortez.

### 6.3. Origin i API Kwotum

FTZ-03A zastąpił wildcard tenantową allowlistą przypiętą do instalacji procesu.
Owner/Admin zapisuje exact origin w panelu; API odzwierciedla tylko zatwierdzony
origin i ponownie sprawdza go dla konkretnego procesu lub sesji. W tenantowej
konfiguracji pilota, poza repozytorium, należy ustawić co najmniej:

- `https://fortez-przyczepy.pl`;
- `https://www.fortez-przyczepy.pl`, jeżeli host nie jest zawsze przekierowany
  przed uruchomieniem skryptu;
- origin Kwotum dla hosted flow i kontrolowanego UAT.

Odmowa obcego originu musi być testowana przed utworzeniem sesji i przed każdą
mutacją. Nagłówek Origin nie zastępuje rate limitu ani Turnstile.

## 7. Luki blokujące

| ID     | Priorytet                         | Luka                                                                           | Kryterium zamknięcia                                                                               |
| ------ | --------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| FTZ-01 | P0 / lokalnie zamknięty           | Kwotum wymaga e-maila, Fortez działa phone-first                               | ADR-039, schema v2, phone required, email optional, testy SQL/API/widget; czeka na deploy/UAT      |
| FTZ-02 | P0 / lokalnie zamknięty           | alert firmy jest związany z Ownerem panelu                                     | tenantowy adres alertów z RLS, walidacją, audytem i testem drugiego tenanta; czeka na deploy       |
| FTZ-03 | P0 / FTZ-03A+B lokalnie zamknięte | allowlista, rozproszony limit i Turnstile Siteverify są gotowe; brak wdrożenia | skonfigurować Cloudflare/Vercel, wdrożyć migrację/sekrety i wykonać smoke origin/429/replay/submit |
| FTZ-04 | P0                                | outbox aplikacji nie ma produkcyjnego schedulera i alertów                     | scheduler, osobny sekret, probe kolejki, alert wieku i syntetyczna dostawa                         |
| FTZ-04 | P0 / implementacja lokalna        | scheduler, heartbeat i probe są gotowe w kodzie; brak wdrożenia i alertu       | migracja/release, osobne sekrety, aktywny alert wieku i syntetyczna dostawa na jednym SHA          |
| FTZ-05 | P0                                | brak monitoringu submitu i kolejki oraz restore drill                          | uptime/error tracking bez PII, backup point, odtworzenie i podpisany wynik                         |
| FTZ-06 | P0                                | brak zatwierdzonych ról stron, DPA i treści informacji                         | review prawny i zaakceptowane wersje/hashy przed prawdziwymi danymi                                |
| FTZ-07 | P1                                | CSP Fortez nie dopuszcza Kwotum                                                | minimalna zmiana CSP i test na kopii/stagingu                                                      |
| FTZ-08 | P1                                | widget nie przyjmuje bezpiecznego kontekstu `GNxxx`                            | poza rolloutem v1; obecne CTA modelu pozostaje na `send.php`                                       |
| FTZ-09 | P1                                | lokalne źródło Fortez ma rozległy, niezacommitowany stan                       | osobny review, backup serwera i manifest-only deployment bez kasowania                             |

## 8. UAT przed prawdziwymi danymi

1. Utworzyć organizację i proces wyłącznie na danych syntetycznych.
2. Sprawdzić `phone_required` bez e-maila oraz wariant z e-mailem.
3. Potwierdzić dokładnie jeden lead przy retry submitu.
4. Potwierdzić alert firmy do skonfigurowanego odbiorcy.
5. Potwierdzić brak potwierdzenia klienta bez e-maila.
6. Potwierdzić HTML/text, escapowanie i brak PII w logach.
7. Sprawdzić obcy tenant, obcy origin, wygasłą sesję, 429 i Turnstile.
8. Sprawdzić popup na 1440, 768, 390 i 320 px, klawiaturę, Escape, focus
   return, axe, reduced motion, forced colors i zoom.
9. Sprawdzić brak pogorszenia obecnego formularza, telefonu, WhatsAppa, menu,
   porównywarki i kotwic `?model=GNxxx#kontakt`.
10. Sprawdzić CSP, CORS, brak PII w GA4 oraz osobne źródło/metadane Kwotum.
11. Przećwiczyć niedostępność Kwotum — strona i stare kanały muszą działać.
12. Przećwiczyć natychmiastowe wyłączenie CTA, unpublish i rollback plików
    Fortez z zatwierdzonej kopii.

## 9. Metryki i hypercare

Przed startem zapisujemy baseline obecnych kanałów bez PII. Techniczne progi
pilota:

- zero tenant leakage i zero PII w logach/analityce;
- zero utraconych zaakceptowanych submitów;
- brak duplikatów przy retry;
- alert firmy dostarczony lub jawnie zaalarmowany jako błąd;
- brak regresji głównych tras, telefonu, WhatsAppa i starego formularza;
- możliwość wyłączenia w czasie uzgodnionym w runbooku;
- codzienny przegląd błędów, kolejki i pierwszych leadów w pierwszym tygodniu.

Metryki jakościowe — kompletność briefu, czas do kontaktu, accepted/rejected,
quote i wynik sprzedażowy — wymagają właściciela po stronie Fortez i baseline'u.
Nie ustalamy arbitralnych progów konwersji przed pierwszym pomiarem.

## 10. Kolejność wykonania

1. ADR i implementacja FTZ-01/FTZ-02 wraz z migracją i testami.
2. Etap 13B: FTZ-03, rozproszony limit i Turnstile.
3. Etap 13A: FTZ-04, scheduler powiadomień i alert kolejki.
4. Monitoring, backup/restore i dowody bezpieczeństwa FTZ-05.
5. Warsztat Fortez: pytania, wynik, scoring, odbiorca, privacy, retencja i UAT.
6. Syntetyczny tenant i publiczny hosted flow bez prawdziwych danych.
7. Stagingowa kopia strony Fortez, minimalna zmiana CSP i popup CTA.
8. Pełny UAT, protokół GO/NO-GO i dopiero wtedy ograniczony rollout.

Brak podpisanego `GO` na końcowym immutable SHA oznacza `NO-GO`.
