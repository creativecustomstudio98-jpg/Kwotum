# PX7 — kontrolowany pilot

**Dozwolone:** konfiguracja zaakceptowanego procesu, staging, UAT, ograniczony
rollout i pomiar.  
**Zakazane:** usunięcie fallbacku, automatyczne rozszerzenie na kolejnych tenantów.

## Wynik

Fortez testuje oddzielne CTA quick/guided, a druga firma usługowa sprawdza
guided/visual. Każda ma baseline, ownera, przypadki regresyjne, plan wyłączenia
i końcową decyzję GO/ITERATE/NO-GO.

## Ryzyka

Mylenie wzrostu liczby leadów z jakością, zbyt mała próba, brak schedulera lub
monitoringu oraz utrata starego kanału w czasie awarii.

## Stan 2026-08-25

Przygotowano lokalnie trzy syntetyczne konfiguracje, test ich kontraktu, macierz
UAT, pomiar bez PII, fallback, rollback oraz rejestr decyzji. Nie utworzono
osobnego worktree: bieżący katalog jest nieczysty, a PX2–PX6 nie mają jeszcze
zaakceptowanego, scalonego SHA. Tworzenie worktree z tego stanu naruszałoby
`WORKTREE_RUNBOOK.md`.

Decyzja dla prawdziwego ruchu: **NO-GO**. Brakuje stagingu na immutable SHA,
schedulerów i monitoringu kolejki, syntetycznej dostawy, restore drill, DPA,
finalnych treści, właścicieli po stronie firm oraz podpisanego UAT. Druga firma
jest wyłącznie syntetycznym profilem i nie dostarczyła własnych mediów.

Dowody: `../../pilots/PX7_PILOT_READINESS_AND_DECISION_2026-08-25.md` oraz
`../../pilots/PX7_UAT_AND_EVIDENCE_MATRIX_2026-08-25.md`.

## STOP

Dozwolony następny krok to domknięcie blokad P0 i syntetyczny staging. Nie wolno
podłączać prawdziwych danych ani automatycznie rozszerzać pilota na tenantów.
