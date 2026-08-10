import { upgradeFlowDocument, type FlowDocument, type FlowDocumentV1 } from "./flow.ts";

export type FlowTemplate = Readonly<{
  description: string;
  industry: string;
  name: string;
  priority: boolean;
  slug: string;
  snapshot: FlowDocument;
}>;

type FlowTemplateV1 = Omit<FlowTemplate, "snapshot"> &
  Readonly<{
    snapshot: FlowDocumentV1;
  }>;

const consultationResult = (headline: string): FlowDocumentV1["result"] => ({
  disclaimer:
    "Wynik ma charakter orientacyjny i nie stanowi oferty. Ostateczny zakres wymaga potwierdzenia przez wykonawcę.",
  headline,
  mode: "consultation",
  nextStepLabel: "Przekaż dane do konsultacji",
});

const flowTemplatesV1: readonly FlowTemplateV1[] = [
  {
    description:
      "Kwalifikacja zabudowy kuchennej, szaf i innych mebli z pomiarem, standardem oraz terminem.",
    industry: "Meble na wymiar",
    name: "Meble na wymiar — brief inwestycji",
    priority: true,
    slug: "meble-na-wymiar",
    snapshot: {
      entryStepKey: "rodzaj_zabudowy",
      intro:
        "Odpowiedz na kilka pytań o planowaną zabudowę. Jeśli nie znasz wymiarów, możesz to zaznaczyć.",
      result: consultationResult("Mamy podstawy do przygotowania konsultacji"),
      rules: [
        {
          id: "garderoba_bez_agd",
          then: { action: "go_to", stepKey: "wymiary" },
          when: {
            operator: "equals",
            stepKey: "rodzaj_zabudowy",
            value: "szafa",
          },
        },
      ],
      schemaVersion: 1,
      steps: [
        {
          allowUnknown: false,
          key: "rodzaj_zabudowy",
          nextStepKey: "stan_projektu",
          options: [
            { key: "kuchnia", label: "Kuchnia" },
            { key: "szafa", label: "Szafa lub garderoba" },
            { key: "inne", label: "Inna zabudowa" },
          ],
          required: true,
          title: "Jakiej zabudowy potrzebujesz?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "stan_projektu",
          nextStepKey: "wymiary",
          options: [
            { key: "pomysl", label: "Mam pomysł i inspiracje" },
            { key: "projekt", label: "Mam gotowy projekt" },
            { key: "wymiana", label: "Wymieniam istniejącą zabudowę" },
          ],
          required: true,
          title: "Na jakim etapie jest inwestycja?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          description: "Wystarczy przybliżona szerokość zabudowy w centymetrach.",
          key: "wymiary",
          nextStepKey: "standard",
          options: [],
          required: false,
          title: "Jaka jest przybliżona długość zabudowy?",
          type: "number",
        },
        {
          allowUnknown: false,
          key: "standard",
          nextStepKey: "sprzety",
          options: [
            { key: "praktyczny", label: "Praktyczny i ekonomiczny" },
            { key: "sredni", label: "Podwyższony standard" },
            { key: "premium", label: "Materiały premium" },
          ],
          required: true,
          title: "Jakiego standardu oczekujesz?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "sprzety",
          nextStepKey: "budzet",
          options: [
            { key: "tak", label: "Tak, dobór i montaż AGD" },
            { key: "nie", label: "Nie, sprzęty są po mojej stronie" },
          ],
          required: false,
          title: "Czy zakres obejmuje sprzęty lub wyposażenie?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "budzet",
          nextStepKey: "termin",
          options: [],
          required: false,
          title: "Jaki przedział budżetu planujesz?",
          type: "budget",
        },
        {
          allowUnknown: true,
          key: "termin",
          nextStepKey: "lokalizacja",
          options: [],
          required: false,
          title: "Kiedy zabudowa ma być gotowa?",
          type: "date",
        },
        {
          allowUnknown: false,
          key: "lokalizacja",
          nextStepKey: null,
          options: [],
          required: true,
          title: "Gdzie będzie realizowana inwestycja?",
          type: "location",
        },
      ],
      title: "Meble na wymiar",
    },
  },
  {
    description:
      "Brief ogrodzenia z typem, długością, bramą, warunkami działki, budżetem i terminem.",
    industry: "Ogrodzenia",
    name: "Ogrodzenie — zakres i warunki działki",
    priority: true,
    slug: "ogrodzenia",
    snapshot: {
      entryStepKey: "typ_ogrodzenia",
      intro:
        "Zbierzemy rodzaj ogrodzenia, przybliżone wymiary i elementy dodatkowe potrzebne do rozmowy.",
      result: consultationResult("Zakres ogrodzenia jest gotowy do weryfikacji"),
      rules: [],
      schemaVersion: 1,
      steps: [
        {
          allowUnknown: false,
          key: "typ_ogrodzenia",
          nextStepKey: "dlugosc",
          options: [
            { key: "panelowe", label: "Panelowe" },
            { key: "palisadowe", label: "Palisadowe" },
            { key: "murowane", label: "Murowane lub mieszane" },
            { key: "nie_wiem", label: "Potrzebuję rekomendacji" },
          ],
          required: true,
          title: "Jakiego ogrodzenia szukasz?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          description: "Podaj orientacyjną liczbę metrów bieżących.",
          key: "dlugosc",
          nextStepKey: "brama",
          options: [],
          required: false,
          title: "Jaka jest przybliżona długość ogrodzenia?",
          type: "number",
        },
        {
          allowUnknown: false,
          key: "brama",
          nextStepKey: "furtka",
          options: [
            { key: "przesuwna", label: "Brama przesuwna" },
            { key: "skrzydlowa", label: "Brama skrzydłowa" },
            { key: "bez_bramy", label: "Bez bramy" },
          ],
          required: true,
          title: "Jakiej bramy potrzebujesz?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "furtka",
          nextStepKey: "podmurujowka",
          options: [
            { key: "tak", label: "Tak" },
            { key: "nie", label: "Nie" },
          ],
          required: true,
          title: "Czy zakres obejmuje furtkę?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "podmurujowka",
          nextStepKey: "teren",
          options: [
            { key: "tak", label: "Tak" },
            { key: "nie", label: "Nie" },
            { key: "do_oceny", label: "Do oceny wykonawcy" },
          ],
          required: false,
          title: "Czy potrzebna jest podmurówka?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "teren",
          nextStepKey: "budzet",
          options: [
            { key: "plaski", label: "Teren płaski" },
            { key: "spadek", label: "Teren ze spadkiem" },
            { key: "nie_wiem", label: "Nie wiem" },
          ],
          required: false,
          title: "Jakie są warunki na działce?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "budzet",
          nextStepKey: "lokalizacja",
          options: [],
          required: false,
          title: "Jaki budżet przeznaczasz na realizację?",
          type: "budget",
        },
        {
          allowUnknown: false,
          key: "lokalizacja",
          nextStepKey: null,
          options: [],
          required: true,
          title: "Gdzie znajduje się działka?",
          type: "location",
        },
      ],
      title: "Ogrodzenie",
    },
  },
  {
    description:
      "Kwalifikacja nowej strony lub redesignu: cel, zakres, treści, integracje, budżet i termin.",
    industry: "Strony internetowe",
    name: "Strona internetowa — brief projektu",
    priority: true,
    slug: "strony-internetowe",
    snapshot: {
      entryStepKey: "rodzaj_projektu",
      intro:
        "Określ cel i zakres strony. Nie musisz znać technologii ani przygotowywać kompletnej specyfikacji.",
      result: consultationResult("Brief strony jest gotowy do omówienia"),
      rules: [
        {
          id: "sklep_wymaga_integracji",
          then: { action: "go_to", stepKey: "integracje" },
          when: {
            operator: "equals",
            stepKey: "rodzaj_projektu",
            value: "sklep",
          },
        },
      ],
      schemaVersion: 1,
      steps: [
        {
          allowUnknown: false,
          key: "rodzaj_projektu",
          nextStepKey: "cel",
          options: [
            { key: "nowa", label: "Nowa strona firmowa" },
            { key: "redesign", label: "Przebudowa istniejącej strony" },
            { key: "sklep", label: "Sklep internetowy" },
            { key: "landing", label: "Landing page kampanii" },
          ],
          required: true,
          title: "Jakiego projektu potrzebujesz?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "cel",
          nextStepKey: "zakres",
          options: [
            { key: "leady", label: "Pozyskiwanie zapytań" },
            { key: "sprzedaz", label: "Sprzedaż online" },
            { key: "wizerunek", label: "Wiarygodność i prezentacja oferty" },
            { key: "rekrutacja", label: "Rekrutacja" },
          ],
          required: true,
          title: "Jaki jest najważniejszy cel strony?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "zakres",
          nextStepKey: "tresci",
          options: [
            { key: "do_5", label: "Do 5 podstron" },
            { key: "do_15", label: "6–15 podstron" },
            { key: "powyzej_15", label: "Więcej niż 15" },
            { key: "nie_wiem", label: "Potrzebuję pomocy w określeniu" },
          ],
          required: false,
          title: "Jak duży będzie serwis?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "tresci",
          nextStepKey: "integracje",
          options: [
            { key: "gotowe", label: "Mam teksty i materiały" },
            { key: "czesciowe", label: "Mam część materiałów" },
            { key: "od_zera", label: "Potrzebuję wsparcia od zera" },
          ],
          required: true,
          title: "Czy treści i zdjęcia są gotowe?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "integracje",
          nextStepKey: "budzet",
          options: [
            { key: "formularze", label: "Formularze i automatyzacje" },
            { key: "platnosci", label: "Płatności online" },
            { key: "crm", label: "CRM lub system zewnętrzny" },
            { key: "brak", label: "Brak lub jeszcze nie wiem" },
          ],
          required: false,
          title: "Jakich integracji potrzebujesz?",
          type: "multiple_choice",
        },
        {
          allowUnknown: true,
          key: "budzet",
          nextStepKey: "termin",
          options: [],
          required: false,
          title: "Jaki budżet planujesz?",
          type: "budget",
        },
        {
          allowUnknown: true,
          key: "termin",
          nextStepKey: "opis",
          options: [],
          required: false,
          title: "Kiedy strona powinna być gotowa?",
          type: "date",
        },
        {
          allowUnknown: false,
          description: "Dodaj najważniejszy kontekst lub adres obecnej strony.",
          key: "opis",
          nextStepKey: null,
          options: [],
          required: false,
          title: "Co jeszcze powinniśmy wiedzieć?",
          type: "long_text",
        },
      ],
      title: "Strona internetowa",
    },
  },
  {
    description:
      "Podstawowy brief montażu klimatyzacji z liczbą pomieszczeń, powierzchnią i lokalizacją.",
    industry: "Klimatyzacja",
    name: "Klimatyzacja — wstępny dobór",
    priority: false,
    slug: "klimatyzacja",
    snapshot: {
      entryStepKey: "obiekt",
      intro: "Podaj podstawowe informacje potrzebne do wstępnego doboru i umówienia oględzin.",
      result: consultationResult("Instalacja wymaga krótkiej konsultacji"),
      rules: [],
      schemaVersion: 1,
      steps: [
        {
          allowUnknown: false,
          key: "obiekt",
          nextStepKey: "pomieszczenia",
          options: [
            { key: "mieszkanie", label: "Mieszkanie" },
            { key: "dom", label: "Dom" },
            { key: "firma", label: "Biuro lub lokal" },
          ],
          required: true,
          title: "Gdzie ma działać klimatyzacja?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "pomieszczenia",
          nextStepKey: "powierzchnia",
          options: [],
          required: true,
          title: "Ile pomieszczeń ma być chłodzonych?",
          type: "number",
        },
        {
          allowUnknown: true,
          key: "powierzchnia",
          nextStepKey: "termin",
          options: [],
          required: false,
          title: "Jaka jest łączna powierzchnia pomieszczeń?",
          type: "number",
        },
        {
          allowUnknown: true,
          key: "termin",
          nextStepKey: "lokalizacja",
          options: [],
          required: false,
          title: "Kiedy planujesz montaż?",
          type: "date",
        },
        {
          allowUnknown: false,
          key: "lokalizacja",
          nextStepKey: null,
          options: [],
          required: true,
          title: "Gdzie znajduje się obiekt?",
          type: "location",
        },
      ],
      title: "Klimatyzacja",
    },
  },
  {
    description:
      "Podstawowy brief remontu z typem nieruchomości, zakresem, metrażem, stanem i terminem.",
    industry: "Remonty",
    name: "Remont — zakres prac",
    priority: false,
    slug: "remonty",
    snapshot: {
      entryStepKey: "obiekt",
      intro: "Opisz planowany remont na poziomie wystarczającym do pierwszej rozmowy z wykonawcą.",
      result: consultationResult("Zakres remontu jest gotowy do konsultacji"),
      rules: [],
      schemaVersion: 1,
      steps: [
        {
          allowUnknown: false,
          key: "obiekt",
          nextStepKey: "zakres",
          options: [
            { key: "mieszkanie", label: "Mieszkanie" },
            { key: "dom", label: "Dom" },
            { key: "lokal", label: "Lokal użytkowy" },
          ],
          required: true,
          title: "Jakiego obiektu dotyczy remont?",
          type: "single_choice",
        },
        {
          allowUnknown: false,
          key: "zakres",
          nextStepKey: "metraz",
          options: [
            { key: "generalny", label: "Remont generalny" },
            { key: "wybrane", label: "Wybrane pomieszczenia" },
            { key: "wykonczenie", label: "Wykończenie od stanu deweloperskiego" },
          ],
          required: true,
          title: "Jaki jest zakres prac?",
          type: "single_choice",
        },
        {
          allowUnknown: true,
          key: "metraz",
          nextStepKey: "stan",
          options: [],
          required: false,
          title: "Jaki jest przybliżony metraż?",
          type: "number",
        },
        {
          allowUnknown: true,
          key: "stan",
          nextStepKey: "lokalizacja",
          options: [],
          required: false,
          title: "Opisz obecny stan i najważniejsze prace",
          type: "long_text",
        },
        {
          allowUnknown: false,
          key: "lokalizacja",
          nextStepKey: null,
          options: [],
          required: true,
          title: "Gdzie znajduje się nieruchomość?",
          type: "location",
        },
      ],
      title: "Remont",
    },
  },
] as const;

export const flowTemplates: readonly FlowTemplate[] = flowTemplatesV1.map((template) => ({
  ...template,
  snapshot: upgradeFlowDocument(template.snapshot),
}));
