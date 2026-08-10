import type { WidgetManifest } from "./contracts.js";

const scriptSource = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const scriptId = "kwotum-turnstile-script";

type TurnstileWidgetId = string;

type TurnstileApi = Readonly<{
  execute(widgetId: TurnstileWidgetId): void;
  remove(widgetId: TurnstileWidgetId): void;
  render(
    container: HTMLElement,
    options: Readonly<{
      action: string;
      appearance: "interaction-only";
      callback(token: string): void;
      "error-callback"(): boolean;
      execution: "execute";
      "expired-callback"(): void;
      retry: "never";
      "response-field": false;
      sitekey: string;
      "timeout-callback"(): void;
      "unsupported-callback"(): void;
    }>,
  ): TurnstileWidgetId;
}>;

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const timeout = window.setTimeout(() => {
      loading = null;
      script.remove();
      reject(new Error("Weryfikacja bezpieczeństwa nie odpowiedziała. Spróbuj ponownie."));
    }, 15_000);
    const finish = (): void => {
      window.clearTimeout(timeout);
      if (window.turnstile) resolve(window.turnstile);
      else {
        loading = null;
        reject(new Error("Nie udało się uruchomić weryfikacji bezpieczeństwa."));
      }
    };
    const fail = (): void => {
      window.clearTimeout(timeout);
      loading = null;
      script.remove();
      reject(new Error("Nie udało się uruchomić weryfikacji bezpieczeństwa."));
    };
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });
    if (!existing) {
      script.id = scriptId;
      script.src = scriptSource;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });
  return loading;
}

export async function requestTurnstileToken(
  container: HTMLElement,
  challenge: NonNullable<WidgetManifest["challenge"]>,
): Promise<string> {
  const turnstile = await loadTurnstile();
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const widget: { id: TurnstileWidgetId | undefined } = { id: undefined };
    const remove = (): void => {
      queueMicrotask(() => {
        if (widget.id) turnstile.remove(widget.id);
      });
    };
    const succeed = (token: string): void => {
      if (settled) return;
      settled = true;
      remove();
      resolve(token);
    };
    const fail = (message: string): void => {
      if (settled) return;
      settled = true;
      remove();
      reject(new Error(message));
    };
    widget.id = turnstile.render(container, {
      action: challenge.action,
      appearance: challenge.appearance,
      callback: succeed,
      "error-callback": () => {
        fail("Nie udało się potwierdzić bezpieczeństwa. Spróbuj ponownie.");
        return true;
      },
      execution: "execute",
      "expired-callback": () => fail("Potwierdzenie bezpieczeństwa wygasło. Spróbuj ponownie."),
      retry: "never",
      "response-field": false,
      sitekey: challenge.siteKey,
      "timeout-callback": () =>
        fail("Weryfikacja bezpieczeństwa przekroczyła limit czasu. Spróbuj ponownie."),
      "unsupported-callback": () =>
        fail("Ta przeglądarka nie obsługuje weryfikacji bezpieczeństwa."),
    });
    turnstile.execute(widget.id);
  });
}
