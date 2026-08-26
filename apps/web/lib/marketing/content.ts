export interface FaqItem {
  answer: string;
  question: string;
}

export interface IndustryPage {
  challenge: string;
  description: string;
  eyebrow: string;
  faq: readonly FaqItem[];
  implementation: readonly string[];
  name: string;
  questions: readonly string[];
  result: string;
  sampleBrief: readonly { label: string; value: string }[];
  slug: string;
  title: string;
}

export interface FeaturePage {
  benefits: readonly string[];
  description: string;
  eyebrow: string;
  safeguards: readonly string[];
  slug: string;
  steps: readonly string[];
  title: string;
}

export const industries = [
  {
    challenge:
      "Klient często przesyła inspirację, ale pomija wymiary, pomieszczenie, zakres montażu i realny termin. Jedno zdanie nie wystarcza do zaplanowania pomiaru.",
    description:
      "Formularz wyceny mebli na wymiar, który porządkuje rodzaj zabudowy, wymiary, materiały, wyposażenie i termin przed rozmową.",
    eyebrow: "Meble na wymiar",
    faq: [
      {
        question: "Czy kalkulator zastępuje pomiar?",
        answer:
          "Nie. Wynik jest orientacyjny, a pomiar i konsultacja nadal potwierdzają zakres oraz ostateczną ofertę.",
      },
      {
        question: "Czy klient może dodać inspiracje?",
        answer:
          "Tak. Produkcyjny proces przyjmuje prywatne pliki JPEG, PNG, WebP i PDF zgodnie z limitami firmy.",
      },
      {
        question: "Co, jeśli klient nie zna materiału?",
        answer:
          "Może wybrać odpowiedź „nie wiem”. Proces nadal zbierze pozostałe informacje potrzebne do rozmowy.",
      },
    ],
    implementation: [
      "Dopasuj pytania do typów zabudowy wykonywanych przez pracownię.",
      "Ustal bezpieczne przedziały i zaznacz, co wymaga pomiaru.",
      "Opublikuj wersję i osadź ją na stronie realizacji lub kontaktu.",
    ],
    name: "Meble na wymiar",
    questions: [
      "Rodzaj zabudowy i pomieszczenie",
      "Przybliżone wymiary oraz układ",
      "Preferowany materiał frontów i blatu",
      "Zakres wyposażenia i montażu",
      "Lokalizacja, termin i pliki inspiracji",
    ],
    result:
      "Pracownia otrzymuje brief do oceny, czy potrzebna jest konsultacja, pomiar lub doprecyzowanie materiałów.",
    sampleBrief: [
      { label: "Zakres", value: "Kuchnia w kształcie L, około 4,8 mb" },
      { label: "Materiał", value: "Fronty lakierowane, blat kompaktowy" },
      { label: "Termin", value: "Realizacja w ciągu 3–4 miesięcy" },
    ],
    slug: "meble-na-wymiar",
    title: "Kalkulator wyceny mebli na wymiar, który zaczyna od zakresu",
  },
  {
    challenge:
      "Cena ogrodzenia zależy nie tylko od metrów. Typ przęseł, brama, furtka, podmurówka, teren i montaż zmieniają zakres realizacji.",
    description:
      "Interaktywny formularz dla firm ogrodzeniowych: długość, system, bramy, teren, montaż i termin w jednym uporządkowanym zapytaniu.",
    eyebrow: "Ogrodzenia",
    faq: [
      {
        question: "Czy klient musi znać dokładną długość?",
        answer:
          "Nie. Można dopuścić przedział lub odpowiedź przybliżoną, a dokładny pomiar wykonać później.",
      },
      {
        question: "Czy da się rozdzielić materiał i montaż?",
        answer:
          "Tak. Pytania i reguły mogą rozróżniać dostawę samego systemu od pełnej realizacji.",
      },
      {
        question: "Czy wynik jest wiążącą ofertą?",
        answer: "Nie. To orientacyjny wynik wymagający potwierdzenia warunków terenu i pomiaru.",
      },
    ],
    implementation: [
      "Zdefiniuj obsługiwane systemy, bramy i warianty montażu.",
      "Dodaj pytania o warunki terenu oraz dostęp do posesji.",
      "Połącz formularz z właściwą podstroną oferty lub kampanii.",
    ],
    name: "Ogrodzenia",
    questions: [
      "Łączna długość i wysokość ogrodzenia",
      "System, materiał i kolor",
      "Liczba furtek oraz rodzaj bramy",
      "Podmurówka, demontaż i warunki terenu",
      "Montaż, lokalizacja i oczekiwany termin",
    ],
    result:
      "Firma widzi konfigurację odcinków i elementów dodatkowych przed pierwszym kontaktem, bez traktowania formularza jako pomiaru.",
    sampleBrief: [
      { label: "Zakres", value: "42 mb ogrodzenia panelowego" },
      { label: "Dodatki", value: "Brama przesuwna 4 m i furtka" },
      { label: "Realizacja", value: "Materiał z montażem, teren płaski" },
    ],
    slug: "ogrodzenia",
    title: "Kalkulator ogrodzenia z pytaniami o teren, bramę i montaż",
  },
  {
    challenge:
      "Zapytanie „ile kosztuje strona?” nie mówi, czy chodzi o prosty landing, serwis usługowy, sklep, migrację treści czy integracje.",
    description:
      "Formularz wyceny strony internetowej zbierający typ serwisu, treści, funkcje, integracje, termin i poziom gotowości materiałów.",
    eyebrow: "Strony internetowe",
    faq: [
      {
        question: "Czy formularz nadaje się dla agencji?",
        answer:
          "Tak. Każda organizacja ma własne procesy, wersje i leady, a model agencji można rozbudować o delegację.",
      },
      {
        question: "Czy można pytać o budżet?",
        answer:
          "Tak, jeśli pytanie wyjaśnia cel i oferuje sensowne przedziały oraz możliwość odpowiedzi „nie wiem”.",
      },
      {
        question: "Czy wynik może zależeć od integracji?",
        answer:
          "Tak. Ograniczone reguły pricingu mogą uwzględniać wybrane funkcje bez wykonywania dowolnego kodu.",
      },
    ],
    implementation: [
      "Rozdziel landing, stronę firmową, sklep i nietypową aplikację.",
      "Zdefiniuj funkcje, które realnie zmieniają nakład pracy.",
      "Pokaż wynik jako przedział i wskaż elementy wymagające warsztatu.",
    ],
    name: "Strony internetowe",
    questions: [
      "Cel biznesowy i typ strony",
      "Liczba widoków oraz gotowość treści",
      "Formularze, płatności i integracje",
      "Identyfikacja wizualna i migracja",
      "Budżet, termin i osoba decyzyjna",
    ],
    result:
      "Agencja otrzymuje kontekst do kwalifikacji projektu i może odróżnić gotowe zapytanie od potrzeby warsztatu discovery.",
    sampleBrief: [
      { label: "Cel", value: "Pozyskiwanie zapytań B2B" },
      { label: "Zakres", value: "8 podstron, CMS i formularz kwalifikacyjny" },
      { label: "Materiały", value: "Teksty w przygotowaniu, identyfikacja gotowa" },
    ],
    slug: "strony-internetowe",
    title: "Kalkulator ceny strony internetowej bez zgadywania zakresu",
  },
  {
    challenge:
      "Dobór urządzenia zależy od kubatury, liczby pomieszczeń, ekspozycji, możliwości prowadzenia instalacji i lokalizacji jednostki zewnętrznej.",
    description:
      "Formularz dla instalatora klimatyzacji porządkujący pomieszczenia, metraż, typ budynku, montaż i dostępność techniczną.",
    eyebrow: "Klimatyzacja",
    faq: [
      {
        question: "Czy formularz dobiera moc urządzenia?",
        answer:
          "Może zebrać dane wejściowe, ale dobór powinien potwierdzić instalator po ocenie warunków technicznych.",
      },
      {
        question: "Czy obsługuje układ multisplit?",
        answer:
          "Proces może rozgałęziać pytania zależnie od liczby pomieszczeń i oczekiwanego rozwiązania.",
      },
      {
        question: "Czy można dołączyć zdjęcia?",
        answer:
          "Tak. Zdjęcia miejsca montażu trafiają do prywatnego storage i są widoczne tylko w organizacji.",
      },
    ],
    implementation: [
      "Ustal minimalne dane potrzebne do wstępnego doboru.",
      "Dodaj bezpieczne pytania o prowadzenie instalacji i dostęp.",
      "Zakończ proces jasną informacją o konieczności wizji lokalnej.",
    ],
    name: "Klimatyzacja",
    questions: [
      "Liczba i powierzchnia pomieszczeń",
      "Typ budynku oraz piętro",
      "Ekspozycja i główne źródła ciepła",
      "Miejsce jednostki zewnętrznej",
      "Lokalizacja, termin i zdjęcia",
    ],
    result:
      "Instalator otrzymuje dane do wstępnego kontaktu, a klient wie, które elementy muszą zostać potwierdzone na miejscu.",
    sampleBrief: [
      { label: "Pomieszczenia", value: "Salon 28 m² i sypialnia 14 m²" },
      { label: "Budynek", value: "Mieszkanie, 3. piętro z balkonem" },
      { label: "Termin", value: "Preferowane wykonanie w ciągu miesiąca" },
    ],
    slug: "klimatyzacja",
    title: "Formularz wyceny klimatyzacji przed wizją lokalną",
  },
  {
    challenge:
      "Hasło „remont mieszkania” może oznaczać odświeżenie jednego pokoju albo pełną przebudowę z instalacjami i zmianą układu.",
    description:
      "Formularz wyceny remontu zbierający pomieszczenia, metraż, stan, instalacje, standard, materiały i logistykę.",
    eyebrow: "Remonty",
    faq: [
      {
        question: "Czy kalkulator zastępuje kosztorys?",
        answer:
          "Nie. Porządkuje zakres i może pokazać orientacyjny przedział, ale kosztorys wymaga potwierdzenia ilości i warunków.",
      },
      {
        question: "Jak obsłużyć nieznany stan instalacji?",
        answer:
          "Klient może wskazać brak wiedzy, a lead zostanie oznaczony jako wymagający oględzin.",
      },
      {
        question: "Czy można zapytać o lokal zajęty podczas prac?",
        answer:
          "Tak. Logistyka, piętro, winda i możliwość składowania mogą być osobnymi pytaniami.",
      },
    ],
    implementation: [
      "Podziel zakres na pomieszczenia i główne kategorie prac.",
      "Oddziel stan znany od elementów wymagających odkrywki lub oględzin.",
      "Ustal, kiedy wynik ma być przedziałem, a kiedy konsultacją.",
    ],
    name: "Remonty",
    questions: [
      "Metraż i lista pomieszczeń",
      "Rozbiórki oraz zmiany układu",
      "Instalacje elektryczne i wodne",
      "Standard wykończenia i materiały",
      "Piętro, dostęp, termin i dokumentacja",
    ],
    result:
      "Wykonawca widzi skalę prac i niewiadome, dzięki czemu może przygotować właściwy następny krok zamiast podawać cenę bez danych.",
    sampleBrief: [
      { label: "Zakres", value: "Mieszkanie 54 m², kuchnia i łazienka od podstaw" },
      { label: "Instalacje", value: "Elektryka do weryfikacji, hydraulika do wymiany" },
      { label: "Logistyka", value: "2. piętro, budynek bez windy" },
    ],
    slug: "remonty",
    title: "Formularz wyceny remontu, który rozdziela zakres od niewiadomych",
  },
] as const satisfies readonly IndustryPage[];

export const features = [
  {
    benefits: [
      "Orientacyjny przedział zamiast przypadkowej kwoty",
      "Reguły liczone ponownie po stronie serwera",
      "Jawne tryby: kwota, przedział, „od” lub konsultacja",
    ],
    description:
      "Kalkulator wyceny na stronę oparty na ograniczonych regułach, wersjach procesu i serwerowym potwierdzeniu wyniku.",
    eyebrow: "Pricing",
    safeguards: [
      "Klient nie przesyła ceny ani score.",
      "Kwoty są liczbami całkowitymi w najmniejszej jednostce waluty.",
      "Wynik pozostaje orientacyjny i wskazuje potrzebę potwierdzenia.",
    ],
    slug: "kalkulator-wyceny",
    steps: [
      "Firma definiuje bezpieczny model przedziału.",
      "Odpowiedzi uruchamiają tylko dozwolone reguły.",
      "Serwer odtwarza obliczenie z przypiętej wersji.",
    ],
    title: "Kalkulator wyceny na stronę z serwerową kontrolą wyniku",
  },
  {
    benefits: [
      "Jedno pytanie na raz ogranicza chaos",
      "Warunki pomijają nieistotne kroki",
      "Autosave i wznowienie chronią postęp",
    ],
    description:
      "Formularz wieloetapowy prowadzący klienta od zakresu do kompletnego briefu, z walidacją i zapisem odpowiedzi.",
    eyebrow: "Prowadzony proces",
    safeguards: [
      "Opublikowana wersja jest niezmienna.",
      "Serwer waliduje odpowiedź i następny krok.",
      "Widget działa klawiaturą i respektuje reduced motion.",
    ],
    slug: "formularz-wieloetapowy",
    steps: [
      "Rozpocznij od pytań łatwych do odpowiedzi.",
      "Pokaż pytania techniczne tylko wtedy, gdy są potrzebne.",
      "Podsumuj wynik przed prośbą o kontakt.",
    ],
    title: "Formularz wieloetapowy zamiast ściany pól",
  },
  {
    benefits: [
      "Zakres, budżet, termin i lokalizacja w jednym leadzie",
      "Mniej doprecyzowań przed pierwszą rozmową",
      "Status, notatki i historia w panelu firmy",
    ],
    description:
      "Formularz kwalifikacji klienta, który zbiera dane potrzebne do decyzji o kolejnym kroku i zapisuje uporządkowany lead.",
    eyebrow: "Kwalifikacja",
    safeguards: [
      "Proces wymaga skonfigurowanego kanału kontaktu: e-maila albo telefonu.",
      "Informacja prywatności i marketing są rozdzielone.",
      "Dane i pliki chroni tenantowe RLS.",
    ],
    slug: "kwalifikacja-leadow",
    steps: [
      "Zdefiniuj informacje naprawdę potrzebne do kwalifikacji.",
      "Zbieraj kontakt dopiero po dostarczeniu wartości.",
      "Obsłuż lead w panelu z pełnym kontekstem odpowiedzi.",
    ],
    title: "Kwalifikacja leadów bez zamiany formularza w przesłuchanie",
  },
  {
    benefits: [
      "Deterministyczny wynik 0–100",
      "Kategoria i lista uruchomionych reguł",
      "Spójna ocena niezależna od osoby obsługującej",
    ],
    description:
      "Lead scoring oparty na jawnych, ograniczonych regułach firmy — bez AI jako źródła decyzji i bez ujawniania wyniku klientowi.",
    eyebrow: "Scoring",
    safeguards: [
      "Score jest prywatny i liczony na serwerze.",
      "Każda uruchomiona reguła pozostawia wyjaśnienie.",
      "Scoring wspiera priorytetyzację, ale nie zastępuje oceny człowieka.",
    ],
    slug: "lead-scoring",
    steps: [
      "Ustal kryteria zgodne z rzeczywistym procesem sprzedaży.",
      "Przypisz ograniczone punkty i przetestuj granice.",
      "Przeglądaj score razem z odpowiedziami, nie w izolacji.",
    ],
    title: "Wyjaśnialny lead scoring zamiast czarnej skrzynki",
  },
  {
    benefits: [
      "Inline, popup, fullscreen i osobny hosted link",
      "Shadow DOM izoluje wygląd od CSS strony",
      "Mały, lazy-loaded artefakt bez frameworka runtime",
    ],
    description:
      "Widget na stronę, który korzysta z tego samego opublikowanego procesu i nie ujawnia prywatnych reguł pricingu ani scoringu.",
    eyebrow: "Osadzenie",
    safeguards: [
      "Token sesji nie trafia do URL.",
      "Manifest jest allowlistowaną projekcją opublikowanej wersji.",
      "Podwójny loader nie tworzy drugiej rejestracji komponentu.",
    ],
    slug: "widget-na-strone",
    steps: [
      "Opublikuj wersję procesu.",
      "Wybierz inline, popup, fullscreen albo hosted link.",
      "Wklej loader i element w zatwierdzonym miejscu strony.",
    ],
    title: "Widget formularza wyceny odporny na CSS strony",
  },
] as const satisfies readonly FeaturePage[];

export const indexedRoutes = [
  "/",
  "/produkt",
  "/jak-dziala",
  "/integracje",
  "/cennik",
  "/dla-agencji",
  "/wordpress",
  "/branze",
  ...industries.map((industry) => `/branze/${industry.slug}`),
  "/funkcje",
  ...features.map((feature) => `/funkcje/${feature.slug}`),
] as const;

export function getIndustry(slug: string): IndustryPage | undefined {
  return industries.find((industry) => industry.slug === slug);
}

export function getFeature(slug: string): FeaturePage | undefined {
  return features.find((feature) => feature.slug === slug);
}
