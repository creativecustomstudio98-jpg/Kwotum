"use client";

import {
  calculateEstimation,
  type Estimation,
  type EstimationCondition,
  type FlowDocument,
  type FlowStep,
} from "@wyceno/validation";
import { type SetStateAction, useMemo, useState } from "react";

import { PanelIcon } from "../../../panel-icon";

export type FlowBuilderArea = "form" | "pricing" | "result" | "scoring";
export type FlowBuilderPane = "inspector" | "preview" | "questions";

type PricingRule = Estimation["pricing"]["rules"][number];
type ScoringRule = Estimation["scoring"]["rules"][number];
type Currency = Estimation["pricing"]["currency"];

const maximumMinorAmount = 9_000_000_000_000;
const currencyCodes: readonly Currency[] = [
  "PLN",
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CZK",
  "DKK",
  "NOK",
  "SEK",
  "JPY",
  "BHD",
];

export function FlowBuilderAreaTabs({
  area,
  className = "",
  onChange,
}: Readonly<{
  area: FlowBuilderArea;
  className?: string;
  onChange: (area: FlowBuilderArea) => void;
}>) {
  return (
    <div
      aria-label="Obszar konfiguracji procesu"
      className={`flow-builder__area-tabs ${className}`.trim()}
      role="tablist"
    >
      {(
        [
          ["form", "Formularz"],
          ["pricing", "Wycena"],
          ["scoring", "Scoring"],
          ["result", "Wynik"],
        ] as const
      ).map(([value, label]) => (
        <button
          aria-selected={area === value}
          key={value}
          onClick={() => onChange(value)}
          role="tab"
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function EstimationEditorWorkspace({
  area,
  document,
  mobilePane,
  onAreaChange,
  onDocumentChange,
}: Readonly<{
  area: Exclude<FlowBuilderArea, "form">;
  document: FlowDocument;
  mobilePane: FlowBuilderPane;
  onAreaChange: (area: FlowBuilderArea) => void;
  onDocumentChange: (update: SetStateAction<FlowDocument>, group?: string) => void;
}>) {
  const estimation = document.estimation;
  const [activePricingRuleId, setActivePricingRuleId] = useState<string | null>(
    estimation?.pricing.rules[0]?.id ?? null,
  );
  const [activeScoringRuleId, setActiveScoringRuleId] = useState<string | null>(
    estimation?.scoring.rules[0]?.id ?? null,
  );

  const preview = useMemo(() => {
    if (!estimation) return null;
    try {
      return calculateEstimation(estimation, {});
    } catch {
      return null;
    }
  }, [estimation]);

  const activePricingRule = estimation?.pricing.rules.find(
    (rule) => rule.id === activePricingRuleId,
  );
  const activeScoringRule = estimation?.scoring.rules.find(
    (rule) => rule.id === activeScoringRuleId,
  );

  const updateEstimation = (update: (current: Estimation) => Estimation, group?: string) => {
    onDocumentChange(
      (current) =>
        current.estimation ? { ...current, estimation: update(current.estimation) } : current,
      group,
    );
  };

  return (
    <>
      <aside
        aria-label={
          area === "pricing"
            ? "Reguły wyceny"
            : area === "scoring"
              ? "Reguły scoringu"
              : "Elementy wyniku"
        }
        className={`flow-builder__questions estimation-builder__outline ${mobilePane === "questions" ? "is-mobile-active" : ""}`}
        data-layout-region="builder-questions"
      >
        <FlowBuilderAreaTabs area={area} onChange={onAreaChange} />
        <div className="flow-builder__panel-heading">
          <div>
            <h2>{areaTitle(area)}</h2>
            <p>{areaDescription(area)}</p>
          </div>
        </div>
        {area === "pricing" ? (
          <PricingOutline
            activeRuleId={activePricingRuleId}
            estimation={estimation}
            onAdd={() => {
              if (!estimation || estimation.pricing.rules.length >= 50) return;
              const rule = createPricingRule(document, estimation);
              updateEstimation((current) => ({
                ...current,
                pricing: { ...current.pricing, rules: [...current.pricing.rules, rule] },
              }));
              setActivePricingRuleId(rule.id);
            }}
            onSelect={setActivePricingRuleId}
          />
        ) : area === "scoring" ? (
          <ScoringOutline
            activeRuleId={activeScoringRuleId}
            estimation={estimation}
            onAdd={() => {
              if (!estimation || estimation.scoring.rules.length >= 50) return;
              const rule = createScoringRule(document, estimation);
              updateEstimation((current) => ({
                ...current,
                scoring: { ...current.scoring, rules: [...current.scoring.rules, rule] },
              }));
              setActiveScoringRuleId(rule.id);
            }}
            onSelect={setActiveScoringRuleId}
          />
        ) : (
          <ResultOutline document={document} estimation={estimation} />
        )}
      </aside>

      <section
        aria-label="Podgląd wyniku procesu"
        className={`flow-builder__preview estimation-builder__preview ${mobilePane === "preview" ? "is-mobile-active" : ""}`}
        data-layout-region="builder-preview"
      >
        <div className="flow-builder__panel-heading">
          <div>
            <h2>Podgląd wyniku</h2>
            <p>Scoring pozostaje prywatny i nie jest pokazywany klientowi.</p>
          </div>
        </div>
        <ResultPreview document={document} preview={preview} />
      </section>

      <aside
        aria-label={`Ustawienia: ${areaTitle(area)}`}
        className={`flow-builder__inspector estimation-builder__inspector ${mobilePane === "inspector" ? "is-mobile-active" : ""}`}
        data-layout-region="builder-inspector"
      >
        <div className="flow-builder__panel-heading">
          <div>
            <h2>Ustawienia · {areaTitle(area)}</h2>
            <p>{estimation ? "Konfiguracja aktywna" : "Konfiguracja nieaktywna"}</p>
          </div>
        </div>
        {area === "result" ? (
          <ResultSettings document={document} onDocumentChange={onDocumentChange} />
        ) : !estimation ? (
          <EstimationSetup
            onEnable={(nextEstimation) =>
              onDocumentChange((current) => ({ ...current, estimation: nextEstimation }))
            }
          />
        ) : area === "pricing" ? (
          <PricingSettings
            activeRule={activePricingRule}
            document={document}
            estimation={estimation}
            onActiveRuleChange={setActivePricingRuleId}
            onChange={updateEstimation}
          />
        ) : (
          <ScoringSettings
            activeRule={activeScoringRule}
            document={document}
            estimation={estimation}
            onActiveRuleChange={setActiveScoringRuleId}
            onChange={updateEstimation}
          />
        )}
      </aside>
    </>
  );
}

function PricingOutline({
  activeRuleId,
  estimation,
  onAdd,
  onSelect,
}: Readonly<{
  activeRuleId: string | null;
  estimation: Estimation | undefined;
  onAdd: () => void;
  onSelect: (id: string | null) => void;
}>) {
  if (!estimation) return <EmptyOutline message="Najpierw włącz konfigurację w ustawieniach." />;
  return (
    <div className="estimation-builder__rule-list">
      <button
        aria-current={activeRuleId === null ? "page" : undefined}
        className={activeRuleId === null ? "is-active" : ""}
        onClick={() => onSelect(null)}
        type="button"
      >
        <span className="estimation-builder__rule-icon" aria-hidden="true">
          zł
        </span>
        <span>
          <strong>Cena bazowa</strong>
          <small>
            {formatPreviewPrice(estimation.pricing.baseMinMinor, estimation.pricing.currency)}
          </small>
        </span>
      </button>
      {estimation.pricing.rules.map((rule, index) => (
        <button
          aria-current={activeRuleId === rule.id ? "page" : undefined}
          className={activeRuleId === rule.id ? "is-active" : ""}
          key={rule.id}
          onClick={() => onSelect(rule.id)}
          type="button"
        >
          <span className="estimation-builder__rule-index">{index + 1}</span>
          <span>
            <strong>{rule.label}</strong>
            <small>{pricingOperationLabel(rule)}</small>
          </span>
        </button>
      ))}
      {estimation.pricing.rules.length === 0 ? (
        <EmptyOutline message="Brak reguł. Wynik korzysta tylko z ceny bazowej." />
      ) : null}
      <button
        className="estimation-builder__add-rule"
        disabled={estimation.pricing.rules.length >= 50}
        onClick={onAdd}
        type="button"
      >
        ＋ Dodaj regułę ceny
      </button>
    </div>
  );
}

function ScoringOutline({
  activeRuleId,
  estimation,
  onAdd,
  onSelect,
}: Readonly<{
  activeRuleId: string | null;
  estimation: Estimation | undefined;
  onAdd: () => void;
  onSelect: (id: string | null) => void;
}>) {
  if (!estimation) return <EmptyOutline message="Najpierw włącz konfigurację w ustawieniach." />;
  return (
    <div className="estimation-builder__rule-list">
      <div className="estimation-builder__private-note">
        <PanelIcon name="privacy" />
        <span>
          <strong>Tylko dla zespołu</strong>
          <small>Klient nie zobaczy punktów ani kategorii.</small>
        </span>
      </div>
      <button
        aria-current={activeRuleId === null ? "page" : undefined}
        className={activeRuleId === null ? "is-active" : ""}
        onClick={() => onSelect(null)}
        type="button"
      >
        <span className="estimation-builder__rule-icon" aria-hidden="true">
          #
        </span>
        <span>
          <strong>Baza i kategorie</strong>
          <small>{estimation.scoring.categories.length} kategorii</small>
        </span>
      </button>
      {estimation.scoring.rules.map((rule, index) => (
        <button
          aria-current={activeRuleId === rule.id ? "page" : undefined}
          className={activeRuleId === rule.id ? "is-active" : ""}
          key={rule.id}
          onClick={() => onSelect(rule.id)}
          type="button"
        >
          <span className="estimation-builder__rule-index">{index + 1}</span>
          <span>
            <strong>{rule.label}</strong>
            <small>
              {rule.points >= 0 ? "+" : ""}
              {rule.points} pkt
            </small>
          </span>
        </button>
      ))}
      {estimation.scoring.rules.length === 0 ? (
        <EmptyOutline message="Brak reguł. Każdy lead otrzyma punkty początkowe." />
      ) : null}
      <button
        className="estimation-builder__add-rule"
        disabled={estimation.scoring.rules.length >= 50}
        onClick={onAdd}
        type="button"
      >
        ＋ Dodaj regułę scoringu
      </button>
    </div>
  );
}

function ResultOutline({
  document,
  estimation,
}: Readonly<{ document: FlowDocument; estimation: Estimation | undefined }>) {
  return (
    <div className="estimation-builder__result-outline">
      <div>
        <span>1</span>
        <p>
          <strong>Nagłówek</strong>
          <small>{document.result.headline}</small>
        </p>
      </div>
      <div>
        <span>2</span>
        <p>
          <strong>Cena</strong>
          <small>
            {document.result.mode === "no_price"
              ? "Ukryta w wyniku"
              : estimation
                ? "Obliczana po stronie serwera"
                : "Brak aktywnej wyceny"}
          </small>
        </p>
      </div>
      <div>
        <span>3</span>
        <p>
          <strong>Zastrzeżenie</strong>
          <small>{document.result.disclaimer}</small>
        </p>
      </div>
      <div>
        <span>4</span>
        <p>
          <strong>Następny krok</strong>
          <small>{document.result.nextStepLabel}</small>
        </p>
      </div>
    </div>
  );
}

function EmptyOutline({ message }: Readonly<{ message: string }>) {
  return <p className="estimation-builder__empty">{message}</p>;
}

function ResultPreview({
  document,
  preview,
}: Readonly<{
  document: FlowDocument;
  preview: ReturnType<typeof calculateEstimation> | null;
}>) {
  const showPrice = document.result.mode === "consultation" && preview;
  return (
    <div className="estimation-result-preview">
      <div aria-hidden="true" className="estimation-result-preview__icon">
        ✓
      </div>
      <p className="estimation-result-preview__eyebrow">Gotowy wynik</p>
      <h3>{document.result.headline}</h3>
      {showPrice ? (
        <p className="estimation-result-preview__price">
          {preview.pricing.presentation === "exact"
            ? preview.pricing.formattedMin
            : preview.pricing.presentation === "from"
              ? `Od ${preview.pricing.formattedMin}`
              : `${preview.pricing.formattedMin}–${preview.pricing.formattedMax}`}
        </p>
      ) : document.result.mode === "consultation" ? (
        <p className="estimation-result-preview__placeholder">
          Cena pojawi się po włączeniu wyceny.
        </p>
      ) : null}
      <p>{document.result.disclaimer}</p>
      <div className="estimation-result-preview__summary">
        <span>Odpowiedzi klienta</span>
        <span>Zakres realizacji</span>
        <span>Dane kontaktowe</span>
      </div>
      <p className="estimation-result-preview__next">{document.result.nextStepLabel}</p>
      <p className="estimation-result-preview__brand">Powered by Kwotum</p>
    </div>
  );
}

function EstimationSetup({ onEnable }: Readonly<{ onEnable: (estimation: Estimation) => void }>) {
  const [currency, setCurrency] = useState<Currency>("PLN");
  const [maximum, setMaximum] = useState("");
  const [minimum, setMinimum] = useState("");
  const [presentation, setPresentation] = useState<Estimation["pricing"]["presentation"]>("range");
  const [rounding, setRounding] = useState("100");
  const minimumMinor = parseMajorAmount(minimum, currency);
  const maximumMinor = parseMajorAmount(maximum, currency);
  const roundingMinor = parseMajorAmount(rounding, currency);
  const valid =
    minimumMinor !== null &&
    maximumMinor !== null &&
    roundingMinor !== null &&
    roundingMinor >= 1 &&
    roundingMinor <= 1_000_000 &&
    minimumMinor <= maximumMinor &&
    (presentation !== "exact" || minimumMinor === maximumMinor);

  return (
    <form
      className="estimation-settings estimation-setup"
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid || minimumMinor === null || maximumMinor === null || roundingMinor === null)
          return;
        onEnable({
          estimationSchemaVersion: 1,
          pricing: {
            baseMaxMinor: maximumMinor,
            baseMinMinor: minimumMinor,
            currency,
            presentation,
            roundingIncrementMinor: roundingMinor,
            rules: [],
          },
          scoring: {
            categories: [{ key: "wszystkie", label: "Wszystkie leady", minPoints: 0 }],
            initialPoints: 0,
            rules: [],
          },
        });
      }}
    >
      <section className="estimation-settings__intro">
        <span aria-hidden="true">zł</span>
        <h3>Włącz bezpieczną estymację</h3>
        <p>Podaj własną cenę bazową. Nie wstawiamy domyślnych stawek branżowych.</p>
      </section>
      <fieldset className="estimation-settings__grid">
        <legend>Cena bazowa</legend>
        <MoneyInput currency={currency} label="Minimum" onChange={setMinimum} value={minimum} />
        <MoneyInput currency={currency} label="Maksimum" onChange={setMaximum} value={maximum} />
      </fieldset>
      <label>
        <span>Waluta</span>
        <select
          onChange={(event) => setCurrency(event.currentTarget.value as Currency)}
          value={currency}
        >
          {currencyCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Prezentacja ceny</span>
        <select
          onChange={(event) =>
            setPresentation(event.currentTarget.value as Estimation["pricing"]["presentation"])
          }
          value={presentation}
        >
          <option value="range">Przedział min–max</option>
          <option value="from">Cena od</option>
          <option value="exact">Dokładna cena</option>
        </select>
      </label>
      <MoneyInput
        currency={currency}
        label="Zaokrąglenie"
        onChange={setRounding}
        value={rounding}
      />
      {!valid && (minimum || maximum) ? (
        <p className="builder-field-error">
          <PanelIcon name="warning" /> Sprawdź zakres i zaokrąglenie. Tryb dokładny wymaga równych
          kwot.
        </p>
      ) : null}
      <button className="panel-primary-button" disabled={!valid} type="submit">
        Włącz wycenę i scoring
      </button>
    </form>
  );
}

function PricingSettings({
  activeRule,
  document,
  estimation,
  onActiveRuleChange,
  onChange,
}: Readonly<{
  activeRule: PricingRule | undefined;
  document: FlowDocument;
  estimation: Estimation;
  onActiveRuleChange: (id: string | null) => void;
  onChange: (update: (current: Estimation) => Estimation, group?: string) => void;
}>) {
  const pricing = estimation.pricing;
  const exactCompatible =
    pricing.baseMinMinor === pricing.baseMaxMinor &&
    pricing.rules.every(
      (rule) =>
        (rule.operation.type !== "add" || rule.operation.minMinor === rule.operation.maxMinor) &&
        (rule.operation.type !== "add_per_unit" ||
          rule.operation.minPerUnitMinor === rule.operation.maxPerUnitMinor),
    );

  if (activeRule) {
    const ruleIndex = pricing.rules.findIndex((rule) => rule.id === activeRule.id);
    const updateRule = (rule: PricingRule, group?: string) =>
      onChange(
        (current) => ({
          ...current,
          pricing: {
            ...current.pricing,
            rules: current.pricing.rules.map((item) => (item.id === activeRule.id ? rule : item)),
          },
        }),
        group,
      );
    return (
      <div className="estimation-settings">
        <RuleHeader
          count={pricing.rules.length}
          index={ruleIndex}
          label="Reguła ceny"
          onMove={(delta) =>
            onChange((current) => ({
              ...current,
              pricing: {
                ...current.pricing,
                rules: moveItem(current.pricing.rules, ruleIndex, delta),
              },
            }))
          }
          onRemove={() => {
            onChange((current) => ({
              ...current,
              pricing: {
                ...current.pricing,
                rules: current.pricing.rules.filter((rule) => rule.id !== activeRule.id),
              },
            }));
            onActiveRuleChange(
              pricing.rules[ruleIndex + 1]?.id ?? pricing.rules[ruleIndex - 1]?.id ?? null,
            );
          }}
        />
        <label>
          <span>Nazwa wewnętrzna</span>
          <input
            maxLength={160}
            onChange={(event) =>
              updateRule(
                { ...activeRule, label: event.currentTarget.value },
                `pricing-rule-label:${activeRule.id}`,
              )
            }
            value={activeRule.label}
          />
        </label>
        <ConditionEditor
          condition={activeRule.when}
          document={document}
          idPrefix={`pricing-${activeRule.id}`}
          onChange={(when) => updateRule({ ...activeRule, when })}
        />
        <label>
          <span>Operacja</span>
          <select
            onChange={(event) => {
              const type = event.currentTarget.value as PricingRule["operation"]["type"];
              const numberStep = document.steps.find((step) => step.type === "number");
              const operation: PricingRule["operation"] =
                type === "multiply"
                  ? { basisPoints: 10_000, type }
                  : type === "add_per_unit" && numberStep
                    ? {
                        maxPerUnitMinor: 0,
                        minPerUnitMinor: 0,
                        quantityStepKey: numberStep.key,
                        type,
                      }
                    : { maxMinor: 0, minMinor: 0, type: "add" };
              updateRule({ ...activeRule, operation });
            }}
            value={activeRule.operation.type}
          >
            <option value="add">Dodaj kwotę</option>
            <option value="multiply">Pomnóż cenę</option>
            <option
              disabled={!document.steps.some((step) => step.type === "number")}
              value="add_per_unit"
            >
              Dodaj stawkę za jednostkę
            </option>
          </select>
        </label>
        <PricingOperationEditor
          currency={pricing.currency}
          exact={pricing.presentation === "exact"}
          onChange={(operation) => updateRule({ ...activeRule, operation })}
          operation={activeRule.operation}
          steps={document.steps}
        />
      </div>
    );
  }

  return (
    <div className="estimation-settings">
      <section className="estimation-settings__section-heading">
        <h3>Cena bazowa</h3>
        <p>Kwoty są przechowywane jako całkowite jednostki minor i liczone ponownie na serwerze.</p>
      </section>
      <fieldset className="estimation-settings__grid">
        <legend>Zakres bazowy</legend>
        <MajorMoneyInput
          currency={pricing.currency}
          label="Minimum"
          minor={pricing.baseMinMinor}
          onChange={(baseMinMinor) =>
            onChange(
              (current) => ({
                ...current,
                pricing: {
                  ...current.pricing,
                  baseMinMinor,
                  baseMaxMinor:
                    current.pricing.presentation === "exact"
                      ? baseMinMinor
                      : Math.max(baseMinMinor, current.pricing.baseMaxMinor),
                },
              }),
              "pricing-base-min",
            )
          }
        />
        <MajorMoneyInput
          currency={pricing.currency}
          label="Maksimum"
          minor={pricing.baseMaxMinor}
          onChange={(baseMaxMinor) =>
            onChange(
              (current) => ({
                ...current,
                pricing: {
                  ...current.pricing,
                  baseMaxMinor,
                  baseMinMinor:
                    current.pricing.presentation === "exact"
                      ? baseMaxMinor
                      : Math.min(baseMaxMinor, current.pricing.baseMinMinor),
                },
              }),
              "pricing-base-max",
            )
          }
        />
      </fieldset>
      <label>
        <span>Waluta</span>
        <select
          onChange={(event) => {
            const currency = event.currentTarget.value as Currency;
            onChange((current) => convertEstimationCurrency(current, currency));
          }}
          value={pricing.currency}
        >
          {currencyCodes.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <small>Zmiana waluty zachowuje wartości główne i przelicza jednostki minor.</small>
      </label>
      <label>
        <span>Sposób prezentacji</span>
        <select
          onChange={(event) => {
            const presentation = event.currentTarget.value as Estimation["pricing"]["presentation"];
            onChange((current) => ({
              ...current,
              pricing: {
                ...current.pricing,
                presentation,
              },
            }));
          }}
          value={pricing.presentation}
        >
          <option value="range">Przedział min–max</option>
          <option value="from">Cena od</option>
          <option disabled={!exactCompatible} value="exact">
            Dokładna cena
          </option>
        </select>
        {!exactCompatible ? (
          <small>Tryb dokładny będzie dostępny po zrównaniu wszystkich zakresów.</small>
        ) : null}
      </label>
      <MajorMoneyInput
        currency={pricing.currency}
        label="Zaokrąglenie wyniku"
        maximumMinor={1_000_000}
        minimumMinor={1}
        minor={pricing.roundingIncrementMinor}
        onChange={(roundingIncrementMinor) =>
          onChange(
            (current) => ({
              ...current,
              pricing: { ...current.pricing, roundingIncrementMinor },
            }),
            "pricing-rounding",
          )
        }
      />
    </div>
  );
}

function PricingOperationEditor({
  currency,
  exact,
  onChange,
  operation,
  steps,
}: Readonly<{
  currency: Currency;
  exact: boolean;
  onChange: (operation: PricingRule["operation"]) => void;
  operation: PricingRule["operation"];
  steps: readonly FlowStep[];
}>) {
  if (operation.type === "multiply") {
    return (
      <label>
        <span>Mnożnik w procentach</span>
        <input
          max={10_000}
          min={0.01}
          onChange={(event) => {
            const percentage = event.currentTarget.valueAsNumber;
            if (!Number.isFinite(percentage)) return;
            onChange({
              basisPoints: Math.max(1, Math.min(1_000_000, Math.round(percentage * 100))),
              type: "multiply",
            });
          }}
          step="0.01"
          type="number"
          value={operation.basisPoints / 100}
        />
        <small>100% zachowuje cenę, 120% zwiększa ją o 20%.</small>
      </label>
    );
  }
  if (operation.type === "add_per_unit") {
    const numberSteps = steps.filter((step) => step.type === "number");
    return (
      <>
        <label>
          <span>Pytanie z ilością</span>
          <select
            onChange={(event) =>
              onChange({ ...operation, quantityStepKey: event.currentTarget.value })
            }
            value={operation.quantityStepKey}
          >
            {numberSteps.map((step) => (
              <option key={step.key} value={step.key}>
                {step.title}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="estimation-settings__grid">
          <legend>Stawka za jednostkę</legend>
          <MajorMoneyInput
            currency={currency}
            label="Minimum"
            minor={operation.minPerUnitMinor}
            onChange={(minPerUnitMinor) =>
              onChange({
                ...operation,
                minPerUnitMinor,
                maxPerUnitMinor: exact
                  ? minPerUnitMinor
                  : Math.max(minPerUnitMinor, operation.maxPerUnitMinor),
              })
            }
          />
          <MajorMoneyInput
            currency={currency}
            label="Maksimum"
            minor={operation.maxPerUnitMinor}
            onChange={(maxPerUnitMinor) =>
              onChange({
                ...operation,
                maxPerUnitMinor,
                minPerUnitMinor: exact
                  ? maxPerUnitMinor
                  : Math.min(maxPerUnitMinor, operation.minPerUnitMinor),
              })
            }
          />
        </fieldset>
      </>
    );
  }
  return (
    <fieldset className="estimation-settings__grid">
      <legend>Dodawana kwota</legend>
      <MajorMoneyInput
        currency={currency}
        label="Minimum"
        minor={operation.minMinor}
        onChange={(minMinor) =>
          onChange({
            ...operation,
            minMinor,
            maxMinor: exact ? minMinor : Math.max(minMinor, operation.maxMinor),
          })
        }
      />
      <MajorMoneyInput
        currency={currency}
        label="Maksimum"
        minor={operation.maxMinor}
        onChange={(maxMinor) =>
          onChange({
            ...operation,
            maxMinor,
            minMinor: exact ? maxMinor : Math.min(maxMinor, operation.minMinor),
          })
        }
      />
    </fieldset>
  );
}

function ScoringSettings({
  activeRule,
  document,
  estimation,
  onActiveRuleChange,
  onChange,
}: Readonly<{
  activeRule: ScoringRule | undefined;
  document: FlowDocument;
  estimation: Estimation;
  onActiveRuleChange: (id: string | null) => void;
  onChange: (update: (current: Estimation) => Estimation, group?: string) => void;
}>) {
  const scoring = estimation.scoring;
  if (activeRule) {
    const ruleIndex = scoring.rules.findIndex((rule) => rule.id === activeRule.id);
    const updateRule = (rule: ScoringRule, group?: string) =>
      onChange(
        (current) => ({
          ...current,
          scoring: {
            ...current.scoring,
            rules: current.scoring.rules.map((item) => (item.id === activeRule.id ? rule : item)),
          },
        }),
        group,
      );
    return (
      <div className="estimation-settings">
        <RuleHeader
          count={scoring.rules.length}
          index={ruleIndex}
          label="Reguła scoringu"
          onMove={(delta) =>
            onChange((current) => ({
              ...current,
              scoring: {
                ...current.scoring,
                rules: moveItem(current.scoring.rules, ruleIndex, delta),
              },
            }))
          }
          onRemove={() => {
            onChange((current) => ({
              ...current,
              scoring: {
                ...current.scoring,
                rules: current.scoring.rules.filter((rule) => rule.id !== activeRule.id),
              },
            }));
            onActiveRuleChange(
              scoring.rules[ruleIndex + 1]?.id ?? scoring.rules[ruleIndex - 1]?.id ?? null,
            );
          }}
        />
        <label>
          <span>Nazwa wewnętrzna</span>
          <input
            maxLength={160}
            onChange={(event) =>
              updateRule(
                { ...activeRule, label: event.currentTarget.value },
                `scoring-rule-label:${activeRule.id}`,
              )
            }
            value={activeRule.label}
          />
        </label>
        <ConditionEditor
          condition={activeRule.when}
          document={document}
          idPrefix={`scoring-${activeRule.id}`}
          onChange={(when) => updateRule({ ...activeRule, when })}
        />
        <label>
          <span>Punkty</span>
          <input
            max={100}
            min={-100}
            onChange={(event) => {
              const points = event.currentTarget.valueAsNumber;
              if (Number.isFinite(points))
                updateRule({
                  ...activeRule,
                  points: Math.max(-100, Math.min(100, Math.round(points))),
                });
            }}
            type="number"
            value={activeRule.points}
          />
          <small>
            Wartość dodatnia zwiększa score, ujemna go obniża. Wynik zawsze mieści się w 0–100.
          </small>
        </label>
      </div>
    );
  }

  return (
    <div className="estimation-settings">
      <section className="estimation-settings__section-heading">
        <span className="panel-status panel-status--neutral">Prywatne</span>
        <h3>Baza i kategorie</h3>
        <p>Score i etykieta kategorii są dostępne dla zespołu, ale nigdy w publicznym wyniku.</p>
      </section>
      <label>
        <span>Punkty początkowe</span>
        <input
          max={100}
          min={0}
          onChange={(event) => {
            const initialPoints = event.currentTarget.valueAsNumber;
            if (Number.isFinite(initialPoints))
              onChange(
                (current) => ({
                  ...current,
                  scoring: {
                    ...current.scoring,
                    initialPoints: Math.max(0, Math.min(100, Math.round(initialPoints))),
                  },
                }),
                "scoring-initial",
              );
          }}
          type="number"
          value={scoring.initialPoints}
        />
      </label>
      <fieldset className="estimation-categories">
        <legend>Kategorie wyniku</legend>
        {scoring.categories.map((category, index) => {
          const previous = scoring.categories[index - 1];
          const next = scoring.categories[index + 1];
          return (
            <div className="estimation-categories__row" key={category.key}>
              <input
                aria-label={`Nazwa kategorii ${index + 1}`}
                maxLength={120}
                onChange={(event) => {
                  const label = event.currentTarget.value;
                  onChange(
                    (current) => ({
                      ...current,
                      scoring: {
                        ...current.scoring,
                        categories: current.scoring.categories.map((item) =>
                          item.key === category.key ? { ...item, label } : item,
                        ),
                      },
                    }),
                    `scoring-category-label:${category.key}`,
                  );
                }}
                value={category.label}
              />
              <label>
                <span>od</span>
                <input
                  aria-label={`Próg kategorii ${index + 1}`}
                  disabled={index === 0}
                  max={(next?.minPoints ?? 101) - 1}
                  min={(previous?.minPoints ?? -1) + 1}
                  onChange={(event) => {
                    const raw = event.currentTarget.valueAsNumber;
                    if (!Number.isFinite(raw) || index === 0) return;
                    const minPoints = Math.max(
                      (previous?.minPoints ?? -1) + 1,
                      Math.min((next?.minPoints ?? 101) - 1, Math.round(raw)),
                    );
                    onChange((current) => ({
                      ...current,
                      scoring: {
                        ...current.scoring,
                        categories: current.scoring.categories.map((item) =>
                          item.key === category.key ? { ...item, minPoints } : item,
                        ),
                      },
                    }));
                  }}
                  type="number"
                  value={category.minPoints}
                />
                <span>pkt</span>
              </label>
              <button
                aria-label={`Usuń kategorię ${category.label}`}
                className="panel-icon-action"
                disabled={index === 0 || scoring.categories.length === 1}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    scoring: {
                      ...current.scoring,
                      categories: current.scoring.categories.filter(
                        (item) => item.key !== category.key,
                      ),
                    },
                  }))
                }
                type="button"
              >
                ×
              </button>
            </div>
          );
        })}
        <button
          className="panel-secondary-button"
          disabled={
            scoring.categories.length >= 10 || (scoring.categories.at(-1)?.minPoints ?? 100) >= 100
          }
          onClick={() =>
            onChange((current) => {
              const lastThreshold = current.scoring.categories.at(-1)?.minPoints ?? 0;
              const key = createUniqueCategoryKey(current);
              return {
                ...current,
                scoring: {
                  ...current.scoring,
                  categories: [
                    ...current.scoring.categories,
                    {
                      key,
                      label: `Kategoria ${current.scoring.categories.length + 1}`,
                      minPoints: Math.min(100, lastThreshold + 10),
                    },
                  ],
                },
              };
            })
          }
          type="button"
        >
          ＋ Dodaj kategorię
        </button>
      </fieldset>
    </div>
  );
}

function ResultSettings({
  document,
  onDocumentChange,
}: Readonly<{
  document: FlowDocument;
  onDocumentChange: (update: SetStateAction<FlowDocument>, group?: string) => void;
}>) {
  return (
    <div className="estimation-settings result-settings">
      <label>
        <span>Nagłówek wyniku</span>
        <input
          maxLength={240}
          onChange={(event) => {
            const headline = event.currentTarget.value;
            onDocumentChange(
              (current) => ({
                ...current,
                result: { ...current.result, headline },
              }),
              "result-headline",
            );
          }}
          value={document.result.headline}
        />
        <small>{document.result.headline.length}/240</small>
      </label>
      <label>
        <span>Sposób zakończenia</span>
        <select
          onChange={(event) => {
            const mode = event.currentTarget.value as FlowDocument["result"]["mode"];
            onDocumentChange((current) => ({
              ...current,
              result: {
                ...current.result,
                mode,
              },
            }));
          }}
          value={document.result.mode}
        >
          <option value="consultation">Pokaż cenę i zaproś do konsultacji</option>
          <option value="no_price">Bez ceny — zaproś do konsultacji</option>
        </select>
        <small>
          Tryb „bez ceny” nie usuwa konfiguracji; publiczny wynik po prostu jej nie ujawnia.
        </small>
      </label>
      <label>
        <span>Zastrzeżenie</span>
        <textarea
          maxLength={800}
          onChange={(event) => {
            const disclaimer = event.currentTarget.value;
            onDocumentChange(
              (current) => ({
                ...current,
                result: { ...current.result, disclaimer },
              }),
              "result-disclaimer",
            );
          }}
          rows={5}
          value={document.result.disclaimer}
        />
        <small>{document.result.disclaimer.length}/800</small>
      </label>
      <label>
        <span>Następny krok</span>
        <input
          maxLength={120}
          onChange={(event) => {
            const nextStepLabel = event.currentTarget.value;
            onDocumentChange(
              (current) => ({
                ...current,
                result: { ...current.result, nextStepLabel },
              }),
              "result-next-step",
            );
          }}
          value={document.result.nextStepLabel}
        />
        <small>{document.result.nextStepLabel.length}/120</small>
      </label>
    </div>
  );
}

function ConditionEditor({
  condition,
  document,
  idPrefix,
  onChange,
}: Readonly<{
  condition: EstimationCondition;
  document: FlowDocument;
  idPrefix: string;
  onChange: (condition: EstimationCondition) => void;
}>) {
  const step =
    document.steps.find((candidate) => candidate.key === condition.stepKey) ?? document.steps[0]!;
  return (
    <fieldset className="estimation-condition">
      <legend>Kiedy zastosować</legend>
      <label htmlFor={`${idPrefix}-step`}>
        <span>Pytanie</span>
        <select
          id={`${idPrefix}-step`}
          onChange={(event) =>
            onChange({ operator: "answered", stepKey: event.currentTarget.value })
          }
          value={condition.stepKey}
        >
          {document.steps.map((candidate) => (
            <option key={candidate.key} value={candidate.key}>
              {candidate.title}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${idPrefix}-operator`}>
        <span>Warunek</span>
        <select
          id={`${idPrefix}-operator`}
          onChange={(event) => {
            const operator = event.currentTarget.value as EstimationCondition["operator"];
            onChange(
              operator === "answered"
                ? { operator, stepKey: step.key }
                : { operator, stepKey: step.key, value: defaultConditionValue(step) },
            );
          }}
          value={condition.operator}
        >
          <option value="answered">ma odpowiedź</option>
          <option value="equals">jest równe</option>
          <option value="not_equals">nie jest równe</option>
          <option disabled={step.type !== "multiple_choice"} value="includes">
            zawiera
          </option>
        </select>
      </label>
      {condition.operator !== "answered" ? (
        <ConditionValueInput
          condition={condition}
          id={`${idPrefix}-value`}
          onChange={(value) => onChange({ ...condition, value })}
          step={step}
        />
      ) : null}
    </fieldset>
  );
}

function ConditionValueInput({
  condition,
  id,
  onChange,
  step,
}: Readonly<{
  condition: EstimationCondition;
  id: string;
  onChange: (value: boolean | number | string) => void;
  step: FlowStep;
}>) {
  if (step.options.length > 0) {
    return (
      <label htmlFor={id}>
        <span>Odpowiedź</span>
        <select
          id={id}
          onChange={(event) => onChange(event.currentTarget.value)}
          value={String(condition.value ?? step.options[0]!.key)}
        >
          {step.options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (step.type === "yes_no") {
    return (
      <label htmlFor={id}>
        <span>Odpowiedź</span>
        <select
          id={id}
          onChange={(event) => onChange(event.currentTarget.value === "true")}
          value={String(condition.value ?? false)}
        >
          <option value="true">Tak</option>
          <option value="false">Nie</option>
        </select>
      </label>
    );
  }
  if (step.type === "budget" || step.type === "number") {
    return (
      <label htmlFor={id}>
        <span>Wartość</span>
        <input
          id={id}
          onChange={(event) => {
            const value = event.currentTarget.valueAsNumber;
            if (Number.isFinite(value)) onChange(value);
          }}
          type="number"
          value={typeof condition.value === "number" ? condition.value : 0}
        />
      </label>
    );
  }
  return (
    <label htmlFor={id}>
      <span>Wartość</span>
      <input
        id={id}
        maxLength={500}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={String(condition.value ?? "")}
      />
    </label>
  );
}

function RuleHeader({
  count,
  index,
  label,
  onMove,
  onRemove,
}: Readonly<{
  count: number;
  index: number;
  label: string;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}>) {
  return (
    <div className="estimation-settings__rule-header">
      <div>
        <small>{label}</small>
        <strong>
          {index + 1} z {count}
        </strong>
      </div>
      <div>
        <button
          aria-label="Przenieś regułę wyżej"
          className="panel-icon-action"
          disabled={index <= 0}
          onClick={() => onMove(-1)}
          type="button"
        >
          ↑
        </button>
        <button
          aria-label="Przenieś regułę niżej"
          className="panel-icon-action"
          disabled={index >= count - 1}
          onClick={() => onMove(1)}
          type="button"
        >
          ↓
        </button>
        <button
          aria-label="Usuń regułę"
          className="panel-icon-action is-danger"
          onClick={onRemove}
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function MoneyInput({
  currency,
  label,
  onChange,
  value,
}: Readonly<{
  currency: Currency;
  label: string;
  onChange: (value: string) => void;
  value: string;
}>) {
  return (
    <label>
      <span>{label}</span>
      <span className="estimation-money-input">
        <input
          inputMode="decimal"
          min={0}
          onChange={(event) => onChange(event.currentTarget.value)}
          step={minorStep(currency)}
          type="number"
          value={value}
        />
        <span>{currency}</span>
      </span>
    </label>
  );
}

function MajorMoneyInput({
  currency,
  label,
  maximumMinor = maximumMinorAmount,
  minimumMinor = 0,
  minor,
  onChange,
}: Readonly<{
  currency: Currency;
  label: string;
  maximumMinor?: number;
  minimumMinor?: number;
  minor: number;
  onChange: (minor: number) => void;
}>) {
  const factor = currencyFactor(currency);
  return (
    <label>
      <span>{label}</span>
      <span className="estimation-money-input">
        <input
          inputMode="decimal"
          max={maximumMinor / factor}
          min={minimumMinor / factor}
          onChange={(event) => {
            const major = event.currentTarget.valueAsNumber;
            if (!Number.isFinite(major)) return;
            onChange(Math.max(minimumMinor, Math.min(maximumMinor, Math.round(major * factor))));
          }}
          step={1 / factor}
          type="number"
          value={minor / factor}
        />
        <span>{currency}</span>
      </span>
    </label>
  );
}

function areaTitle(area: Exclude<FlowBuilderArea, "form">): string {
  if (area === "pricing") return "Wycena";
  if (area === "scoring") return "Scoring";
  return "Wynik";
}

function areaDescription(area: Exclude<FlowBuilderArea, "form">): string {
  if (area === "pricing") return "Baza i uporządkowane reguły ceny";
  if (area === "scoring") return "Prywatna kwalifikacja 0–100";
  return "Publiczne zakończenie procesu";
}

function defaultConditionValue(step: FlowStep): boolean | number | string {
  if (step.options[0]) return step.options[0].key;
  if (step.type === "yes_no") return true;
  if (step.type === "budget" || step.type === "number") return 0;
  return "";
}

function createPricingRule(document: FlowDocument, estimation: Estimation): PricingRule {
  return {
    id: createUniqueRuleId("cena", estimation),
    label: "Nowa reguła ceny",
    operation: { maxMinor: 0, minMinor: 0, type: "add" },
    when: { operator: "answered", stepKey: document.steps[0]!.key },
  };
}

function createScoringRule(document: FlowDocument, estimation: Estimation): ScoringRule {
  return {
    id: createUniqueRuleId("punkty", estimation),
    label: "Nowa reguła scoringu",
    points: 0,
    when: { operator: "answered", stepKey: document.steps[0]!.key },
  };
}

function createUniqueRuleId(prefix: "cena" | "punkty", estimation: Estimation): string {
  const existing = new Set([
    ...estimation.pricing.rules.map((rule) => rule.id),
    ...estimation.scoring.rules.map((rule) => rule.id),
  ]);
  const base = `${prefix}_${Date.now().toString(36)}`;
  let candidate = base;
  let suffix = 2;
  while (existing.has(candidate)) candidate = `${base}_${suffix++}`;
  return candidate;
}

function createUniqueCategoryKey(estimation: Estimation): string {
  const existing = new Set(estimation.scoring.categories.map((category) => category.key));
  const base = `kategoria_${Date.now().toString(36)}`;
  let candidate = base;
  let suffix = 2;
  while (existing.has(candidate)) candidate = `${base}_${suffix++}`;
  return candidate;
}

function moveItem<Item>(items: readonly Item[], index: number, delta: -1 | 1): Item[] {
  const destination = index + delta;
  if (index < 0 || destination < 0 || destination >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item !== undefined) next.splice(destination, 0, item);
  return next;
}

function pricingOperationLabel(rule: PricingRule): string {
  if (rule.operation.type === "add") return "Dodaj kwotę";
  if (rule.operation.type === "multiply")
    return `Pomnóż przez ${rule.operation.basisPoints / 10_000}`;
  return "Stawka za jednostkę";
}

function currencyFactor(currency: Currency): number {
  const digits =
    new Intl.NumberFormat("pl-PL", { currency, style: "currency" }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  return 10 ** digits;
}

function minorStep(currency: Currency): string {
  return String(1 / currencyFactor(currency));
}

function parseMajorAmount(value: string, currency: Currency): number | null {
  if (!/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const normalized = Number(value.replace(",", "."));
  if (!Number.isFinite(normalized) || normalized < 0) return null;
  const minor = Math.round(normalized * currencyFactor(currency));
  return Number.isSafeInteger(minor) && minor <= maximumMinorAmount ? minor : null;
}

function convertEstimationCurrency(estimation: Estimation, currency: Currency): Estimation {
  if (estimation.pricing.currency === currency) return estimation;
  const sourceFactor = currencyFactor(estimation.pricing.currency);
  const targetFactor = currencyFactor(currency);
  const convert = (minor: number, maximum = maximumMinorAmount) =>
    Math.max(0, Math.min(maximum, Math.round((minor / sourceFactor) * targetFactor)));
  return {
    ...estimation,
    pricing: {
      ...estimation.pricing,
      baseMaxMinor: convert(estimation.pricing.baseMaxMinor),
      baseMinMinor: convert(estimation.pricing.baseMinMinor),
      currency,
      roundingIncrementMinor: Math.max(
        1,
        convert(estimation.pricing.roundingIncrementMinor, 1_000_000),
      ),
      rules: estimation.pricing.rules.map((rule) => {
        if (rule.operation.type === "add") {
          return {
            ...rule,
            operation: {
              ...rule.operation,
              maxMinor: convert(rule.operation.maxMinor),
              minMinor: convert(rule.operation.minMinor),
            },
          };
        }
        if (rule.operation.type === "add_per_unit") {
          return {
            ...rule,
            operation: {
              ...rule.operation,
              maxPerUnitMinor: convert(rule.operation.maxPerUnitMinor),
              minPerUnitMinor: convert(rule.operation.minPerUnitMinor),
            },
          };
        }
        return rule;
      }),
    },
  };
}

function formatPreviewPrice(minor: number, currency: Currency): string {
  return new Intl.NumberFormat("pl-PL", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(minor / currencyFactor(currency));
}
