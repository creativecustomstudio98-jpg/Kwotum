"use client";

import type { WidgetManifestContract } from "@wyceno/validation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

type PreviewElement = HTMLElement & {
  previewAssetUrls: Readonly<Record<string, string>>;
  previewManifest: WidgetManifestContract | null;
};

type PreviewDevice = "desktop" | "mobile";
const previewDevices: readonly PreviewDevice[] = ["desktop", "mobile"];

export function FlowPreview({
  assetUrls = {},
  manifest,
}: Readonly<{
  assetUrls?: Readonly<Record<string, string>>;
  manifest: WidgetManifestContract;
}>) {
  const host = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [loaderFailed, setLoaderFailed] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    setLoaderFailed(false);
    let script = document.querySelector<HTMLScriptElement>('script[data-wyceno-loader="v1"]');
    if (!script) {
      script = document.createElement("script");
      script.dataset.wycenoLoader = "v1";
      script.src = "/widget/v1/loader.js";
      script.type = "module";
      document.head.append(script);
    }
    const fail = () => {
      if (cancelled) return;
      script?.remove();
      setLoaderFailed(true);
    };
    script.addEventListener("error", fail, { once: true });
    const timeout = window.setTimeout(fail, 12_000);
    const widget = document.createElement("wyceno-widget") as PreviewElement;
    widget.setAttribute("public-id", manifest.publicId);
    widget.setAttribute("mode", "inline");
    widget.setAttribute("preview", "");
    widget.previewAssetUrls = assetUrls;
    widget.previewManifest = manifest;
    container.replaceChildren(widget);
    void customElements.whenDefined("wyceno-widget").then(() => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      script?.removeEventListener("error", fail);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("error", fail);
      container.replaceChildren();
    };
  }, [assetUrls, manifest, restartKey]);

  const handleDeviceKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"].includes(event.key)) {
      return;
    }

    const currentDevice = event.currentTarget.dataset.previewDevice as PreviewDevice | undefined;
    const currentIndex = currentDevice ? previewDevices.indexOf(currentDevice) : -1;
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % previewDevices.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + previewDevices.length) % previewDevices.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = previewDevices.length - 1;

    const nextDevice = previewDevices[nextIndex];
    if (!nextDevice) return;
    event.preventDefault();
    setDevice(nextDevice);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-preview-device="${nextDevice}"]`)
      ?.focus();
  };

  return (
    <section className="flow-live-preview" aria-labelledby="flow-preview-title">
      <header className="flow-live-preview__header">
        <div>
          <p className="panel-topbar__eyebrow">Bezpieczny tryb testowy</p>
          <h2 id="flow-preview-title">Pełny podgląd klienta</h2>
          <p>Ten sam renderer co w hosted linku, bez zapisu sesji, leadów i analityki.</p>
        </div>
        <div className="flow-live-preview__tools">
          <div
            aria-label="Urządzenie podglądu"
            className="flow-live-preview__devices panel-segmented-track panel-segmented-track--compact"
            role="group"
          >
            <button
              aria-pressed={device === "desktop"}
              data-preview-device="desktop"
              onClick={() => setDevice("desktop")}
              onKeyDown={handleDeviceKeyDown}
              tabIndex={device === "desktop" ? 0 : -1}
              type="button"
            >
              Desktop
            </button>
            <button
              aria-pressed={device === "mobile"}
              data-preview-device="mobile"
              onClick={() => setDevice("mobile")}
              onKeyDown={handleDeviceKeyDown}
              tabIndex={device === "mobile" ? 0 : -1}
              type="button"
            >
              Telefon
            </button>
          </div>
          <button
            className="panel-secondary-button"
            onClick={() => setRestartKey((value) => value + 1)}
            type="button"
          >
            Zacznij od nowa
          </button>
        </div>
      </header>
      <div className={`flow-live-preview__stage is-${device}`}>
        {loaderFailed ? (
          <div className="flow-live-preview__error" role="alert">
            <strong>Nie udało się uruchomić podglądu</strong>
            <p>Sprawdź połączenie i wczytaj renderer ponownie.</p>
            <button
              className="panel-secondary-button"
              onClick={() => {
                setLoaderFailed(false);
                setRestartKey((value) => value + 1);
              }}
              type="button"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : (
          <div className="flow-live-preview__viewport" ref={host} />
        )}
      </div>
    </section>
  );
}
