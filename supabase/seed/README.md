# Seed syntetyczny

`../tests/tenant_isolation.sql` jest deterministycznym seedem integracyjnym:
tworzy dwa tenanty oraz role Owner, Admin, Sales i zawieszonego członka. Dane
używają domeny `.test`, nie zawierają danych rzeczywistych i są ładowane tylko do
jednorazowej bazy testowej przez `pnpm test:rls`.

Nie uruchamiaj tego pliku na stagingu ani produkcji. Staging otrzyma osobny seed
przez kontrolowany proces deploymentu, gdy powstaną domeny z Etapu 4.
