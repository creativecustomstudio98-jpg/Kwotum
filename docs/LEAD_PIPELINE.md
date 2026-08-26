# Lead pipeline

## Zakres Etapu 7

Etap 7 zamyka główną ścieżkę od ukończonej sesji widgetu do leada widocznego
w panelu organizacji. Nie wysyła wiadomości e-mail, nie tworzy outboxu i nie
implementuje eksportu ani automatycznej retencji.

## Kontakt i potwierdzenia

Wynik orientacyjny pojawia się przed kontaktem. Snapshot
`leadCaptureSchemaVersion: 1` zachowuje wymagany e-mail i opcjonalny telefon.
Wersja 2 wybiera jawną politykę `email_required` albo `phone_required`; zawsze
musi istnieć co najmniej jeden kanał. Snapshot zawiera wersjonowaną informację
prywatności oraz opcjonalną, odrębną zgodę marketingową. Widget:

- nie zaznacza kontrolek domyślnie;
- wymaga potwierdzenia informacji prywatności;
- przesyła wersję i SHA-256 dokładnie z manifestu;
- nigdy nie uzależnia wysłania zapytania od zgody marketingowej.

Zgoda marketingowa e-mail jest dozwolona wyłącznie, gdy respondent podał
e-mail. Proces phone-first może wysłać lead bez e-maila; firma otrzyma wtedy
telefon, a potwierdzenie e-mail dla respondenta nie jest tworzone.

Baza porównuje dowód z immutable snapshotem. Rekord zgody/potwierdzenia zawiera
typ, wersję, hash i czas; nie kopiuje pełnej treści prawnej.

## Atomowy submit

`POST /api/v1/public/sessions/current/submit` przyjmuje token w
`X-Wyceno-Session` oraz:

```json
{
  "mutationId": "uuid",
  "contact": {
    "email": "klient@example.pl",
    "name": "Opcjonalnie",
    "phone": "+48 600 000 000"
  },
  "privacyNotice": {
    "accepted": true,
    "version": "2026-07",
    "textHash": "64 znaki hex"
  },
  "marketingEmailConsent": null,
  "fileIds": []
}
```

Funkcja PostgreSQL blokuje sesję, sprawdza jej ukończenie i expiry, waliduje
potwierdzenia i pliki, po czym w jednej transakcji:

1. ponownie liczy pricing i scoring z odpowiedzi sesji;
2. zapisuje lead i snapshot nazw procesu;
3. kopiuje surowe odpowiedzi wraz z tytułami pytań i utrwala ich czytelne
   etykiety z przypiętego immutable snapshotu;
4. zapisuje potwierdzenia i przypina zweryfikowane pliki;
5. dopisuje początkowy status `new`.

Unikalność `session_id` gwarantuje jeden lead na sesję. Retry po utracie
odpowiedzi zwraca ten sam publiczny identyfikator i czas, niezależnie od tego,
czy klient zachował pierwotny UUID mutacji. Po submit odpowiedzi sesji są
chronione triggerem przed zmianą.

Publiczna odpowiedź zawiera wyłącznie `leadPublicId` i `submittedAt`. Kontakt,
tenant ID, odpowiedzi, cena i scoring nie wracają do strony gospodarza.
Surowe klucze opcji pozostają źródłem logiki i audytu, natomiast panel oraz
brief używają `display_answer`. Etykiety są przypięte do wersji procesu leada,
więc późniejsza edycja draftu nie zmienia historycznego zgłoszenia.

## Pliki

Opcjonalny upload obsługuje maksymalnie 5 plików po 25 MiB. Allowlista:
JPEG/JPG, PNG, WebP i PDF. Route Handler:

1. ogranicza body i rozmiar pliku;
2. normalizuje sam basename i odrzuca znaki sterujące;
3. wymaga zgodności rozszerzenia, MIME i magic bytes;
4. oblicza SHA-256;
5. rezerwuje losowy rekord i ścieżkę w prywatnym buckecie;
6. używa service role tylko do transferu na dokładnie zarezerwowaną ścieżkę;
7. potwierdza rozmiar i MIME obiektu przed statusem `verified`.

Ścieżka i `organization_id` nie są ujawniane publicznie. Panel tworzy
krótkotrwały podpisany URL dopiero po autoryzowanym odczycie rekordu przez RLS.
Magic bytes ograniczają proste spoofing i polygloty, ale nie zastępują skanera
malware; skaner, retencja i procedury DSAR są bramką produkcyjną Etapu 12.

## Panel i uprawnienia

Owner, Admin i Sales mają capabilities `lead:read`, `lead:note` i
`lead:status`. Lista ma filtr statusu i stan pusty. Szczegół pokazuje kontakt,
serwerową wycenę i score, odpowiedzi, reguły kwalifikacji, pliki,
potwierdzenia, notatki i historię statusu.

Statusy v1: `new`, `in_progress`, `qualified`, `won`, `lost`, `spam`.
Zmiana odbywa się przez `security definer`, który ponownie sprawdza aktywną
rolę i tenant scope, a następnie atomowo dopisuje historię i audit log.
Bezpośredni update leada jest zabroniony. Notatka wymaga aktywnego członkostwa,
zgodnego `organization_id`, istniejącego leada tego samego tenanta i autora
równego `auth.uid()`.

Wszystkie tabele domeny mają wymuszone RLS i jawny `organization_id`. Drugi
tenant, użytkownik bez członkostwa i członek zawieszony otrzymują pusty odczyt
lub generyczny brak zasobu.

## Testy i ograniczenia

- unit: walidacja kontaktu/submitu, kontroler widgetu oraz negatywne sygnatury
  plików;
- PostgreSQL: atomowy submit, retry, niezmienność odpowiedzi, role, IDOR dwóch
  tenantów, zawieszony członek, status, notatka, historia, zgody i pliki;
- Playwright: kontakt, prywatność, upload PDF, submit, potwierdzenie, mobile i
  axe.

Przed produkcją nadal wymagane są rozproszone limity per IP/origin,
adaptacyjny antyspam, skaner malware, zatwierdzona retencja, procedury
usuwania/eksportu oraz prawny review treści organizacji.
