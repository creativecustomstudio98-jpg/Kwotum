"use client";

import { useId, useState } from "react";

interface MarketingDemoProps {
  options?: readonly string[];
  question?: string;
  result?: string;
}

const defaultOptions = ["Meble na wymiar", "Ogrodzenie", "Strona internetowa"];

export function MarketingDemo({
  options = defaultOptions,
  question = "Czego dotyczy zapytanie?",
  result = "Zakres, termin i materiały są gotowe do weryfikacji przed rozmową.",
}: MarketingDemoProps) {
  const groupName = useId();
  const [selection, setSelection] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  return (
    <section aria-labelledby={`${groupName}-title`} className="marketing-demo">
      <div className="marketing-demo__bar">
        <span aria-hidden="true" className="marketing-demo__status" />
        <span>Interaktywny fragment demo · nie zapisuje danych</span>
      </div>
      <div className="marketing-demo__body">
        {!completed ? (
          <>
            <div className="marketing-demo__progress">
              <span>Krok 1 z 1</span>
              <progress aria-label="Postęp demonstracji" max="1" value="0.55" />
            </div>
            <fieldset className="marketing-demo__fieldset">
              <legend id={`${groupName}-title`}>{question}</legend>
              {options.map((option) => (
                <label className="marketing-demo__option" key={option}>
                  <input
                    checked={selection === option}
                    name={groupName}
                    onChange={() => setSelection(option)}
                    type="radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <button
              className="marketing-demo__button"
              disabled={!selection}
              onClick={() => setCompleted(true)}
              type="button"
            >
              Zobacz przykładowy brief
            </button>
          </>
        ) : (
          <div aria-live="polite" className="marketing-demo__result">
            <p className="wy-kicker marketing-eyebrow">Uporządkowany brief</p>
            <h3>{selection}</h3>
            <p>{result}</p>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>Gotowy do kontaktu</dd>
              </div>
              <div>
                <dt>Źródło</dt>
                <dd>Formularz na stronie</dd>
              </div>
            </dl>
            <button
              className="marketing-demo__reset"
              onClick={() => {
                setCompleted(false);
                setSelection(null);
              }}
              type="button"
            >
              Wypełnij demo ponownie
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
