# Architektura widgetu

## Cele

Izolacja od CSS i JS hosta, mały bundle, dostępność niezależna od strony, stabilna wysokość, wznowienie sesji, obsługa utraty sieci i brak sekretów.

## Loader

Jeden wersjonowany moduł rejestruje natywny custom element, ignoruje kolejne
identyczne inicjalizacje i wspiera inline/popup/fullscreen. Hosted link używa
tego samego renderera. Loader nie pobiera Reacta ani aplikacji panelowej.
Inline inicjalizuje sesję po podłączeniu, natomiast popup i fullscreen do
kliknięcia launchera pozostają bez sesji, requestów API i dostępu do
`localStorage`. Jawne, ograniczone zmienne CSS launchera dziedziczą się przez
Shadow DOM; nie otwierają stylowania wnętrza procesu przez hosta.

## State machine

`idle → loading_manifest → active → result`, z osobnymi stanami
`recoverable_error`, `expired` i `unavailable`. Synchronizacja ma ortogonalne
stany `synced`, `saving` i `offline`, więc zapis nie blokuje procesu. Odpowiedzi
zapisują się lokalnie i serwerowo; UUID mutacji zapobiega duplikatom. Konflikt
rewizji dwóch kart wymusza wznowienie i bezpieczne odtworzenie kolejki.

## Tryb podglądu panelowego

Etap 12ZH wykorzystuje ten sam `WycenoWidgetElement`,
`WidgetSessionController`, parser manifestu, walidację odpowiedzi i nawigację,
ale podstawia `PreviewWidgetApi` oraz `MemoryWidgetStorage`. Manifest pochodzi
z immutable opublikowanej wersji i jest przekazywany do elementu jako
właściwość; adapter preview nie wykonuje `fetch`, nie tworzy publicznej sesji,
nie wysyła analityki, plików ani odpowiedzi i nie tworzy leada. Submit kończy
się wyłącznie lokalnym potwierdzeniem, a restart usuwa stan pamięciowy.

Preview ma stałą, widoczną etykietę i nie emituje zdarzenia `submitted` do
hosta. Nie zastępuje UAT publicznego hosted flow, ponieważ nie uruchamia
serwerowego pricingu ani dostawy. Podgląd draftu pozostaje poza zakresem do
czasu zdefiniowania bezpiecznego, wersjonowanego snapshotu roboczego.

## Bezpieczeństwo

Manifest jest allowlistowany, a treść jest renderowana jako tekst — rich text
nie należy do kontraktu. Manifest v1 pozostaje obsługiwany. Manifest v2 dodaje
wyłącznie typowane ograniczenie odpowiedzi; prywatne sekcje buildera i
`sectionKey` nie są ujawniane. Token sesji ma 256 bitów entropii,
siedmiodniowe expiry, zakres jednej sesji i w bazie występuje wyłącznie jako
SHA-256. Serwer ponownie waliduje odpowiedź oraz oblicza przejście na immutable
snapshotcie. Upload należy do Etapu 7, a pricing do Etapu 6.

## Komunikacja z hostem

Custom events: `wyceno:ready`, `wyceno:resize`, `wyceno:started`,
`wyceno:closed`. `submitted` zostanie dodany z prawdziwym submittem. Token,
dane kontaktowe i odpowiedzi nie są emitowane do hosta. Widget respektuje
`prefers-reduced-motion`; macierz CSP hostów wymaga testu przed produkcją.

Szczegółowy kontrakt i instrukcja osadzenia:
`docs/WIDGET_IMPLEMENTATION.md`.
