# Finalny ekran wyboru organizacji — 2026-08-13

Etap 12ZN zastępuje wcześniejszą szeroką kartę dashboardową na `/panel`
kompozycją z zaakceptowanego obrazu: nagłówek marki, lewy panel wyjaśniający,
wyszukiwarkę oraz tabelaryczną listę organizacji. Kolory i znak pochodzą z
aktualnego systemu Kwotum.

Implementacja nie dodaje danych przykładowych ani nowych uprawnień. Pobiera
tylko aktywne członkostwa bieżącego użytkownika, organizacje dostępne przez RLS
oraz najnowszy timestamp leada i — tylko dla Ownera/Admina — procesu. Każdy
wiersz prowadzi do istniejącej trasy tenantu. Role, status, slug i aktywność są
rzeczywiste; wyszukiwarka działa przez `GET /panel?q=`.

Kontrakt, rollback i wynik 19/20 opisują
`ui/organization-picker-kwotum-final/README.md` i
`ui/organization-picker-kwotum-final/VISUAL_QA_REPORT.md`.
