# Dostępność

Cel: WCAG 2.2 AA.

## Wymagania

- semantyczny HTML, skip link, logiczne nagłówki i kolejność fokusu;
- pełna obsługa klawiaturą; alternatywa dla drag-and-drop;
- wyraźny fokus, focus trap/return w dialogu;
- programatyczne label, hint i error; statusy dynamiczne przez właściwy live region;
- brak informacji wyłącznie kolorem;
- kontrast tekstu i kontrolek sprawdzany automatycznie i wizualnie;
- cele minimum 24×24, główne 40–44 px;
- reduced motion i brak automatycznego przesuwania bez kontroli;
- dostępne błędy kroków oraz summary po submit;
- formularz kontaktowy ma jawne etykiety, natywne typy pól, wymagane
  potwierdzenie w labelu i status wysyłania przez `aria-live`;
- lista plików i potwierdzenie wysłania pozostają tekstowe i dostępne bez
  zależności od koloru;
- widget zachowuje semantykę niezależnie od hosta.

## Testy

Lint a11y, Testing Library + axe, ręczna klawiatura, VoiceOver/NVDA na ścieżkach krytycznych, zoom 200/400%, mobile i high contrast. Automaty nie zastępują testu czytnikiem.

Wiadomości transakcyjne mają pełny wariant tekstowy, `lang="pl"`, tytuł,
semantyczny `main`, logiczny `h1` i treść czytelną bez CSS. Link firmowy ma
opis celu. Test renderera sprawdza strukturę i escapowanie; ręczna weryfikacja
w reprezentatywnych klientach pocztowych pozostaje bramką produkcyjną.

Decyzja analityczna jest nieblokującą sekcją z dwoma zwykłymi przyciskami.
Odmowa i wycofanie są dostępne klawiaturą, błąd zapisu używa `role="alert"`, a
zgoda nie jest domyślnie zaznaczona. Dashboard używa opisanych statystyk,
tekstowych wartości obok `progress`, semantycznej tabeli drop-off i jawnego
empty/error/loading state; informacja nie zależy wyłącznie od koloru.

## Baseline Etapu 2

- axe: brak automatycznie wykrywalnych naruszeń WCAG 2 A/AA, 2.1 A/AA i 2.2 AA
  na zamkniętym showcase;
- klawiatura: skip link, tabs, dialog i mobilny drawer pokryte Playwrightem;
- motion: `prefers-reduced-motion: reduce` redukuje wszystkie animacje i wyłącza
  płynne przewijanie;
- visual: baseline desktop 1440 px i mobile 390 px;
- kontrast: tekstowe pary minimum 4.5:1, mocna granica kontrolki minimum 3:1.

Pozostaje ręczny test VoiceOver/NVDA, forced colors oraz zoom 200/400% przed
release produkcyjnym; nie blokuje wewnętrznego gate’u foundation, ale jest
obowiązkowy przed zamknięciem checklisty release.

## Gate widgetu

Playwright potwierdza formularz na viewport 390 px, semantyczne grupy pól,
obsługę klawiatury, live status zapisu, natywny dialog, focus return i brak
naruszeń axe WCAG A/AA na pełnym procesie. CSS obsługuje reduced motion oraz
forced colors. Ręczny VoiceOver/NVDA, zoom 200/400% i realne hosty pozostają
bramką produkcyjną.

## Gate marketingu Etapu 10

Landing i podstrony używają wspólnego skip linku, semantycznych regionów,
logicznych nagłówków, natywnych breadcrumbs i `details`. Syntetyczne demo ma
fieldset, legendę, labele, natywny progress i komunikat wyniku `aria-live`.
Mobile 390 px nie ma poziomego overflow, nawigacja zachowuje cele co najmniej
28 px, a forced colors i reduced motion mają jawne style.

Playwright potwierdza klawiaturę, interakcję demo i brak automatycznie
wykrywalnych naruszeń axe WCAG A/AA na pełnej stronie głównej. Ręczny
VoiceOver/NVDA, zoom 200/400%, reflow, high contrast oraz review wszystkich 18
stron pozostają bramką publicznego release.

## Gate redesignu Etapu 12A

Playwright obejmuje stronę główną, design system i pełną ścieżkę widgetu
automatycznym axe WCAG 2.2 A/AA. Osobny scenariusz potwierdza mobilne menu:
`aria-expanded`, focus po otwarciu, trap, Escape, return focus i blokadę
przewijania tylko w czasie otwarcia. Reflow jest sprawdzony przy 320 CSS px na
pełnym landingu, wszystkich wymaganych powierzchniach marketingowych oraz
fixture’ach panelu. Test wymusza również `forced-colors: active` i
`prefers-reduced-motion: reduce`, zachowując dostępność głównej akcji.

Pełna macierz wizualna 1440/1280/1024/768/390/320 px nie wykazuje poziomego
overflow. Statusy mają tekst, dane tabelaryczne zachowują nagłówki, a mobile
lista leadów używa jawnych etykiet. Ręczny VoiceOver/NVDA na rzeczywistych
urządzeniach oraz przegląd 200/400% w docelowych przeglądarkach nadal są
obowiązkowe przed publicznym release, ponieważ automaty nie zastępują
technologii asystującej.

## Gate interakcji buildera Etapu 12X

Uchwyt pytania ma pełną nazwę z pozycją i sekcją oraz instrukcję
`Alt+ArrowUp/ArrowDown`. Te same operacje pozostają dostępne w menu pytania,
więc gest przeciągania nie jest jedyną metodą. Po zmianie kolejności fokus
wraca na przeniesiony uchwyt, a wynik trafia do regionu `aria-live`.

Błędy konfiguracji są widoczne tekstowo w summary, na liście pytań i przy
właściwym polu przez `aria-invalid`/`aria-describedby`; kolor jest tylko
wsparciem. Produkcyjny Playwright potwierdza mysz, klawiaturę, fokus, tablet,
mobile oraz brak naruszeń axe WCAG A/AA. Ręczny VoiceOver/NVDA nadal pozostaje
bramką wydania produkcyjnego.

## Gate przełącznika Etapu 12Y

Przełącznik pozostaje natywnym `input[type="checkbox"]`, więc zachowuje
programatyczną nazwę, stan checked/disabled oraz obsługę `Space`. Wygląd
42 × 24 px nie zmienia semantyki. Globalny focus-visible tworzy 3 px outline,
a forced-colors używa systemowych ról Canvas, ButtonText, Highlight i
HighlightText.

Playwright sprawdza oba stany, fokus, disabled, klawiaturę, wyliczoną geometrię
i brak dziedziczenia paddingu pól tekstowych. Axe przechodzi dla buildera
desktop/mobile i ustawień prywatności. Ręczny VoiceOver/NVDA nadal pozostaje
bramką wydania produkcyjnego.

## Gate rekonstrukcji strony głównej Etapu 12E

Ruch strony `/` jest progresywnym wzbogaceniem. Bez JavaScriptu H1, działania i
wszystkie proofy pozostają widoczne. `IntersectionObserver` nie zmienia
semantyki, kolejności fokusu, `aria-hidden` ani `tabIndex`; fokus natychmiast
ujawnia najbliższy animowany element. Przy `prefers-reduced-motion: reduce`
wszystkie elementy mają pełną widoczność, brak transformacji, animacji i
transition.

Playwright sprawdza no-JS, progressive reveal, reduced motion, forced colors,
skip link, mobilny focus trap i return focus, axe WCAG A/AA, 320 px bez
overflow oraz tekst proofu co najmniej 12 px. Status `85/100` ma programatyczny
`progressbar`, figury są opisane jako dane demonstracyjne, a wszystkie widoczne
CTA prowadzą do istniejącego celu.
