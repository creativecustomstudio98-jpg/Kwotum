"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import styles from "./home-interactive-demo.module.css";

type AnswerKey = "budget" | "contact" | "dimensions" | "layout" | "project" | "timeline";
type ChoiceKey = Exclude<AnswerKey, "dimensions">;
type Answers = Record<AnswerKey, string>;
type Measurements = {
  height: string;
  long: string;
  short: string;
};

type ChoiceStep = {
  helper: string;
  key: ChoiceKey;
  legend: string;
  options: readonly string[];
  shortLabel: string;
  type: "choice";
};

type MeasurementStep = {
  helper: string;
  key: "dimensions";
  legend: string;
  shortLabel: string;
  type: "measurements";
};

type DemoStep = ChoiceStep | MeasurementStep;

const demoSteps: readonly DemoStep[] = [
  {
    helper: "W tym przykładzie przechodzisz proces przygotowany dla pracowni meblarskiej.",
    key: "project",
    legend: "Czego dotyczy planowana realizacja?",
    options: ["Kuchnia na wymiar", "Szafa lub garderoba", "Inna zabudowa meblowa"],
    shortLabel: "Typ projektu",
    type: "choice",
  },
  {
    helper: "Wybierz układ, który najlepiej opisuje planowaną zabudowę.",
    key: "layout",
    legend: "Jaki układ kuchni planujesz?",
    options: ["Układ L", "Układ U", "Zabudowa prosta"],
    shortLabel: "Układ kuchni",
    type: "choice",
  },
  {
    helper: "Nie muszą być dokładne. Możesz wpisać wartości orientacyjne albo wybrać „Nie wiem”.",
    key: "dimensions",
    legend: "Podaj przybliżone wymiary zabudowy.",
    shortLabel: "Wymiary",
    type: "measurements",
  },
  {
    helper: "Wystarczy orientacyjny przedział — na tym etapie nie składasz zamówienia.",
    key: "budget",
    legend: "Jaki budżet chcesz przeznaczyć?",
    options: ["25 000–35 000 zł", "35 000–50 000 zł", "Powyżej 50 000 zł"],
    shortLabel: "Budżet",
    type: "choice",
  },
  {
    helper: "Termin pomaga firmie ocenić dostępność i wskazać realny kolejny krok.",
    key: "timeline",
    legend: "Kiedy chcesz rozpocząć realizację?",
    options: ["Do 3 miesięcy", "3–6 miesięcy", "Później"],
    shortLabel: "Termin",
    type: "choice",
  },
  {
    helper: "Dane kontaktowe pojawiłyby się dopiero po pokazaniu wartości i podsumowania.",
    key: "contact",
    legend: "Jak firma ma odpowiedzieć na zapytanie?",
    options: ["Rozmowa telefoniczna", "Wiadomość e-mail", "Najpierw e-mail, potem telefon"],
    shortLabel: "Zdjęcia i kontakt",
    type: "choice",
  },
] as const;

const initialMeasurements: Measurements = {
  height: "260",
  long: "400",
  short: "280",
};

const initialAnswers: Answers = {
  budget: "",
  contact: "",
  dimensions: "około 8 mb zabudowy",
  layout: "Układ L",
  project: "Kuchnia na wymiar",
  timeline: "",
};

const demoIndustries = [
  ["Meble", "/branze/meble-na-wymiar"],
  ["Ogrodzenia", "/branze/ogrodzenia"],
  ["Strony", "/branze/strony-internetowe"],
  ["Klimatyzacja", "/branze/klimatyzacja"],
  ["Remonty", "/branze/remonty"],
] as const;

export function HomeInteractiveDemo() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(2);
  const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
  const [measurementsUnknown, setMeasurementsUnknown] = useState(false);
  const firstRender = useRef(true);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepLegendRef = useRef<HTMLLegendElement>(null);

  const isComplete = currentStep === demoSteps.length;
  const step = demoSteps[Math.min(currentStep, demoSteps.length - 1)]!;
  const selectedAnswer = isComplete ? "" : answers[step.key];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progress = isComplete ? 100 : ((currentStep + 1) / demoSteps.length) * 100;
  const score = isComplete ? 86 : 30 + answeredCount * 6;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (isComplete) {
      resultHeadingRef.current?.focus();
      return;
    }

    stepLegendRef.current?.focus();
  }, [currentStep, isComplete]);

  function chooseAnswer(key: ChoiceKey, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function updateMeasurement(key: keyof Measurements, value: string) {
    const nextMeasurements = { ...measurements, [key]: value };
    setMeasurements(nextMeasurements);
    setMeasurementsUnknown(false);
    setAnswers((current) => ({
      ...current,
      dimensions: formatMeasurements(nextMeasurements),
    }));
  }

  function toggleUnknownDimensions(checked: boolean) {
    setMeasurementsUnknown(checked);
    setAnswers((current) => ({
      ...current,
      dimensions: checked ? "Do ustalenia podczas pomiaru" : formatMeasurements(measurements),
    }));
  }

  function goBack() {
    setCurrentStep((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (!isComplete && answers[step.key]) {
      setCurrentStep((current) => Math.min(demoSteps.length, current + 1));
    }
  }

  function resetDemo() {
    setAnswers(initialAnswers);
    setMeasurements(initialMeasurements);
    setMeasurementsUnknown(false);
    setCurrentStep(2);
  }

  const liveMessage = isComplete
    ? "Gotowe. Sześć odpowiedzi zostało ułożonych w demonstracyjny brief."
    : selectedAnswer
      ? `Uzupełniono: ${step.shortLabel}. Możesz przejść dalej.`
      : `Krok ${currentStep + 1} z ${demoSteps.length}. ${step.legend}`;

  return (
    <section
      aria-label="Interaktywny, niezapisujący danych proces dla kuchni na wymiar"
      className={styles.demo}
    >
      <div className={styles.surface}>
        <header className={styles.toolbar}>
          <div className={styles.demoTitle}>
            <span aria-hidden="true" />
            <strong>Kuchnia na wymiar</strong>
            <small>Proces demonstracyjny</small>
          </div>

          <nav aria-label="Pełne procesy branżowe" className={styles.industryTabs}>
            {demoIndustries.map(([label, href], index) =>
              index === 0 ? (
                <span aria-current="page" className={styles.industryActive} key={href}>
                  {label}
                </span>
              ) : (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ),
            )}
          </nav>

          <div className={styles.demoStatus}>
            <span>Podgląd klienta</span>
            <i aria-hidden="true" />
            <strong>Aktywny</strong>
          </div>
        </header>

        <div className={styles.body}>
          <aside className={styles.stepRail}>
            <div className={styles.progressCaption}>
              <span>Postęp procesu</span>
              <strong>
                {isComplete ? demoSteps.length : currentStep + 1} z {demoSteps.length}
              </strong>
            </div>
            <div
              aria-label="Postęp przykładowego procesu"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={isComplete ? "Proces ukończony" : `Krok ${currentStep + 1} z 6`}
              className={styles.progressTrack}
              role="progressbar"
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <ol>
              {demoSteps.map((item, index) => {
                const isDone = isComplete || index < currentStep;
                const isActive = !isComplete && index === currentStep;

                return (
                  <li
                    className={`${isDone ? styles.stepDone : ""} ${
                      isActive ? styles.stepActive : ""
                    }`}
                    key={item.key}
                  >
                    <span>{index + 1}</span>
                    <span>
                      <strong>{item.shortLabel}</strong>
                      <small>
                        {answers[item.key] || (isActive ? "Aktualny krok" : "Nieuzupełnione")}
                      </small>
                    </span>
                    {isDone ? <span aria-hidden="true">✓</span> : null}
                  </li>
                );
              })}
            </ol>

            <p className={styles.help}>
              <span aria-hidden="true">ⓘ</span>
              Odpowiedzi możesz zmienić przed przejściem do kontaktu.
            </p>
          </aside>

          {isComplete ? (
            <DemoResult
              answers={answers}
              headingRef={resultHeadingRef}
              onBack={goBack}
              onReset={resetDemo}
            />
          ) : (
            <form
              className={styles.question}
              onSubmit={(event) => {
                event.preventDefault();
                goNext();
              }}
            >
              <div className={styles.questionTop}>
                <span>
                  Krok {currentStep + 1} z {demoSteps.length}
                </span>
                <small>Każda odpowiedź porządkuje brief dla firmy</small>
              </div>

              <fieldset aria-describedby={`demo-helper-${step.key}`} className={styles.fieldset}>
                <legend ref={stepLegendRef} tabIndex={-1}>
                  {step.legend}
                </legend>
                <p className={styles.helper} id={`demo-helper-${step.key}`}>
                  {step.helper}
                </p>

                {step.type === "measurements" ? (
                  <MeasurementFields
                    measurements={measurements}
                    onChange={updateMeasurement}
                    onUnknownChange={toggleUnknownDimensions}
                    unknown={measurementsUnknown}
                  />
                ) : (
                  <div className={styles.choices}>
                    {step.options.map((option) => {
                      const isSelected = selectedAnswer === option;

                      return (
                        <label
                          className={`${styles.choice} ${isSelected ? styles.choiceSelected : ""}`}
                          key={option}
                        >
                          <input
                            checked={isSelected}
                            name={step.key}
                            onChange={() => {
                              chooseAnswer(step.key, option);
                            }}
                            type="radio"
                            value={option}
                          />
                          <span>{option}</span>
                          <span aria-hidden="true">{isSelected ? "✓" : ""}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              {step.key === "dimensions" ? (
                <p className={styles.contextNote}>
                  <span aria-hidden="true">✓</span>
                  Na podstawie układu L i podanych wymiarów system szacuje około 8 mb zabudowy.
                </p>
              ) : null}

              <footer className={styles.questionActions}>
                <button className={styles.secondaryButton} onClick={goBack} type="button">
                  ← Wstecz
                </button>
                <button className={styles.primaryButton} disabled={!selectedAnswer} type="submit">
                  {getNextLabel(currentStep)}
                  <span aria-hidden="true">→</span>
                </button>
              </footer>
            </form>
          )}

          <DemoPreview
            answers={answers}
            currentKey={isComplete ? null : step.key}
            isComplete={isComplete}
            score={score}
          />
        </div>

        <p aria-atomic="true" aria-live="polite" className={styles.liveStatus}>
          {liveMessage}
        </p>
      </div>

      <footer className={styles.footnotes}>
        <span>
          <span aria-hidden="true">◷</span> Pełny proces trwa około 3 minut.
        </span>
        <span>
          <span aria-hidden="true">◇</span> To dane demonstracyjne — nic nie zostanie wysłane.
        </span>
      </footer>
    </section>
  );
}

function MeasurementFields({
  measurements,
  onChange,
  onUnknownChange,
  unknown,
}: {
  measurements: Measurements;
  onChange: (key: keyof Measurements, value: string) => void;
  onUnknownChange: (checked: boolean) => void;
  unknown: boolean;
}) {
  const fields = [
    ["long", "Dłuższy odcinek"],
    ["short", "Krótszy odcinek"],
    ["height", "Wysokość pomieszczenia"],
  ] as const;

  return (
    <>
      <div className={styles.measurements}>
        {fields.map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <span>
              <input
                disabled={unknown}
                inputMode="numeric"
                max="2000"
                min="0"
                onChange={(event) => {
                  onChange(key, event.target.value);
                }}
                type="number"
                value={measurements[key]}
              />
              <strong>cm</strong>
            </span>
          </label>
        ))}
      </div>
      <label className={styles.unknownLine}>
        <input
          checked={unknown}
          onChange={(event) => {
            onUnknownChange(event.target.checked);
          }}
          type="checkbox"
        />
        <span>Nie znam jeszcze dokładnych wymiarów</span>
      </label>
    </>
  );
}

function DemoPreview({
  answers,
  currentKey,
  isComplete,
  score,
}: {
  answers: Answers;
  currentKey: AnswerKey | null;
  isComplete: boolean;
  score: number;
}) {
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const hasEstimateInputs = Boolean(answers.budget && answers.timeline);

  return (
    <aside aria-label="Lead tworzony na żywo" className={styles.preview}>
      <header>
        <strong>Lead tworzony na żywo</strong>
        <span>
          {answeredCount} {answeredCount === 1 ? "odpowiedź" : "odpowiedzi"}
        </span>
      </header>

      <div className={styles.previewPerson}>
        <span aria-hidden="true">?</span>
        <span>
          <strong>Nowe zapytanie</strong>
          <small>Dane kontaktowe na końcu</small>
        </span>
      </div>

      <div className={styles.previewScore}>
        <strong>
          {score}
          <small>/100</small>
        </strong>
        <span>{isComplete ? "Dobre dopasowanie" : "Wstępne dopasowanie"}</span>
      </div>

      <dl className={styles.previewRows}>
        {demoSteps
          .filter((item) => item.key !== "contact")
          .map((item) => {
            const value = answers[item.key];
            const previewLabel =
              item.key === "project" ? "Zakres" : item.key === "layout" ? "Układ" : item.shortLabel;

            return (
              <div
                className={currentKey === item.key ? styles.previewRowActive : undefined}
                key={item.key}
              >
                <dt>{previewLabel}</dt>
                <dd className={value ? undefined : styles.previewEmpty}>
                  {value || "Jeszcze nie podano"}
                </dd>
              </div>
            );
          })}
      </dl>

      <div className={styles.estimate}>
        <span>Orientacyjny wynik</span>
        <strong>
          {hasEstimateInputs
            ? "Dane wystarczają do pokazania przykładowego wyniku"
            : "Pojawi się po podaniu budżetu i terminu"}
        </strong>
      </div>
    </aside>
  );
}

function DemoResult({
  answers,
  headingRef,
  onBack,
  onReset,
}: {
  answers: Answers;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.result}>
      <span aria-hidden="true" className={styles.resultCheck}>
        ✓
      </span>
      <p>Lead gotowy do oceny</p>
      <h3 ref={headingRef} tabIndex={-1}>
        Firma otrzymuje uporządkowany brief.
      </h3>
      <p>Zakres, wymiary, budżet, termin i preferencja kontaktu zostały zebrane przed rozmową.</p>
      <dl>
        <div>
          <dt>Zakres</dt>
          <dd>
            {answers.project} · {answers.layout}
          </dd>
        </div>
        <div>
          <dt>Wynik orientacyjny</dt>
          <dd>{answers.budget}</dd>
        </div>
        <div>
          <dt>Następny krok</dt>
          <dd>{answers.contact}</dd>
        </div>
      </dl>
      <div className={styles.resultActions}>
        <button className={styles.secondaryButton} onClick={onBack} type="button">
          ← Zmień ostatnią odpowiedź
        </button>
        <button className={styles.primaryButton} onClick={onReset} type="button">
          Przejdź ponownie
        </button>
      </div>
    </div>
  );
}

function formatMeasurements(measurements: Measurements) {
  if (Object.values(measurements).some((value) => !value)) {
    return "";
  }

  return `${measurements.long} × ${measurements.short} × ${measurements.height} cm`;
}

function getNextLabel(currentStep: number) {
  const nextStep = demoSteps[currentStep + 1];
  if (nextStep?.key === "contact") {
    return "Dalej: kontakt";
  }

  return nextStep
    ? `Dalej: ${nextStep.shortLabel.toLocaleLowerCase("pl-PL")}`
    : "Zobacz gotowy lead";
}
