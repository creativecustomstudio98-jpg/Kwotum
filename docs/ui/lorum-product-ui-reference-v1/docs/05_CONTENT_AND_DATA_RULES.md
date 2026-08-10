# 05 — Treści i dane

**Status:** CANONICAL

## 1. Ton aplikacji

- konkretny,
- spokojny,
- neutralny biznesowo,
- pomocny,
- bez marketingowego nadęcia,
- bez żargonu „AI”.

## 2. Nazewnictwo

Używaj stabilnych nazw:

- Proces — konfiguracja pytań, reguł i wyniku,
- Lead — kompletne zgłoszenie klienta,
- Wersja — niezmienny snapshot procesu,
- Draft — edytowalna wersja robocza,
- Opublikowany — wersja dostępna publicznie,
- Wynik kwalifikacji / score — wynik deterministycznych reguł,
- Orientacyjna wycena — niewiążący zakres lub kwota,
- Następny krok — konkretne działanie handlowe.

Nie mieszaj losowo: flow, ankieta, formularz, quiz, brief, proces. W kodzie domenowym mogą istnieć techniczne nazwy, ale UI ma być spójne.

## 3. Dobre komunikaty

- „Nie opublikowano ostatnich zmian.”
- „Ta ścieżka nie prowadzi do żadnego wyniku.”
- „Cena nie będzie widoczna dla klienta.”
- „Lead otrzymał 85 punktów, ponieważ spełnił 4 kryteria.”
- „Brak wystarczających danych dla tego wykresu.”
- „Wyślij testowy lead przed publikacją.”
- „Webhook nie został dostarczony. Ostatnia próba: 14:32.”

## 4. Zakazane sformułowania

- „Zrewolucjonizuj swój biznes”,
- „Magia AI”,
- „Odblokuj potencjał”,
- „Game changer”,
- „Supercharge”,
- „Inteligentny” bez wyjaśnienia działania,
- „Automatycznie” gdy użytkownik nadal musi wykonać ręczną akcję.

## 5. Dane demonstracyjne

- zawsze oznaczone jako „Dane demonstracyjne” lub „Tryb demo”,
- nie mogą mieszać się z danymi organizacji,
- nie służą do wyliczania realnych raportów,
- mogą mieć seed i reset,
- nie wolno przedstawiać ich jako realnych wyników klientów.

## 6. Social proof

Do czasu pozyskania potwierdzonych danych nie dodawaj:

- logotypów firm,
- opinii,
- liczb użytkowników,
- wzrostów konwersji,
- case studies,
- ratingów.

W zamian pokazuj działające demo, metodykę, bezpieczeństwo i rzeczywisty proces.

## 7. Wynik i cena

Każdy wynik cenowy musi wskazywać:

- czy jest kwotą, zakresem, ceną „od” czy rekomendacją,
- walutę,
- datę lub wersję kalkulacji,
- disclaimer,
- następny krok.

Nie używaj słowa „oferta” dla orientacyjnego wyniku, chyba że konfiguracja i warunki prawne rzeczywiście tworzą wiążącą ofertę.

## 8. Score

Score musi być wyjaśnialny:

- wynik,
- kategoria,
- zadziałane reguły,
- dodane/odjęte punkty,
- ewentualna reguła wykluczająca.

Kolor nie może być jedynym nośnikiem kategorii.

## 9. Empty state

Każdy empty state odpowiada:

1. co użytkownik widzi,
2. dlaczego nie ma danych,
3. co może zrobić teraz.

Przykład:

> Nie ma jeszcze leadów z tego procesu. Otwórz link testowy albo osadź widget na stronie, aby sprawdzić pełną ścieżkę.

## 10. Error state

Błąd ma zawierać:

- konkretny problem,
- wpływ na użytkownika,
- bezpieczną akcję,
- retry, jeśli operacja jest idempotentna,
- identyfikator błędu dla wsparcia, jeśli potrzebny.
