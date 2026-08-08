"use client";

import type { WidgetManifestContract } from "@wyceno/validation";
import { useEffect, useRef, useState } from "react";

type PreviewElement = HTMLElement & { previewManifest: WidgetManifestContract | null };

export function FlowPreview({ manifest }: Readonly<{ manifest: WidgetManifestContract }>) {
  const host = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
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
    void customElements.whenDefined("wyceno-widget").then(() => {
      if (cancelled || !host.current) return;
      window.clearTimeout(timeout);
      script?.removeEventListener("error", fail);
      const widget = document.createElement("wyceno-widget") as PreviewElement;
      widget.setAttribute("public-id", manifest.publicId);
      widget.setAttribute("mode", "inline");
      widget.setAttribute("preview", "");
      widget.previewManifest = manifest;
      host.current.replaceChildren(widget);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      script?.removeEventListener("error", fail);
      container.replaceChildren();
    };
  }, [manifest, restartKey]);

  return (
    <section className="flow-live-preview" aria-labelledby="flow-preview-title">
      <header className="flow-live-preview__header">
        <div>
          <p className="panel-topbar__eyebrow">Bezpieczny tryb testowy</p>
          <h2 id="flow-preview-title">Pełny podgląd klienta</h2>
          <p>Ten sam renderer co w hosted linku, bez zapisu sesji, leadów i analityki.</p>
        </div>
        <div className="flow-live-preview__tools">
          <div aria-label="Urządzenie podglądu" className="flow-live-preview__devices" role="group">
            <button
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
              type="button"
            >
              Desktop
            </button>
            <button
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
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
