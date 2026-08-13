import { hasCapability, type Capability, type TenantContext } from "@wyceno/database";

import type { PanelIconName } from "../../panel-icon";

export type HelpCategoryId =
  "start" | "leads" | "processes" | "data" | "integrations" | "administration" | "support";

export type HelpGuide = Readonly<{
  category: HelpCategoryId;
  href: string;
  hrefLabel: string;
  id: string;
  keywords: ReadonlyArray<string>;
  note?: string;
  requiredCapability?: Capability;
  steps: ReadonlyArray<string>;
  summary: string;
  title: string;
}>;

export const HELP_CATEGORIES: ReadonlyArray<
  Readonly<{ description: string; icon: PanelIconName; id: HelpCategoryId; label: string }>
> = [
  {
    description: "Orientacja w panelu i pierwszy poprawnie skonfigurowany obszar pracy.",
    icon: "dashboard",
    id: "start",
    label: "Pierwsze kroki",
  },
  {
    description: "Ocena, kontakt i uporządkowana obsługa otrzymanych zapytań.",
    icon: "leads",
    id: "leads",
    label: "Leady i obsługa",
  },
  {
    description: "Budowa formularza, reguły wyceny, publikacja i udostępnianie.",
    icon: "processes",
    id: "processes",
    label: "Procesy i formularze",
  },
  {
    description: "Interpretacja wyników i kontrola wiadomości transakcyjnych.",
    icon: "analytics",
    id: "data",
    label: "Dane i powiadomienia",
  },
  {
    description: "WordPress i bezpieczne przekazywanie leadów przez webhooki.",
    icon: "integration",
    id: "integrations",
    label: "Integracje",
  },
  {
    description: "Ustawienia organizacji, dostęp i zasady przechowywania danych.",
    icon: "settings",
    id: "administration",
    label: "Administracja",
  },
  {
    description: "Odpowiedzi na najczęstsze problemy i bezpieczna diagnostyka.",
    icon: "help",
    id: "support",
    label: "Rozwiązywanie problemów",
  },
];

export function createHelpGuides(organizationId: string): ReadonlyArray<HelpGuide> {
  const root = `/panel/${organizationId}`;

  return [
    {
      category: "start",
      href: `${root}/start`,
      hrefLabel: "Otwórz konfigurację startową",
      id: "first-launch",
      keywords: ["start", "wdrożenie", "konfiguracja", "pierwszy proces"],
      requiredCapability: "flow:read",
      steps: [
        "Uzupełnij dane organizacji, aby nazwa firmy była spójna w panelu i wiadomościach systemowych.",
        "Wybierz szablon najbliższy usłudze, którą sprzedajesz. Szablon jest punktem startowym i można go później zmienić.",
        "Przejrzyj pytania, reguły i ekran wyniku przed publikacją. Klient zobaczy dopiero opublikowaną wersję.",
        "Otwórz instalację procesu i wybierz sposób udostępnienia odpowiedni dla swojej strony.",
      ],
      summary: "Od pustego konta do pierwszego procesu gotowego do sprawdzenia.",
      title: "Pierwsze uruchomienie Kwotum",
    },
    {
      category: "start",
      href: "/panel",
      hrefLabel: "Zmień organizację",
      id: "navigation-organizations",
      keywords: ["menu", "sidebar", "nawigacja", "organizacja", "konto", "przełączanie"],
      steps: [
        "Nazwa nad menu wskazuje organizację, w której aktualnie pracujesz. Jej dane nigdy nie łączą się z inną organizacją.",
        "Kliknij nazwę organizacji albo profil na dole paska bocznego, aby wrócić do ekranu wyboru obszaru pracy.",
        "Pozycje menu zależą od roli. Brak modułu zwykle oznacza, że Twoje konto nie ma uprawnienia do jego obsługi.",
        "Na telefonie podstawowe moduły są na dolnym pasku, a pozostałe pod przyciskiem „Więcej”.",
      ],
      summary: "Jak rozpoznać bieżący obszar pracy, przełączyć firmę i korzystać z menu.",
      title: "Nawigacja i wybór organizacji",
    },
    {
      category: "start",
      href: root,
      hrefLabel: "Przejdź do przeglądu",
      id: "overview",
      keywords: ["dashboard", "przegląd", "start", "wskaźniki", "karty", "wykresy"],
      steps: [
        "Ustaw zakres dat w prawym górnym rogu. Wszystkie wskaźniki i wykresy na ekranie odnoszą się do tego samego okresu.",
        "Zacznij od leadów wymagających reakcji, a następnie sprawdź aktywne procesy i ostatnie powiadomienia.",
        "Znak „—” oznacza brak wystarczających danych do obliczenia wyniku, a nie wartość równą zero.",
        "Komunikat o małej próbie chroni przed wyciąganiem wniosków z przypadkowych pojedynczych sesji.",
      ],
      summary: "Najważniejsze wskaźniki organizacji i właściwa interpretacja pustych danych.",
      title: "Przegląd organizacji",
    },
    {
      category: "leads",
      href: `${root}/leady`,
      hrefLabel: "Otwórz listę leadów",
      id: "lead-list",
      keywords: ["lead", "lista", "status", "priorytet", "filtr", "wyszukiwarka", "klient"],
      requiredCapability: "lead:read",
      steps: [
        "Użyj wyszukiwarki, aby znaleźć klienta po nazwie, e-mailu, telefonie albo procesie.",
        "Filtruj po statusie, gdy chcesz oddzielić nowe zapytania od spraw prowadzonych i zakończonych.",
        "Priorytet pomaga ustalić kolejność pracy zespołu, ale nie zastępuje oceny treści odpowiedzi.",
        "Otwórz wiersz leada, aby zobaczyć odpowiedzi, wynik, zgodę, pliki i historię obsługi.",
      ],
      summary: "Wyszukiwanie, filtrowanie i wybór zapytań do dalszej obsługi.",
      title: "Lista leadów i priorytety pracy",
    },
    {
      category: "leads",
      href: `${root}/leady`,
      hrefLabel: "Wybierz leada do obsługi",
      id: "lead-detail",
      keywords: ["lead", "szczegóły", "kontakt", "zadanie", "notatka", "status", "przypisanie"],
      requiredCapability: "lead:operate",
      steps: [
        "Najpierw przeczytaj podsumowanie oraz odpowiedzi klienta. Wynik i score są wskazówką, nie ostateczną ofertą.",
        "Ustaw status i priorytet zgodnie z rzeczywistym etapem rozmowy, aby zespół widział aktualny stan.",
        "Dodaj notatkę, gdy informacja ma pozostać w historii leada. Nie umieszczaj w niej sekretów ani danych zbędnych do obsługi.",
        "Użyj „Zaplanuj kontakt” dla rozmowy z klientem, a „Utwórz zadanie” dla wewnętrznego działania. Po wykonaniu zamknij pozycję na liście.",
      ],
      note: "Kwotum nie synchronizuje obecnie zadań z zewnętrznym kalendarzem. Termin jest widoczny w panelu leada.",
      summary: "Odpowiedzi klienta, status, notatki, kontakt i zadania w jednym miejscu.",
      title: "Szczegóły i obsługa leada",
    },
    {
      category: "leads",
      href: `${root}/leady`,
      hrefLabel: "Przejdź do leadów",
      id: "lead-score-estimate",
      keywords: ["score", "wycena", "wynik", "cena", "estymacja", "kwalifikacja"],
      requiredCapability: "lead:read",
      steps: [
        "Wycena jest niewiążącym wynikiem reguł ustawionych w opublikowanej wersji procesu.",
        "Score porządkuje leady według przyjętych kryteriów jakościowych; nie jest automatyczną decyzją o przyjęciu klienta.",
        "Brak wyceny może oznaczać, że proces nie ma aktywnych reguł cenowych albo odpowiedzi nie uruchomiły żadnej reguły.",
        "Przed przekazaniem ceny klientowi zweryfikuj zakres, materiały, termin i warunki realizacji.",
      ],
      summary: "Co oznaczają niewiążąca wycena i score oraz kiedy wymagają ręcznej weryfikacji.",
      title: "Jak czytać wycenę i score",
    },
    {
      category: "processes",
      href: `${root}/szablony`,
      hrefLabel: "Przejrzyj szablony",
      id: "templates",
      keywords: ["szablon", "branża", "gotowy proces", "formularz"],
      requiredCapability: "flow:read",
      steps: [
        "Wyszukaj usługę albo zawęź bibliotekę kategorią i poziomem złożoności.",
        "Otwórz podgląd, aby sprawdzić pytania i przebieg bez tworzenia procesu.",
        "Wybierz „Użyj szablonu”, gdy jego struktura odpowiada Twojej usłudze. Powstanie edytowalna kopia w organizacji.",
        "Przed publikacją usuń zbędne pytania i dopasuj treść, reguły oraz wynik do realnej oferty firmy.",
      ],
      summary: "Wybór bezpiecznego punktu startowego bez kopiowania zbędnych elementów.",
      title: "Szablony branżowe",
    },
    {
      category: "processes",
      href: `${root}/procesy`,
      hrefLabel: "Otwórz procesy",
      id: "process-builder",
      keywords: ["proces", "builder", "edytor", "pytanie", "sekcja", "autosave", "wersja"],
      requiredCapability: "flow:write",
      steps: [
        "Nadaj procesowi nazwę rozpoznawalną dla zespołu, a następnie uporządkuj sekcje zgodnie z kolejnością rozmowy z klientem.",
        "Pytaj tylko o informacje potrzebne do kwalifikacji lub wyceny. Oznacz jako wymagane wyłącznie dane konieczne.",
        "Korzystaj z cofania i ponawiania podczas edycji. Stan roboczy zapisuje się automatycznie, ale publikacja jest oddzielną decyzją.",
        "Sprawdź komunikaty walidacji przed publikacją; prowadzą do brakujących lub sprzecznych ustawień.",
      ],
      summary: "Sekcje, pytania, walidacja, zapis roboczy i bezpieczna praca nad wersją procesu.",
      title: "Budowanie procesu krok po kroku",
    },
    {
      category: "processes",
      href: `${root}/procesy`,
      hrefLabel: "Wybierz proces do edycji",
      id: "pricing-scoring-result",
      keywords: ["reguły", "wycena", "scoring", "score", "wynik", "widełki", "cena"],
      requiredCapability: "flow:write",
      steps: [
        "Reguły wyceny powinny odzwierciedlać realne składniki kosztu, a nie przypadkowe odpowiedzi klienta.",
        "Nadaj punkty tylko odpowiedziom, które faktycznie wpływają na jakość lub gotowość leada.",
        "Ustaw ekran wyniku tak, aby jasno komunikował niewiążący charakter estymacji i następny krok.",
        "Przetestuj wariant minimalny, typowy i skrajny. Zwróć uwagę na nakładające się reguły oraz brak wyniku.",
      ],
      summary: "Jak połączyć odpowiedzi z ceną, kwalifikacją i komunikatem końcowym.",
      title: "Wycena, scoring i ekran wyniku",
    },
    {
      category: "processes",
      href: `${root}/procesy`,
      hrefLabel: "Wybierz proces do publikacji",
      id: "publish-share",
      keywords: [
        "publikacja",
        "instalacja",
        "link",
        "embed",
        "inline",
        "popup",
        "pełny ekran",
        "zaproszenie",
      ],
      requiredCapability: "flow:share",
      steps: [
        "Opublikuj dopiero wersję, która przeszła podgląd i nie ma błędów walidacji. Klienci nie widzą zmian zapisanych wyłącznie w szkicu.",
        "W zakładce instalacji wybierz link hostowany, osadzenie w treści, popup albo pełny ekran zgodnie z konstrukcją strony.",
        "Dla osadzenia sprawdź dozwoloną domenę i wykonaj próbę na stronie testowej przed zmianą produkcyjną.",
        "Zaproszenia do wdrożenia wysyłaj tylko osobom, które rzeczywiście odpowiadają za stronę organizacji.",
      ],
      summary: "Publikacja wersji i dobór sposobu udostępnienia formularza na stronie.",
      title: "Publikacja, podgląd i instalacja",
    },
    {
      category: "data",
      href: `${root}/analityka`,
      hrefLabel: "Otwórz analitykę",
      id: "analytics",
      keywords: ["analityka", "raport", "konwersja", "sesje", "źródło", "trend", "zgoda"],
      requiredCapability: "analytics:summary",
      steps: [
        "Ustaw okres porównywalny z tempem sprzedaży. Krótkie zakresy przy małym ruchu mogą nie mieć wystarczającej próby.",
        "Porównuj liczbę sesji, utworzonych leadów i dalszą obsługę — pojedynczy wskaźnik nie opisuje całej ścieżki.",
        "Dane źródłowe są pokazywane tylko wtedy, gdy próba pozwala bezpiecznie zaprezentować przekrój.",
        "Zmianę trendu interpretuj razem ze zmianami procesu, kampanii i sezonowością.",
      ],
      summary: "Czytanie konwersji i trendów bez nadinterpretowania zbyt małej próby.",
      title: "Analityka i jakość próby",
    },
    {
      category: "data",
      href: `${root}/powiadomienia`,
      hrefLabel: "Sprawdź powiadomienia",
      id: "notifications",
      keywords: ["powiadomienia", "email", "dostawa", "kolejka", "błąd", "alert"],
      steps: [
        "Reguły pokazują, jakie wiadomości system wysyła po bezpiecznym zapisaniu leada.",
        "W historii sprawdź zamaskowanego odbiorcę, status, liczbę prób i czas zdarzenia.",
        "Pozycja w kolejce może zostać ponowiona automatycznie; trwały błąd wymaga sprawdzenia konfiguracji adresu lub dostawcy poczty.",
        "Maskowanie adresów ogranicza ujawnianie danych osobowych w widoku operacyjnym.",
      ],
      summary: "Kontrola wiadomości dla firmy i klienta bez ujawniania pełnych danych odbiorców.",
      title: "Powiadomienia i historia dostaw",
    },
    {
      category: "integrations",
      href: `${root}/integracje/wordpress`,
      hrefLabel: "Otwórz integrację WordPress",
      id: "wordpress",
      keywords: ["wordpress", "wtyczka", "token", "połączenie", "domena", "instalacja"],
      requiredCapability: "wordpress:manage",
      steps: [
        "Wygeneruj token dopiero bezpośrednio przed konfiguracją wtyczki i skopiuj go do bezpiecznego miejsca.",
        "Wprowadź token w oficjalnej wtyczce Kwotum oraz wybierz właściwy proces i sposób wyświetlania.",
        "Po zapisaniu sprawdź listę połączeń i wykonaj test formularza na stronie.",
        "Unieważnij połączenie, którego domeny nie rozpoznajesz albo które nie jest już używane.",
      ],
      note: "Token jest sekretem. Nie przesyłaj go w zwykłej wiadomości i nie zapisuj w publicznym repozytorium.",
      summary: "Bezpieczne połączenie wtyczki, kontrola domeny i unieważnianie dostępu.",
      title: "WordPress",
    },
    {
      category: "integrations",
      href: `${root}/integracje/webhooki`,
      hrefLabel: "Otwórz webhooki",
      id: "webhooks",
      keywords: ["webhook", "endpoint", "hmac", "podpis", "http", "dostawa", "api"],
      requiredCapability: "webhook:manage",
      steps: [
        "Dodaj publiczny adres HTTPS odbiorcy. Endpoint nie może wymagać danych logowania w adresie ani przekierowań.",
        "Zapisz sekret HMAC przy tworzeniu połączenia i weryfikuj podpis każdego żądania po stronie odbiorcy.",
        "Wyślij test syntetyczny, a następnie sprawdź kod HTTP i czas odpowiedzi w historii dostaw.",
        "Wyłącz endpoint przed pracami serwisowymi. Po zmianie sekretu zaktualizuj odbiorcę, zanim ponownie włączysz dostawy.",
      ],
      note: "Historia techniczna nie przechowuje payloadu, response body ani danych osobowych leada.",
      summary: "Endpoint, podpis HMAC, test połączenia i diagnostyka dostaw w czasie rzeczywistym.",
      title: "Webhooki",
    },
    {
      category: "administration",
      href: `${root}/ustawienia`,
      hrefLabel: "Otwórz ustawienia",
      id: "organization-settings",
      keywords: ["ustawienia", "organizacja", "firma", "nazwa", "email", "dostawa leadów"],
      requiredCapability: "privacy:manage",
      steps: [
        "Sprawdź nazwę organizacji, bo jest używana w panelu i tenantowych wiadomościach systemowych.",
        "Ustaw firmowy adres dostawy leadów, który jest kontrolowany przez organizację, a nie pojedynczego pracownika.",
        "Po zmianie adresu sprawdź kolejną dostawę w Powiadomieniach.",
        "Identyfikator tenanta służy do diagnostyki; sam nie daje dostępu do danych organizacji.",
      ],
      summary: "Dane firmy i firmowy adres dostawy nowych zapytań.",
      title: "Ustawienia organizacji",
    },
    {
      category: "administration",
      href: `${root}/prywatnosc`,
      hrefLabel: "Otwórz dane i prywatność",
      id: "privacy-retention",
      keywords: ["prywatność", "retencja", "dane", "zgoda", "usuwanie", "rodo", "bezpieczeństwo"],
      requiredCapability: "privacy:manage",
      steps: [
        "Przejrzyj okresy przechowywania danych i ustaw je zgodnie z rzeczywistym celem przetwarzania organizacji.",
        "Nie wydłużaj retencji na zapas. Krótszy, uzasadniony okres ogranicza ryzyko i zakres danych.",
        "Przed usunięciem danych sprawdź wpływ na historię obsługi i wymagane obowiązki prawne organizacji.",
        "Zmiany prywatności wykonuje właściciel; ukrycie tej sekcji dla innych ról jest kontrolą dostępu, nie tylko elementem interfejsu.",
      ],
      summary: "Retencja i odpowiedzialne ograniczanie zakresu przechowywanych danych.",
      title: "Dane i prywatność",
    },
    {
      category: "administration",
      href: "/panel",
      hrefLabel: "Przejdź do wyboru organizacji",
      id: "roles-access",
      keywords: ["rola", "owner", "admin", "sprzedaż", "uprawnienia", "dostęp"],
      steps: [
        "Właściciel zarządza organizacją, prywatnością i wszystkimi modułami operacyjnymi.",
        "Administrator obsługuje procesy, leady, analitykę oraz integracje, ale nie zmienia właścicielskich ustawień prywatności.",
        "Rola Sprzedaż skupia się na leadach i podsumowaniu analitycznym; nie widzi konfiguracji procesów ani integracji.",
        "Jeżeli potrzebujesz dodatkowej funkcji, poproś właściciela organizacji o weryfikację roli — nie zakładaj drugiego konta.",
      ],
      summary: "Dlaczego poszczególne osoby widzą inny zakres panelu.",
      title: "Role i zakres dostępu",
    },
    {
      category: "support",
      href: root,
      hrefLabel: "Wróć do przeglądu",
      id: "troubleshooting",
      keywords: ["problem", "błąd", "nie działa", "diagnostyka", "pomoc", "odśwież", "zgłoszenie"],
      steps: [
        "Odśwież stronę raz i sprawdź, czy problem występuje ponownie w tej samej organizacji oraz na tym samym ekranie.",
        "Przeczytaj komunikat błędu i nie ponawiaj wielokrotnie operacji zapisującej, jeśli jej wynik jest niejasny.",
        "Zanotuj godzinę, adres ekranu, wykonane kroki i widoczny komunikat. Nie dołączaj tokenów, sekretów ani pełnych danych klienta.",
        "Przekaż te informacje właścicielowi organizacji lub osobie odpowiedzialnej za wsparcie techniczne.",
      ],
      summary: "Krótka procedura, która pozwala bezpiecznie odtworzyć i zgłosić problem.",
      title: "Gdy coś nie działa",
    },
    {
      category: "support",
      href: root,
      hrefLabel: "Wróć do przeglądu",
      id: "security-basics",
      keywords: ["bezpieczeństwo", "hasło", "token", "sekret", "dane klienta", "konto"],
      steps: [
        "Nie udostępniaj hasła, tokenu WordPress ani sekretu HMAC. Osoba wspierająca nie powinna prosić o ich treść.",
        "Przed eksportem lub zrzutem ekranu zamaskuj dane klienta, adresy i identyfikatory techniczne.",
        "Zawsze sprawdzaj nazwę organizacji przed zmianą procesu, integracji lub danych leada.",
        "Po zakończeniu współpracy usuń zbędny dostęp i unieważnij nieużywane połączenia integracyjne.",
      ],
      summary: "Najważniejsze zasady ochrony konta, sekretów integracji i danych klientów.",
      title: "Bezpieczna praca w panelu",
    },
  ];
}

export function getAccessibleHelpGuides(
  context: TenantContext,
  organizationId: string,
): ReadonlyArray<HelpGuide> {
  return createHelpGuides(organizationId).filter(
    (guide) => !guide.requiredCapability || hasCapability(context, guide.requiredCapability),
  );
}

export function filterHelpGuides(
  guides: ReadonlyArray<HelpGuide>,
  query: string,
): ReadonlyArray<HelpGuide> {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return guides;

  return guides.filter((guide) =>
    normalizeSearchValue(
      [guide.title, guide.summary, guide.note, ...guide.keywords, ...guide.steps]
        .filter(Boolean)
        .join(" "),
    ).includes(normalizedQuery),
  );
}

function normalizeSearchValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
