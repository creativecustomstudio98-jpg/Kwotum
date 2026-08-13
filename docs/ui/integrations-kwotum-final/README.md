# Centrum integracji Kwotum

## Zakres

Pakiet blokuje zaakceptowaną anatomię dla dwóch istniejących kanałów:

- `/panel/[organizationId]/integracje/webhooki`;
- `/panel/[organizationId]/integracje/wordpress`.

Referencja ma 2118 × 1510 px i SHA-256
`55b88b57d2037b13dfd948caefd55e64ebf09537538ea7173c6e7a5a417e3594`.
Ustala kolejność nawigacja → statusy → operacje → historia, lekkie obramowania,
zwartą typografię oraz brak dekoracyjnych efektów dashboard-template.

## Granice produktu

Wizualizacja nie jest fixture'em danych ani zgodą na nowe integracje. Kwotum
pokazuje tylko realne webhooki i połączenia WordPress. Dokumentacja, filtr,
ręczne odświeżanie, CRM i Google Sheets nie występują, dopóki nie mają
działającego kontraktu produktu. Webhook zachowuje HMAC, SSRF/DNS guard,
one-time secret i historię bez payloadu/PII. WordPress zachowuje dokładny
origin, jednorazowy token 10 minut i dane leadów poza CMS.

## Odbiór

Wynik i dowody opisuje `VISUAL_QA_REPORT.md`. Renderowane artefakty znajdują
się w `artifacts/visual-qa/12zq-integrations-navigation/`.
