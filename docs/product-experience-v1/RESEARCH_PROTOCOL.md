# PX1 — protokół badań Adaptive Intake

**Status:** gotowy do rekrutacji  
**Cel:** ustalić, kiedy szybki formularz, prowadzony brief i wizualny
konfigurator poprawiają kompletność zapytania bez nieuzasadnionego tarcia.

## 1. Próba minimalna

### Firmy

- 2 firmy z usługą drogą i silnie niestandardową, np. meble/remont;
- 1 firma produktowo-usługowa, np. ogrodzenia lub klimatyzacja;
- 1 firma z klientem zwykle znającym konkretny produkt/model;
- 1 mała firma obsługująca zapytania głównie telefonem i e-mailem;
- w próbie minimum dwóch respondentów, którzy faktycznie oddzwaniają do leadów.

### Klienci końcowi

Pięć moderowanych testów na własnym telefonie uczestnika, obejmujących minimum
trzy usługi. Co najmniej dwie osoby dostają scenariusz „wiem dokładnie, czego
chcę”, a dwie „znam potrzebę, ale nie rozwiązanie”.

## 2. Rekrutacja bez sugerowania rozwiązania

Nie rekrutujemy pytaniem o kalkulator, ikonki ani AI. Zaproszenie mówi:

> Badamy, jak firmy zbierają informacje przed pierwszą rozmową o usłudze oraz
> jak klienci składają zapytania na telefonie. Sesja nie jest prezentacją
> sprzedażową. Interesują nas również sytuacje, w których obecny formularz lub
> telefon działa lepiej.

Nie zapisujemy prawdziwych danych leadów, sekretów handlowych, cenników ani
danych szczególnych w repozytorium. Notatki używają kodów `F01`–`F05` i
`K01`–`K05`.

## 3. Wywiad z właścicielem firmy — 45 minut

### Ostatnie realne zdarzenie, nie opinia ogólna

1. Opowiedz o ostatnim zapytaniu, po którym nie dało się od razu oddzwonić z
   sensowną odpowiedzią.
2. Gdzie wpłynęło i co dokładnie było w nim użyteczne?
3. Jakich informacji brakowało?
4. Kto i w jaki sposób je uzupełniał?
5. Po czym rozpoznaliście, że zapytanie było warte szybkiej reakcji?
6. Co stało się dalej: kontakt, wycena, oferta, wygrana, utrata?

### Segmentacja intencji

7. Kiedy klient zwykle wie dokładnie, czego chce?
8. Kiedy potrzebuje pomocy w wyborze lub określeniu zakresu?
9. Jakie pytania są wtedy wspólne, a jakie zupełnie różne?
10. Kiedy krótki formularz jest lepszy od rozmowy prowadzonej?
11. Który istniejący kanał musi pozostać nawet po wdrożeniu Kwotum?

### Cena i wynik

12. Jaką informację cenową można bezpiecznie pokazać przed rozmową?
13. Jakie wyjątki najczęściej unieważniają orientacyjny wynik?
14. Jaki następny krok firma może rzeczywiście obiecać?
15. Kiedy automatyczny wynik mógłby zaszkodzić?

### Operacje

16. Kto ma otrzymać lead i w jakim kanale?
17. Co musi być widoczne bez logowania do panelu?
18. Jak dziś oznaczacie accepted, quote, won i lost?
19. Jak szybko zauważycie, że nowe rozwiązanie pogarsza sytuację?
20. Jak wyłączycie je bez utraty kontaktów?

## 4. Wywiad z operatorem leadów — 30 minut

Uczestnik porządkuje pięć syntetycznych briefów, zamiast deklarować preferencje.
Obserwujemy:

- które informacje czyta jako pierwsze;
- czego brakuje przed kontaktem;
- czy score jest zrozumiały i czy jego przyczyny pomagają;
- czy proponowany następny krok jest wykonalny;
- które pola są tylko szumem;
- czy można rozpoznać duplikat lub pilność;
- jak operator zapisuje wynik rozmowy.

Na końcu pytamy, jaki minimalny brief pozwoliłby rozpocząć rozmowę bez
powtarzania całego wywiadu.

## 5. Test klienta końcowego — 30 minut

Każdy uczestnik wykonuje dwa zadania w zmienionej kolejności:

### Zadanie A — klient zdecydowany

> Oglądasz konkretny produkt/usługę i chcesz tylko potwierdzić cenę lub
> dostępność oraz poprosić o kontakt.

### Zadanie B — klient potrzebujący pomocy

> Znasz potrzebę i ograniczenia, ale nie wiesz, jaki wariant lub zakres będzie
> właściwy.

Porównujemy quick form oraz guided/visual prototype o tej samej treści. Nie
porównujemy dopracowanego ekranu z celowo gorszą atrapą.

### Obserwacje

- czy uczestnik rozumie, co dostanie na końcu;
- czas do pierwszej odpowiedzi i do ukończenia;
- pytania wymagające zgadywania;
- użycie „nie wiem”;
- błędy, cofnięcia i rezygnacja;
- rozumienie kart, ikon i zdjęć bez podpowiedzi moderatora;
- reakcja na wynik, disclaimer i prośbę o kontakt;
- preferowany fallback: telefon, WhatsApp, formularz.

## 6. Macierz dowodów

Każde ustalenie ma format:

| Pole          | Wymaganie                                                   |
| ------------- | ----------------------------------------------------------- |
| Obserwacja    | co uczestnik zrobił lub powiedział w kontekście zadania     |
| Segment       | firma/operator/klient oraz scenariusz                       |
| Częstotliwość | liczba sesji, bez udawania statystycznej reprezentatywności |
| Ryzyko        | co może się stać po błędnej interpretacji                   |
| Decyzja       | keep/change/test/odrzuć                                     |
| Właściciel    | osoba odpowiedzialna za decyzję                             |
| Dowód         | kod notatki, data i artefakt bez PII                        |

## 7. Kryteria decyzji PX1

- `quick_form` trafia do PX3, jeżeli zdecydowany klient kończy go łatwiej bez
  obniżenia minimalnej kompletności briefu;
- karta lub obraz trafia do PX4 tylko wtedy, gdy poprawia rozpoznanie decyzji,
  a nie wyłącznie ocenę estetyczną;
- prefill trafia do PX5, jeżeli eliminuje powtarzanie znanego kontekstu i firma
  potrafi wskazać zaufane źródło wartości;
- wariant wyniku trafia do PX6 tylko z zaakceptowanym następnym krokiem i
  granicą odpowiedzialności;
- brak rozstrzygnięcia oznacza zachowanie obecnego zachowania, nie improwizację.
