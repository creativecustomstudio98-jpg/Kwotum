"use client";

import { useState } from "react";

import {
  Alert,
  AppShell,
  Breadcrumb,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  ErrorState,
  Fieldset,
  FormField,
  Input,
  LinkButton,
  Radio,
  Section,
  Select,
  Skeleton,
  StatusBadge,
  Stepper,
  Table,
  Tabs,
  Textarea,
  Toast,
  type NavigationItem,
} from "@wyceno/ui";

const navigation: NavigationItem[] = [
  { active: true, href: "#overview", label: "Przegląd" },
  { href: "#foundation", label: "Fundamenty" },
  { href: "#actions", label: "Akcje" },
  { href: "#forms", label: "Formularze" },
  { href: "#data", label: "Dane" },
  { href: "#states", label: "Stany" },
];

export function DesignSystemDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  return (
    <AppShell navigation={navigation} title="Design foundation">
      <div className="demo-page">
        <Breadcrumb
          items={[{ href: "#overview", label: "Panel" }, { label: "Design foundation" }]}
        />

        <header className="demo-hero" id="overview">
          <div>
            <h1 className="wy-display">Spójny interfejs do pracy z konkretnymi danymi</h1>
            <p className="wy-body-lg">
              Wewnętrzna powierzchnia kontroli tokenów, zachowania komponentów, klawiatury i
              responsywności. Nie zawiera danych klientów ani funkcji domenowych.
            </p>
          </div>
          <div className="demo-hero__meta">
            <span>Etap</span>
            <strong>12D / 13</strong>
            <span>Motyw</span>
            <strong>Jasny</strong>
          </div>
        </header>

        <Alert title="Zakres strony" tone="info">
          Elementy służą wyłącznie do oceny wspólnej biblioteki UI. Nie odczytują danych klientów i
          nie omijają uprawnień panelu.
        </Alert>

        <Section
          description="Jedna skala zasila marketing, panel i wszystkie komponenty bazowe."
          id="foundation"
          title="Kolor, typografia i powierzchnie"
        >
          <div className="demo-foundation">
            <div>
              <p className="wy-kicker">Paleta semantyczna</p>
              <div className="demo-token-grid" aria-label="Główne tokeny koloru">
                <TokenSwatch
                  className="demo-token--background"
                  label="Background"
                  value="#F7F6F1"
                />
                <TokenSwatch className="demo-token--surface" label="Surface" value="#FFFFFF" />
                <TokenSwatch className="demo-token--text" label="Text primary" value="#1A211E" />
                <TokenSwatch className="demo-token--brand" label="Brand" value="#143D2F" />
                <TokenSwatch
                  className="demo-token--brand-soft"
                  label="Brand soft"
                  value="#DCE9E1"
                />
                <TokenSwatch className="demo-token--success" label="Success" value="#2F6A4F" />
              </div>
            </div>
            <div className="demo-type-scale">
              <p className="wy-kicker">Hierarchia typografii</p>
              <p className="wy-heading-xl">Nagłówek strony</p>
              <p className="wy-heading-md">Nagłówek sekcji</p>
              <p className="wy-body-lg">
                Opis prowadzi odbiorcę do decyzji bez konkurowania z tytułem.
              </p>
              <p className="wy-description">
                Metadane i objaśnienia pozostają czytelne, ale wyraźnie drugorzędne.
              </p>
            </div>
          </div>
        </Section>

        <Section
          description="Każda kontrolka ma fokus, stan aktywny, disabled i czytelną etykietę."
          id="actions"
          title="Akcje i statusy"
        >
          <div className="demo-panel">
            <div className="demo-row">
              <Button onClick={() => setToastOpen(true)}>Pokaż potwierdzenie</Button>
              <Button onClick={() => setDialogOpen(true)} variant="secondary">
                Otwórz dialog
              </Button>
              <LinkButton href="#forms" variant="quiet">
                Przejdź do formularza
              </LinkButton>
              <Button disabled variant="secondary">
                Niedostępne
              </Button>
              <Button loading>Zapisywanie</Button>
            </div>
            <div className="demo-row">
              <StatusBadge tone="success">Aktywny</StatusBadge>
              <StatusBadge tone="warning">Wymaga uwagi</StatusBadge>
              <StatusBadge tone="error">Błąd</StatusBadge>
              <StatusBadge tone="info">W przygotowaniu</StatusBadge>
            </div>
          </div>
        </Section>

        <Section
          description="Etykieta, podpowiedź i błąd tworzą jeden programatyczny kontrakt."
          id="forms"
          title="Pola i wybory"
        >
          <form
            className="demo-panel demo-form"
            onSubmit={(event) => {
              event.preventDefault();
              setToastOpen(true);
            }}
          >
            <FormField hint="Nazwa widoczna tylko w tej demonstracji." label="Nazwa procesu">
              <Input defaultValue="Wycena kuchni na wymiar" />
            </FormField>
            <FormField error="Wybierz sposób prezentacji wyniku." label="Prezentacja wyniku">
              <Select defaultValue="">
                <option disabled value="">
                  Wybierz opcję
                </option>
                <option value="range">Przedział</option>
                <option value="from">Cena od</option>
                <option value="hidden">Bez ceny</option>
              </Select>
            </FormField>
            <FormField label="Wyjaśnienie" optional>
              <Textarea placeholder="Napisz, co wpływa na wynik…" />
            </FormField>
            <Fieldset legend="Widoczność">
              <Radio
                defaultChecked
                description="Proces pozostaje dostępny tylko w trybie testowym."
                label="Wersja robocza"
                name="visibility"
              />
              <Radio
                description="Opcja będzie dostępna po implementacji publikacji."
                disabled
                label="Opublikowany"
                name="visibility"
              />
            </Fieldset>
            <Checkbox
              description="Zmniejsza liczbę animacji i wyłącza płynne przewijanie."
              label="Preferuję ograniczony ruch"
            />
            <div className="demo-row">
              <Button type="submit">Sprawdź formularz</Button>
              <Button type="reset" variant="secondary">
                Wyczyść
              </Button>
            </div>
          </form>
        </Section>

        <Section
          description="Gęste informacje pozostają semantyczną tabelą i można je przewijać poziomo."
          id="data"
          title="Nawigacja i dane"
        >
          <div className="demo-panel">
            <Stepper
              steps={[
                { label: "Zakres", status: "complete" },
                { label: "Pytania", status: "current" },
                { label: "Wynik", status: "upcoming" },
                { label: "Publikacja", status: "upcoming" },
              ]}
            />
            <Tabs
              label="Widok danych demonstracyjnych"
              tabs={[
                {
                  id: "table",
                  label: "Tabela",
                  content: (
                    <Table
                      caption="Demonstracyjne procesy bez danych klientów"
                      columns={[
                        { header: "Proces", key: "name" },
                        { header: "Status", key: "status" },
                        { header: "Kroki", key: "steps" },
                        { header: "Aktualizacja", key: "updated" },
                      ]}
                      rows={[
                        {
                          id: "furniture",
                          cells: {
                            name: "Meble na wymiar",
                            status: <StatusBadge tone="success">Gotowy</StatusBadge>,
                            steps: "8",
                            updated: "dzisiaj, 10:24",
                          },
                        },
                        {
                          id: "fence",
                          cells: {
                            name: "Ogrodzenie posesji",
                            status: <StatusBadge tone="warning">Do sprawdzenia</StatusBadge>,
                            steps: "6",
                            updated: "wczoraj, 16:02",
                          },
                        },
                      ]}
                    />
                  ),
                },
                {
                  id: "rules",
                  label: "Zasady",
                  content: (
                    <Alert title="Czytelne dane" tone="success">
                      Liczby używają cyfr tabelarycznych, a status nigdy nie jest przekazywany
                      wyłącznie kolorem.
                    </Alert>
                  ),
                },
              ]}
            />
          </div>
        </Section>

        <Section
          description="Każdy stan wyjaśnia sytuację i daje sensowny następny krok."
          id="states"
          title="Loading, empty i error"
        >
          <div className="demo-state-grid">
            <div className="demo-panel">
              <h3>Ładowanie</h3>
              <p className="demo-muted">Układ pozostaje stabilny bez fałszywych danych.</p>
              <Skeleton lines={4} />
            </div>
            <EmptyState
              action={<Button onClick={() => setToastOpen(true)}>Utwórz pierwszy proces</Button>}
              description="Zacznij od pustej struktury albo wybierz szablon w Etapie 4."
              title="Nie ma jeszcze procesów"
            />
            <ErrorState
              action={
                <Button
                  onClick={() => {
                    setRetryCount((count) => count + 1);
                    setToastOpen(true);
                  }}
                  variant="secondary"
                >
                  Spróbuj ponownie{retryCount > 0 ? ` (${retryCount})` : ""}
                </Button>
              }
              description="Sprawdź połączenie. Wprowadzone zmiany pozostały w przeglądarce."
              title="Nie udało się pobrać widoku"
            />
          </div>
        </Section>
      </div>

      <Dialog
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} variant="secondary">
              Anuluj
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setToastOpen(true);
              }}
            >
              Potwierdź
            </Button>
          </>
        }
        description="Escape i przycisk zamknięcia przywracają fokus elementowi wywołującemu."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="Sprawdzenie zachowania dialogu"
      >
        <FormField label="Nazwa wariantu">
          <Input autoFocus defaultValue="Wariant podstawowy" />
        </FormField>
      </Dialog>

      <Toast
        message="Działanie demonstracyjne zostało wykonane."
        onDismiss={() => setToastOpen(false)}
        open={toastOpen}
      />
    </AppShell>
  );
}

function TokenSwatch({
  className,
  label,
  value,
}: {
  className: string;
  label: string;
  value: string;
}) {
  return (
    <div className="demo-token">
      <span aria-hidden="true" className={className} />
      <strong>{label}</strong>
      <small>{value}</small>
    </div>
  );
}
