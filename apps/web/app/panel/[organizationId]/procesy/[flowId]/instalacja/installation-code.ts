export type InstallationMode = "fullscreen" | "hosted" | "inline" | "popup";

export function installationCode(
  appOrigin: string,
  publicId: string,
  mode: InstallationMode,
): string {
  if (mode === "hosted") return `${appOrigin}/f/${publicId}`;
  const buttonLabel = mode === "popup" ? '\n  button-label="Rozpocznij wycenę"' : "";
  return `<script type="module" src="${appOrigin}/widget/v1/loader.js"></script>
<wyceno-widget
  public-id="${publicId}"
  api-base="${appOrigin}"
  mode="${mode}"${buttonLabel}
></wyceno-widget>`;
}
