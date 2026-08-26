"use client";

import type { FlowContextField, FlowContextSchema } from "@wyceno/validation";

function defaultField(index: number): FlowContextField {
  return {
    key: index === 1 ? "wybrany_wariant" : `wybrany_wariant_${index}`,
    label: "Wybrany wariant",
    mode: "confirm",
    required: false,
    type: "text",
  };
}

export function ContextConfigurationEditor({
  onChange,
  schema,
}: Readonly<{
  onChange: (schema: FlowContextSchema | undefined) => void;
  schema: FlowContextSchema | undefined;
}>) {
  const fields = schema?.fields ?? [];
  const updateField = (index: number, patch: Partial<FlowContextField>) => {
    onChange({
      fields: fields.map((field, fieldIndex) =>
        fieldIndex === index ? ({ ...field, ...patch } as FlowContextField) : field,
      ),
      schemaVersion: 1,
    });
  };

  return (
    <section aria-labelledby="context-editor-title" className="builder-context-editor">
      <div className="builder-context-editor__heading">
        <div>
          <h2 id="context-editor-title">Kontekst strony</h2>
          <p>Przenieś bezpieczny wybór z witryny do procesu, bez mieszania go z odpowiedziami.</p>
        </div>
        <button
          disabled={fields.length >= 8}
          onClick={() =>
            onChange({ fields: [...fields, defaultField(fields.length + 1)], schemaVersion: 1 })
          }
          type="button"
        >
          Dodaj pole
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="builder-context-editor__empty">
          Użyj tylko dla krótkich danych produktowych, np. modelu lub wariantu. Dane kontaktowe,
          cena, zgody i reguły kwalifikacji są odrzucane.
        </p>
      ) : (
        <div className="builder-context-editor__fields">
          {fields.map((field, index) => (
            <fieldset key={`${field.key}-${index}`}>
              <legend>Pole {index + 1}</legend>
              <label>
                <span>Etykieta</span>
                <input
                  maxLength={80}
                  onChange={(event) => updateField(index, { label: event.target.value })}
                  value={field.label}
                />
              </label>
              <label>
                <span>Klucz techniczny</span>
                <input
                  autoCapitalize="none"
                  maxLength={64}
                  onChange={(event) => updateField(index, { key: event.target.value })}
                  spellCheck={false}
                  value={field.key}
                />
              </label>
              <label>
                <span>Sposób użycia</span>
                <select
                  onChange={(event) => {
                    const mode = event.target.value as FlowContextField["mode"];
                    updateField(index, {
                      mode,
                      systemValue: mode === "system" ? (field.systemValue ?? "") : undefined,
                    });
                  }}
                  value={field.mode}
                >
                  <option value="confirm">Klient potwierdza</option>
                  <option value="informational">Tylko informacja</option>
                  <option value="system">Stała systemowa</option>
                </select>
              </label>
              <label>
                <span>Rodzaj wartości</span>
                <select
                  onChange={(event) => {
                    const type = event.target.value as FlowContextField["type"];
                    updateField(index, {
                      allowedValues: type === "enum" ? (field.allowedValues ?? [""]) : undefined,
                      type,
                    });
                  }}
                  value={field.type}
                >
                  <option value="text">Krótki tekst</option>
                  <option value="enum">Lista dozwolonych wartości</option>
                </select>
              </label>
              {field.type === "enum" ? (
                <label className="builder-context-editor__wide">
                  <span>Dozwolone wartości, oddzielone przecinkiem</span>
                  <input
                    onChange={(event) =>
                      updateField(index, {
                        allowedValues: event.target.value.split(",").map((value) => value.trim()),
                      })
                    }
                    value={field.allowedValues?.join(", ") ?? ""}
                  />
                </label>
              ) : null}
              {field.mode === "system" ? (
                <label className="builder-context-editor__wide">
                  <span>Stała wartość</span>
                  <input
                    maxLength={120}
                    onChange={(event) => updateField(index, { systemValue: event.target.value })}
                    value={field.systemValue ?? ""}
                  />
                </label>
              ) : (
                <label className="builder-context-editor__required">
                  <input
                    checked={field.required}
                    onChange={(event) => updateField(index, { required: event.target.checked })}
                    type="checkbox"
                  />
                  <span>Wymagane przy uruchomieniu</span>
                </label>
              )}
              <button
                className="builder-context-editor__remove"
                onClick={() => {
                  const next = fields.filter((_, fieldIndex) => fieldIndex !== index);
                  onChange(next.length ? { fields: next, schemaVersion: 1 } : undefined);
                }}
                type="button"
              >
                Usuń pole
              </button>
            </fieldset>
          ))}
        </div>
      )}
    </section>
  );
}
