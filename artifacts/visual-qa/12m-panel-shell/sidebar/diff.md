# Etap 12M — wspólny sidebar Lorum

## Zakres

- referencja: `leads-desktop.png`, crop 208 × 900 px;
- before: historyczny render dashboardu z railem 78 px;
- after-v1: pierwszy wspólny sidebar 208 px;
- after-v2: finalny sidebar 208 px z aktywnym stanem opartym o token sukcesu;
- wariant zwinięty: 78 px;
- kontrola mobile: 390 × 844 px, dolna nawigacja bez desktopowego przełącznika.

## Dziesięć największych różnic względem referencji

1. Zachowano aktualny znak `Logoicon.svg`; historyczny znak z referencji nie
   wraca do aplikacji.
2. Tło używa aktywnego tokenu panelu `--wy-color-brand`, dlatego jest ciemniejsze
   od historycznego `#074c35`.
3. Aktywny link używa istniejącego tokenu `--wy-color-success`.
4. Dodano dostępny, pływający przełącznik 208/78 px, którego nie ma w statycznej
   referencji.
5. Ustawienia pozostają w capability-gated głównej nawigacji.
6. Powiadomienia pozostają działającym skrótem do listy leadów.
7. Konto pokazuje rzeczywistą nazwę użytkownika i organizacji, a nie dane z
   makiety.
8. Ikony pochodzą ze wspólnego `PanelIcon`, nie z historycznego zestawu SVG.
9. Aktywny element ma dodatkowy pionowy znacznik widoczny również po zwinięciu.
10. Mobile używa istniejącej dolnej, przewijanej nawigacji zamiast kopiować
    desktopowy sidebar.

## Wynik

**18/20**

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 3/4;
- gęstość danych oraz stany: 4/4;
- transformacja mobile: 3/4.

Sidebar ma 208 px po rozwinięciu i 78 px po zwinięciu, nie zmienia konstrukcji
między dashboardem i leadami, zapamiętuje preferencję lokalnie, działa
klawiaturą i nie powoduje poziomego overflow. Różnice marki, tokenów i danych są
świadome.
