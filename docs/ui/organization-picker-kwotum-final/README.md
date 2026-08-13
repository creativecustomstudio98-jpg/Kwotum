# Finalny wybór organizacji Kwotum

**Status:** zaakceptowany kontrakt wykonawczy
**Data:** 2026-08-13
**Zakres:** wyłącznie uwierzytelniona trasa `/panel`

## Referencja

Źródłem prawdy jest dostarczony obraz
`reference/organization-picker-1536x1024.png`, 1536 × 1024 px, SHA-256
`572cb0009eb74051e97c37578ae9b11bbfa5c3c1381140272874380852eb1810`.
Zastępuje on starszą decyzję 12M-Y wyłącznie dla ekranu wyboru organizacji.
Kolor fioletowy, przykładowe firmy i znak z obrazu nie są danymi produktu;
implementacja używa aktualnego znaku Kwotum V3, zieleni panelu oraz danych
dostępnych przez aktywne członkostwo i RLS.

## Kontrakt desktop 1536 × 1024

- globalny nagłówek: 80 px;
- lewa kolumna wprowadzająca: 484 px;
- prawy obszar: 1052 px, z osią treści około 934 px;
- wyszukiwarka: 376 × 50 px;
- powierzchnia listy: nagłówek 62 px i wiersz 111 px;
- kolumny: organizacja, rzeczywista rola, rzeczywisty status, ostatnia
  aktywność oraz chevron;
- jeden wiersz jest jednym dostępnym linkiem do właściwego tenantu.

Lista nie jest dopełniana przykładowymi firmami. Slug nie jest przedstawiany
jako domena, a rola `owner/admin/sales` zachowuje istniejący model uprawnień.
Ostatnia aktywność jest najnowszym dostępnym timestampem leada albo procesu;
rola sprzedażowa nie otrzymuje przez ten ekran dodatkowego odczytu procesów.

## Zachowanie

- wyszukiwanie `GET ?q=` filtruje nazwę i slug po stronie serwera po pobraniu
  wyłącznie organizacji aktualnego użytkownika;
- istniejący redirect do onboardingu dla pojedynczej pustej organizacji
  Ownera/Admina pozostaje bez zmian;
- brak członkostwa i brak wyników mają osobne, uczciwe stany;
- logout pozostaje istniejącą akcją serwerową;
- poniżej 70 rem lewa kolumna przechodzi nad listę, a poniżej 46 rem wiersz
  staje się kartą z tą samą kolejnością DOM;
- ekran nie ma poziomego overflow i przechodzi axe WCAG 2 A/AA/2.1 AA/2.2 AA.

## Rollback

Rollback przywraca poprzedni JSX i reguły `.organization-picker*` oraz starszy
test geometrii. Nie wymaga migracji i nie zmienia organizacji, członkostw,
leadów, procesów ani kluczy sesji.
