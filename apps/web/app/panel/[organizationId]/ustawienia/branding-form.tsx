"use client";

import { Button, FieldMessage, FormField, Input, Select } from "@wyceno/ui";
import Image from "next/image";
import { useActionState, useMemo, useState, type CSSProperties } from "react";

import type { FlowMediaAsset } from "../../../../lib/flows/media-assets";
import { updateBrandingAction, type OrganizationSettingsActionState } from "./actions";

const initialState = { error: null, success: null } satisfies OrganizationSettingsActionState;

function contrastColor(accent: string): "#000000" | "#FFFFFF" {
  const value = /^#[0-9A-Fa-f]{6}$/u.test(accent) ? accent.slice(1) : "0B6048";
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return red * 299 + green * 587 + blue * 114 >= 150_000 ? "#000000" : "#FFFFFF";
}

export function BrandingForm({
  accentColor,
  assets,
  displayName,
  editable,
  logoAssetId,
  organizationId,
  organizationName,
}: Readonly<{
  accentColor: string | null;
  assets: readonly FlowMediaAsset[];
  displayName: string | null;
  editable: boolean;
  logoAssetId: string | null;
  organizationId: string;
  organizationName: string;
}>) {
  const [state, action, pending] = useActionState(updateBrandingAction, initialState);
  const [color, setColor] = useState(accentColor ?? "#0B6048");
  const [selectedLogo, setSelectedLogo] = useState(logoAssetId ?? "");
  const logo = useMemo(
    () => assets.find((asset) => asset.id === selectedLogo),
    [assets, selectedLogo],
  );
  const textColor = contrastColor(color);

  return (
    <form action={action} className="branding-settings-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <div
        className="branding-settings-form__preview"
        style={{ "--brand-preview": color, "--brand-preview-text": textColor } as CSSProperties}
      >
        <span className="branding-settings-form__mark">
          {logo ? (
            <Image
              alt="Podgląd wybranego logo"
              height={48}
              src={logo.previewUrl}
              unoptimized
              width={48}
            />
          ) : (
            organizationName.slice(0, 2).toUpperCase()
          )}
        </span>
        <span>
          <strong>{displayName || organizationName}</strong>
          <small>Przykładowy proces</small>
        </span>
      </div>
      <FormField
        hint="Pusta wartość użyje nazwy organizacji. Nazwa procesu pozostaje osobno."
        id="brand-display-name"
        label="Nazwa firmy w widżecie"
      >
        <Input
          defaultValue={displayName ?? ""}
          disabled={!editable}
          id="brand-display-name"
          maxLength={120}
          name="displayName"
          placeholder={organizationName}
        />
      </FormField>
      <div className="wy-field">
        <label className="wy-field__label" htmlFor="brand-accent-color">
          Kolor akcentu
        </label>
        <span className="branding-color-control">
          <input
            aria-label="Wybierz kolor akcentu"
            disabled={!editable}
            onChange={(event) => setColor(event.currentTarget.value.toUpperCase())}
            type="color"
            value={color}
          />
          <Input
            disabled={!editable}
            id="brand-accent-color"
            maxLength={7}
            name="accentColor"
            onChange={(event) => setColor(event.currentTarget.value.toUpperCase())}
            pattern="#[0-9A-Fa-f]{6}"
            value={color}
          />
        </span>
        <span className="wy-field__hint">
          Kolor tekstu ({textColor}) jest obliczany automatycznie; błędny kolor jest odrzucany.
        </span>
      </div>
      <FormField
        hint="Do widżetu trafia tylko przetworzony WebP z zasobu tej organizacji, nigdy zewnętrzny URL."
        id="brand-logo-asset"
        label="Logo z bezpiecznej biblioteki"
      >
        <Select
          disabled={!editable}
          id="brand-logo-asset"
          name="logoAssetId"
          onChange={(event) => setSelectedLogo(event.currentTarget.value)}
          value={selectedLogo}
        >
          <option value="">Bez logo — inicjały firmy</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="settings-form__actions branding-settings-form__actions">
        <Button disabled={!editable} loading={pending} loadingLabel="Zapisuję…" type="submit">
          Zapisz branding
        </Button>
        {state.error ? <FieldMessage tone="error">{state.error}</FieldMessage> : null}
        {state.success ? <FieldMessage tone="success">{state.success}</FieldMessage> : null}
      </div>
    </form>
  );
}
