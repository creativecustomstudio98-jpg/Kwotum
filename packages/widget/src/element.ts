import { HttpWidgetApi } from "./api.js";
import type { WidgetAnswer, WidgetContextInput, WidgetManifest, WidgetStep } from "./contracts.js";
import { WidgetSessionController, type WidgetState } from "./controller.js";
import { createPresentationIcon } from "./presentation-icon.js";
import { PreviewWidgetApi } from "./preview.js";
import { LocalWidgetStorage, MemoryWidgetStorage, widgetStorageKey } from "./storage.js";
import { requestTurnstileToken } from "./turnstile.js";

const elementName = "wyceno-widget";
const publicIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type WidgetMode = "fullscreen" | "inline" | "popup";

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function dispatchWidgetEvent(element: HTMLElement, name: string, detail?: unknown): void {
  element.dispatchEvent(
    new CustomEvent(`wyceno:${name}`, {
      bubbles: true,
      composed: true,
      ...(detail === undefined ? {} : { detail }),
    }),
  );
}

function initials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pl-PL") ?? "")
      .join("") || "LO"
  );
}

function normalizeContextInput(value: unknown): WidgetContextInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (
      Object.keys(result).length >= 8 ||
      !/^[a-z][a-z0-9_]{0,63}$/.test(key) ||
      typeof entry !== "string" ||
      entry.trim().length < 1 ||
      entry.trim().length > 120
    ) {
      return {};
    }
    result[key] = entry.trim();
  }
  return result;
}

export class WycenoWidgetElement extends HTMLElement {
  static observedAttributes = [
    "api-base",
    "button-label",
    "context-values",
    "mode",
    "preview",
    "public-id",
  ];

  readonly #shadow: ShadowRoot;
  #controller: WidgetSessionController | null = null;
  #contactDraft = {
    email: "",
    files: [] as File[],
    marketingEmailAccepted: false,
    name: "",
    phone: "",
    preferredContactChannel: "" as "" | "email" | "phone",
    preferredContactWindow: "" as "" | "morning" | "afternoon" | "evening",
    privacyAccepted: false,
  };
  #contactStarted = false;
  #contextDraft: Record<string, string> = {};
  #contextValues: WidgetContextInput = {};
  #dialog: HTMLDialogElement | null = null;
  #lastStatus: WidgetState["status"] = "idle";
  #lastStepKey: string | null = null;
  #previewAssetUrls: Readonly<Record<string, string>> = {};
  #previewManifest: WidgetManifest | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #started = false;
  #unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    const pendingElement = this as unknown as {
      contextValues?: WidgetContextInput;
      previewAssetUrls?: Readonly<Record<string, string>>;
      previewManifest?: WidgetManifest | null;
    };
    if (Object.prototype.hasOwnProperty.call(pendingElement, "contextValues")) {
      const pendingContext = pendingElement.contextValues;
      delete pendingElement.contextValues;
      this.#contextValues = normalizeContextInput(pendingContext);
    }
    if (Object.prototype.hasOwnProperty.call(pendingElement, "previewAssetUrls")) {
      const pendingUrls = pendingElement.previewAssetUrls;
      delete pendingElement.previewAssetUrls;
      this.#previewAssetUrls = pendingUrls ? { ...pendingUrls } : {};
    }
    if (Object.prototype.hasOwnProperty.call(pendingElement, "previewManifest")) {
      const pendingManifest = pendingElement.previewManifest;
      delete pendingElement.previewManifest;
      this.#previewManifest = pendingManifest ? structuredClone(pendingManifest) : null;
    }
    this.#shadow = this.attachShadow({ mode: "open" });
    const stylesheet = create("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("./widget.css", import.meta.url).href;
    this.#shadow.append(stylesheet);
  }

  connectedCallback(): void {
    window.addEventListener("online", this.#handleOnline);
    window.addEventListener("storage", this.#handleStorage);
    this.#resizeObserver = new ResizeObserver((entries) => {
      const height = Math.ceil(
        entries[0]?.contentRect.height ?? this.getBoundingClientRect().height,
      );
      dispatchWidgetEvent(this, "resize", { height });
    });
    this.#resizeObserver.observe(this);
    void this.#initialize();
  }

  disconnectedCallback(): void {
    window.removeEventListener("online", this.#handleOnline);
    window.removeEventListener("storage", this.#handleStorage);
    this.#resizeObserver?.disconnect();
    this.#unsubscribe?.();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) void this.#initialize();
  }

  get mode(): WidgetMode {
    const mode = this.getAttribute("mode");
    return mode === "popup" || mode === "fullscreen" ? mode : "inline";
  }

  get contextValues(): WidgetContextInput {
    return { ...this.#contextValues };
  }

  set contextValues(value: WidgetContextInput) {
    this.#contextValues = normalizeContextInput(value);
    this.#contextDraft = {};
    if (this.isConnected) void this.#initialize();
  }

  get previewManifest(): WidgetManifest | null {
    return this.#previewManifest;
  }

  get previewAssetUrls(): Readonly<Record<string, string>> {
    return this.#previewAssetUrls;
  }

  set previewAssetUrls(value: Readonly<Record<string, string>>) {
    this.#previewAssetUrls = { ...value };
    if (this.isConnected && this.#controller) this.#render(this.#controller.state);
  }

  set previewManifest(value: WidgetManifest | null) {
    this.#previewManifest = value ? structuredClone(value) : null;
    if (this.isConnected) void this.#initialize();
  }

  get previewMode(): boolean {
    return this.hasAttribute("preview") && this.#previewManifest !== null;
  }

  async #initialize(): Promise<void> {
    const publicId = this.getAttribute("public-id") ?? "";
    if (!publicIdPattern.test(publicId)) {
      this.#renderStandaloneError("Brakuje poprawnego identyfikatora procesu.");
      return;
    }
    this.#unsubscribe?.();
    this.#lastStepKey = null;
    const baseUrl = this.getAttribute("api-base") ?? window.location.origin;
    const attributeContext = this.getAttribute("context-values");
    if (attributeContext) {
      try {
        this.#contextValues = normalizeContextInput(JSON.parse(attributeContext));
      } catch {
        this.#contextValues = {};
      }
    }
    this.#controller = this.previewMode
      ? new WidgetSessionController(
          new PreviewWidgetApi(this.#previewManifest as WidgetManifest),
          new MemoryWidgetStorage(),
          {},
        )
      : new WidgetSessionController(
          new HttpWidgetApi(baseUrl),
          new LocalWidgetStorage(),
          this.#contextValues,
        );
    this.#unsubscribe = this.#controller.subscribe((state) => this.#render(state));
    await this.#controller.initialize(publicId);
  }

  readonly #handleOnline = (): void => {
    void this.#controller?.flush();
  };

  readonly #handleStorage = (event: StorageEvent): void => {
    if (this.previewMode) return;
    const publicId = this.getAttribute("public-id");
    if (publicId && event.key === widgetStorageKey(publicId) && event.newValue) {
      void this.#initialize();
    }
  };

  #render(state: WidgetState): void {
    const renderedStepKey = state.currentStep?.key ?? null;
    const shouldMoveToNewStep =
      this.#lastStepKey !== null &&
      renderedStepKey !== null &&
      renderedStepKey !== this.#lastStepKey;
    const dialogWasOpen = this.#dialog?.open === true;
    const container = create("div", `wyceno-shell wyceno-shell--${this.mode}`);
    if (this.mode === "inline") {
      container.append(this.#renderContent(state));
    } else {
      const launcher = create(
        "button",
        "wyceno-launcher",
        this.getAttribute("button-label") ?? "Rozpocznij wycenę",
      );
      launcher.type = "button";
      launcher.addEventListener("click", () => this.#openDialog());
      container.append(launcher);

      const dialog = create("dialog", `wyceno-dialog wyceno-dialog--${this.mode}`);
      const close = create("button", "wyceno-close", "Zamknij");
      close.type = "button";
      close.setAttribute("aria-label", "Zamknij formularz");
      close.addEventListener("click", () => dialog.close());
      dialog.addEventListener("close", () => {
        if (this.#started && this.#controller?.state.status === "active") {
          this.#controller.trackAnalytics("flow_abandoned");
        }
        launcher.focus();
        dispatchWidgetEvent(this, "closed");
      });
      dialog.append(close, this.#renderContent(state));
      container.append(dialog);
      this.#dialog = dialog;
    }

    this.#shadow.querySelector(".wyceno-shell")?.remove();
    this.#shadow.append(container);
    if (dialogWasOpen && this.#dialog && !this.#dialog.open) {
      this.#dialog.showModal();
    }

    if (
      this.#lastStatus === "loading_manifest" &&
      (state.status === "active" || state.status === "result" || state.status === "submitted")
    ) {
      dispatchWidgetEvent(this, "ready");
      if (this.mode === "inline") this.#controller?.trackAnalytics("widget_opened");
    }
    if (!this.previewMode && this.#lastStatus === "submitting" && state.status === "submitted") {
      dispatchWidgetEvent(this, "submitted", {
        leadPublicId: state.submission?.leadPublicId,
      });
    }
    this.#lastStepKey = renderedStepKey;
    if (shouldMoveToNewStep) {
      queueMicrotask(() => {
        const progress = this.#shadow.querySelector<HTMLElement>(".wyceno-progress-region");
        const fieldset = this.#shadow.querySelector<HTMLElement>(".wyceno-form fieldset");
        (progress ?? fieldset)?.scrollIntoView({ behavior: "instant", block: "start" });
        fieldset?.focus({ preventScroll: true });
      });
    }
    this.#lastStatus = state.status;
  }

  #openDialog(): void {
    this.#dialog?.showModal();
    this.#dialog?.querySelector<HTMLElement>("button, input, textarea")?.focus();
    this.#controller?.trackAnalytics("widget_opened");
    this.#controller?.trackAnalytics("cta_clicked");
  }

  #renderContext(state: WidgetState): HTMLElement {
    const section = create("section", "wyceno-context");
    const heading = create("div", "wyceno-context__heading");
    heading.append(create("small", undefined, "Kontekst zapytania"));
    heading.append(
      create(
        "h2",
        undefined,
        state.contextConfirmed ? "Dane przekazane ze strony" : "Sprawdź dane przed rozpoczęciem",
      ),
    );
    section.append(heading);
    if (state.contextConfirmed) {
      const list = create("dl", "wyceno-context__summary");
      for (const entry of state.context) {
        const row = create("div");
        row.append(create("dt", undefined, entry.label));
        row.append(create("dd", undefined, entry.value));
        list.append(row);
      }
      section.append(list);
      return section;
    }

    const form = create("form", "wyceno-context__form");
    for (const entry of state.context) {
      if (entry.mode === "informational") {
        const row = create("p", "wyceno-context__readonly");
        row.append(create("span", undefined, entry.label));
        row.append(create("strong", undefined, entry.value));
        form.append(row);
        continue;
      }
      const label = create("label");
      label.append(create("span", undefined, entry.label));
      if (entry.type === "enum" && entry.allowedValues?.length) {
        const select = create("select");
        select.name = entry.key;
        select.required = true;
        for (const value of entry.allowedValues) {
          const option = create("option", undefined, value);
          option.value = value;
          select.append(option);
        }
        select.value = this.#contextDraft[entry.key] ?? entry.value;
        select.addEventListener("change", () => {
          this.#contextDraft[entry.key] = select.value;
        });
        label.append(select);
      } else {
        const input = create("input");
        input.name = entry.key;
        input.maxLength = 120;
        input.required = true;
        input.value = this.#contextDraft[entry.key] ?? entry.value;
        input.addEventListener("input", () => {
          this.#contextDraft[entry.key] = input.value;
        });
        label.append(input);
      }
      form.append(label);
    }
    if (state.contextError) {
      const error = create("p", "wyceno-context__error", state.contextError);
      error.setAttribute("role", "alert");
      form.append(error);
    }
    const action = create("button", "wyceno-primary", "Potwierdź i rozpocznij");
    action.type = "submit";
    form.append(action);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values: Record<string, string> = {};
      for (const entry of state.context) {
        if (entry.mode === "confirm") {
          values[entry.key] = this.#contextDraft[entry.key] ?? entry.value;
        }
      }
      action.disabled = true;
      void this.#controller?.confirmContext(values).then((accepted) => {
        if (!accepted) action.disabled = false;
      });
    });
    section.append(form);
    return section;
  }

  #renderContent(state: WidgetState): HTMLElement {
    const content = create("section", "wyceno-card");
    content.setAttribute(
      "aria-busy",
      state.status === "loading_manifest" ||
        state.status === "calculating_result" ||
        state.status === "submitting"
        ? "true"
        : "false",
    );

    if (this.previewMode) {
      const previewNotice = create(
        "p",
        "wyceno-preview-notice",
        "Tryb podglądu — odpowiedzi, pliki i dane kontaktowe nie zostaną zapisane ani wysłane.",
      );
      previewNotice.setAttribute("role", "status");
      content.append(previewNotice);
    }

    if (state.status === "loading_manifest" || state.status === "idle") {
      content.append(create("p", "wyceno-status", "Uruchamiamy formularz…"));
      return content;
    }

    if (
      state.status === "recoverable_error" ||
      state.status === "expired" ||
      state.status === "unavailable"
    ) {
      const alert = create("div", "wyceno-alert");
      alert.setAttribute("role", "alert");
      alert.append(create("h2", undefined, "Nie udało się otworzyć procesu"));
      alert.append(create("p", undefined, state.errorMessage ?? "Spróbuj ponownie za chwilę."));
      if (state.status !== "unavailable") {
        const retry = create("button", "wyceno-primary", "Rozpocznij ponownie");
        retry.type = "button";
        retry.addEventListener("click", () => void this.#controller?.restart());
        alert.append(retry);
      }
      content.append(alert);
      return content;
    }

    const manifest = state.manifest;
    if (!manifest) return content;
    const quickForm = manifest.experienceMode === "quick_form";
    const visualConfigurator = manifest.experienceMode === "visual_configurator";
    if (quickForm) content.classList.add("wyceno-card--quick");
    if (visualConfigurator) content.classList.add("wyceno-card--visual");

    const header = create("header", "wyceno-header");
    const brand = create("div", "wyceno-brand");
    const companyName = manifest.branding?.companyName ?? manifest.title;
    if (manifest.branding) {
      content.style.setProperty("--wyceno-tenant-accent", manifest.branding.accentColor);
      content.style.setProperty("--wyceno-tenant-accent-text", manifest.branding.accentTextColor);
    }
    const brandMark = create("span", "wyceno-brand-mark", initials(companyName));
    if (manifest.branding?.logoUrl) {
      const logo = create("img", "wyceno-brand-logo");
      logo.alt = `Logo ${companyName}`;
      logo.decoding = "async";
      logo.height = 40;
      logo.src = manifest.branding.logoUrl;
      logo.width = 40;
      brandMark.replaceChildren(logo);
    }
    brand.append(brandMark);
    const brandCopy = create("div");
    brandCopy.append(create("strong", undefined, companyName));
    brandCopy.append(create("small", undefined, manifest.title));
    brand.append(brandCopy);
    header.append(brand);

    const sync = create("p", "wyceno-sync");
    sync.setAttribute("role", "status");
    sync.setAttribute("aria-live", "polite");
    sync.textContent = this.previewMode
      ? "Podgląd lokalny — nic nie zapisujemy."
      : state.syncStatus === "offline"
        ? "Brak połączenia — odpowiedź jest zachowana na tym urządzeniu."
        : state.syncStatus === "saving"
          ? "Zapisujemy odpowiedź…"
          : quickForm
            ? "Zapisano bezpiecznie."
            : "Postęp zapisany.";
    header.append(sync);
    content.append(header);

    if (state.context.length > 0) {
      content.append(this.#renderContext(state));
      if (!state.contextConfirmed) return content;
    }

    const currentIndex = state.currentStep
      ? Math.max(
          0,
          manifest.steps.findIndex((step) => step.key === state.currentStep?.key),
        )
      : manifest.steps.length;
    if (!quickForm) {
      const progressRegion = create("div", "wyceno-progress-region");
      progressRegion.append(
        create(
          "p",
          "wyceno-progress",
          `Krok ${Math.min(currentIndex + 1, manifest.steps.length)} z ${manifest.steps.length}`,
        ),
      );
      const progress = create("progress");
      progress.max = manifest.steps.length;
      progress.value = Math.min(currentIndex + 1, manifest.steps.length);
      progress.setAttribute(
        "aria-label",
        `Postęp: krok ${progress.value} z ${manifest.steps.length}`,
      );
      progressRegion.append(progress);
      content.append(progressRegion);
    }

    const stage = create(
      "div",
      quickForm
        ? "wyceno-stage wyceno-stage--quick"
        : visualConfigurator
          ? "wyceno-stage wyceno-stage--visual"
          : "wyceno-stage",
    );
    if (state.history.length === 0 && state.status === "active") {
      const introduction = create("div", "wyceno-introduction");
      if (!quickForm && !visualConfigurator) {
        introduction.append(create("p", "wyceno-eyebrow", "Pierwszy krok"));
      }
      introduction.append(create("h1", undefined, manifest.title));
      introduction.append(create("p", "wyceno-intro", manifest.intro));
      if (quickForm) {
        const documentMeta = create("div", "wyceno-document-meta");
        documentMeta.append(
          create("span", undefined, "Zakres zapytania"),
          create(
            "span",
            undefined,
            `${String(manifest.steps.length).padStart(2, "0")} ${manifest.steps.length === 1 ? "pozycja" : manifest.steps.length < 5 ? "pozycje" : "pozycji"}`,
          ),
        );
        introduction.append(documentMeta);
      }
      stage.append(introduction);
    }
    if (!quickForm && !visualConfigurator && !this.previewMode) {
      stage.append(this.#renderAnalyticsConsent(state));
    }
    content.append(stage);

    if (state.status === "calculating_result") {
      const status = create("div", "wyceno-result");
      status.setAttribute("role", "status");
      status.append(create("span", "wyceno-result-icon", "✓"));
      status.append(create("p", "wyceno-eyebrow", "Gotowy brief"));
      status.append(create("h2", undefined, "Obliczamy orientacyjny wynik…"));
      status.append(
        create(
          "p",
          undefined,
          state.errorMessage ?? "Sprawdzamy zakres i zapisane odpowiedzi po stronie serwera.",
        ),
      );
      stage.append(status);
      return content;
    }

    if (
      state.status === "contact" ||
      state.status === "result" ||
      state.status === "submitting" ||
      state.status === "submitted"
    ) {
      const contactFirst = state.status === "contact" && !state.result;
      const result = create("div", "wyceno-result");
      result.setAttribute("role", "status");
      result.tabIndex = -1;
      const calculated = state.result;
      result.append(create("span", "wyceno-result-icon", contactFirst ? "→" : "✓"));
      result.append(create("p", "wyceno-eyebrow", contactFirst ? "Ostatni krok" : "Gotowy wynik"));
      result.append(
        create(
          "h2",
          undefined,
          contactFirst
            ? "Gdzie przekazać pełny wynik?"
            : (calculated?.headline ?? manifest.result.headline),
        ),
      );
      if (calculated?.pricing) {
        const price =
          calculated.pricing.presentation === "exact"
            ? calculated.pricing.formattedMin
            : calculated.pricing.presentation === "from"
              ? `Od ${calculated.pricing.formattedMin}`
              : `${calculated.pricing.formattedMin}–${calculated.pricing.formattedMax}`;
        result.append(create("p", "wyceno-price", price));
      }
      if (!contactFirst) {
        result.append(create("p", undefined, calculated?.disclaimer ?? manifest.result.disclaimer));
        result.append(this.#renderAnswerSummary(state));
        result.append(
          create(
            "p",
            "wyceno-next-action",
            calculated?.nextStepLabel ?? manifest.result.nextStepLabel,
          ),
        );
      } else {
        result.append(
          create("p", undefined, "Uzupełnij tylko dane potrzebne firmie do odpowiedzi."),
        );
      }
      stage.append(result);
      queueMicrotask(() => result.focus());

      if (state.status === "submitted") {
        const confirmation = create("div", "wyceno-confirmation");
        confirmation.setAttribute("role", "status");
        confirmation.append(create("span", "wyceno-result-icon", "✓"));
        confirmation.append(
          create(
            "h2",
            undefined,
            this.previewMode ? "Podgląd formularza zakończony" : "Zapytanie zostało wysłane",
          ),
        );
        confirmation.append(
          create(
            "p",
            undefined,
            this.previewMode
              ? "To była bezpieczna próba. Nie utworzono leada i nic nie wysłano do firmy."
              : "Firma otrzymała odpowiedzi i dane kontaktowe. Może teraz skontaktować się w sprawie zapytania.",
          ),
        );
        if (!this.previewMode && state.submission?.leadPublicId) {
          confirmation.append(
            create(
              "small",
              "wyceno-reference-number",
              `Numer zapytania: ${state.submission.leadPublicId}`,
            ),
          );
        }
        stage.append(confirmation);
        return content;
      }
      if (state.status === "submitting") {
        stage.append(
          create(
            "p",
            "wyceno-status",
            "Bezpiecznie zapisujemy pliki, odpowiedzi i dane kontaktowe…",
          ),
        );
        return content;
      }
      if ((calculated?.action ?? manifest.result.action ?? "capture_lead") === "no_lead") {
        if (calculated?.fallbackContactUrl && calculated.fallbackContactLabel) {
          const fallback = create("a", "wyceno-primary", calculated.fallbackContactLabel);
          fallback.href = calculated.fallbackContactUrl;
          fallback.rel = "noopener noreferrer";
          stage.append(fallback);
        }
      } else if (manifest.leadCapture) {
        stage.append(this.#renderLeadCapture(state));
      }
      return content;
    }

    if (state.currentStep) {
      if (quickForm) {
        const form = this.#renderQuickForm(state);
        if (!this.previewMode) {
          const actions = form.querySelector(".wyceno-actions--quick");
          form.insertBefore(this.#renderAnalyticsConsent(state), actions);
        }
        stage.append(form);
      } else {
        const form = this.#renderStep(state.currentStep, state);
        if (visualConfigurator && !this.previewMode) {
          const actions = form.querySelector(".wyceno-actions");
          form.insertBefore(this.#renderAnalyticsConsent(state), actions);
        }
        stage.append(form);
      }
    }
    return content;
  }

  #renderAnswerSummary(state: WidgetState): HTMLElement {
    const summary = create("dl", "wyceno-answer-summary");
    const manifest = state.manifest;
    if (!manifest) return summary;

    for (const step of manifest.steps
      .filter((item) => state.answers[item.key] !== undefined)
      .slice(0, 4)) {
      const row = create("div");
      row.append(create("dt", undefined, step.title));
      row.append(create("dd", undefined, this.#answerLabel(step, state.answers[step.key])));
      summary.append(row);
    }
    return summary;
  }

  #answerLabel(step: WidgetStep, answer: WidgetAnswer | undefined): string {
    if (answer === undefined) return "—";
    if (answer === "__unknown__") return "Do ustalenia";
    if (typeof answer === "boolean") return answer ? "Tak" : "Nie";
    if (Array.isArray(answer)) {
      return answer
        .map((value) => step.options.find((option) => option.key === value)?.label ?? value)
        .join(", ");
    }
    if (typeof answer === "string") {
      return step.options.find((option) => option.key === answer)?.label ?? answer;
    }
    return new Intl.NumberFormat("pl-PL").format(answer);
  }

  #renderLeadCapture(state: WidgetState): HTMLElement {
    const capture = state.manifest?.leadCapture;
    const section = create("section", "wyceno-contact");
    if (!capture) return section;
    section.append(create("h2", undefined, "Przekaż dane do kontaktu"));
    section.append(
      create(
        "p",
        "wyceno-description",
        capture.contactPolicy === "phone_required"
          ? "Telefon jest wymagany. Imię, e-mail i pliki możesz dodać opcjonalnie."
          : "E-mail jest wymagany. Imię, telefon i pliki możesz dodać opcjonalnie.",
      ),
    );
    const form = create("form", "wyceno-contact-form");
    form.noValidate = true;
    form.addEventListener(
      "focusin",
      () => {
        if (this.#contactStarted) return;
        this.#contactStarted = true;
        this.#controller?.trackAnalytics("contact_started");
      },
      { once: true },
    );

    const fields = capture.fields;
    const name = this.#contactInput(
      "text",
      "Imię",
      "wyceno-contact-name",
      fields?.name === "required",
    );
    name.input.autocomplete = "name";
    name.input.value = this.#contactDraft.name;
    name.input.addEventListener("input", () => {
      this.#contactDraft.name = name.input.value;
    });
    const email = this.#contactInput(
      "email",
      "E-mail",
      "wyceno-contact-email",
      capture.contactPolicy === "email_required",
    );
    email.input.autocomplete = "email";
    email.input.value = this.#contactDraft.email;
    email.input.addEventListener("input", () => {
      this.#contactDraft.email = email.input.value;
    });
    const phone = this.#contactInput(
      "tel",
      "Telefon",
      "wyceno-contact-phone",
      capture.contactPolicy === "phone_required",
    );
    phone.input.autocomplete = "tel";
    phone.input.value = this.#contactDraft.phone;
    phone.input.addEventListener("input", () => {
      this.#contactDraft.phone = phone.input.value;
    });
    if (fields?.name !== "hidden") form.append(name.label);
    if (fields?.email !== "hidden") form.append(email.label);
    if (fields?.phone !== "hidden") form.append(phone.label);

    if (fields?.preferredContactChannel !== "hidden") {
      const label = create("label", "wyceno-contact-field");
      label.append(create("span", undefined, "Preferowany kontakt"));
      const select = create("select");
      select.required = fields?.preferredContactChannel === "required";
      select.append(
        new Option("Wybierz", ""),
        new Option("E-mail", "email"),
        new Option("Telefon", "phone"),
      );
      select.value = this.#contactDraft.preferredContactChannel;
      select.addEventListener("change", () => {
        this.#contactDraft.preferredContactChannel = select.value as "" | "email" | "phone";
      });
      label.append(select);
      form.append(label);
    }
    if (fields?.preferredContactWindow !== "hidden") {
      const label = create("label", "wyceno-contact-field");
      label.append(create("span", undefined, "Najlepsza pora kontaktu"));
      const select = create("select");
      select.required = fields?.preferredContactWindow === "required";
      select.append(
        new Option("Wybierz", ""),
        new Option("Rano (8:00–12:00)", "morning"),
        new Option("Po południu (12:00–17:00)", "afternoon"),
        new Option("Wieczorem (17:00–20:00)", "evening"),
      );
      select.value = this.#contactDraft.preferredContactWindow;
      select.addEventListener("change", () => {
        this.#contactDraft.preferredContactWindow = select.value as
          "" | "morning" | "afternoon" | "evening";
      });
      label.append(select);
      form.append(label);
    }

    if (capture.filesEnabled) {
      const fileLabel = create("label", "wyceno-contact-field");
      fileLabel.htmlFor = "wyceno-contact-files";
      fileLabel.append(create("span", undefined, "Załączniki (opcjonalne, maks. 5 × 25 MiB)"));
      const fileInput = create("input");
      fileInput.id = "wyceno-contact-files";
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.accept = ".jpg,.jpeg,.png,.webp,.pdf";
      fileInput.addEventListener("change", () => {
        this.#contactDraft.files = Array.from(fileInput.files ?? []);
      });
      fileLabel.append(fileInput);
      form.append(fileLabel);
    }

    const privacy = this.#consentControl(
      "wyceno-privacy-notice",
      capture.privacyNotice.label,
      true,
    );
    privacy.input.checked = this.#contactDraft.privacyAccepted;
    privacy.input.addEventListener("change", () => {
      this.#contactDraft.privacyAccepted = privacy.input.checked;
    });
    if (capture.privacyNotice.policyUrl) {
      const policy = create("a", "wyceno-policy-link", "Przeczytaj politykę prywatności");
      policy.href = capture.privacyNotice.policyUrl;
      policy.target = "_blank";
      policy.rel = "noopener noreferrer";
      privacy.label.append(policy);
    }
    form.append(privacy.label);

    if (capture.marketingEmailConsent) {
      const marketing = this.#consentControl(
        "wyceno-marketing-email",
        capture.marketingEmailConsent.label,
        false,
      );
      marketing.input.checked = this.#contactDraft.marketingEmailAccepted;
      marketing.input.addEventListener("change", () => {
        this.#contactDraft.marketingEmailAccepted = marketing.input.checked;
      });
      form.append(marketing.label);
    }

    if (state.errorMessage) {
      const error = create("p", "wyceno-error", state.errorMessage);
      error.setAttribute("role", "alert");
      form.append(error);
    }
    const submit = create(
      "button",
      "wyceno-primary",
      this.previewMode ? "Zakończ podgląd" : "Wyślij zapytanie",
    );
    submit.type = "submit";
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      this.#controller?.trackAnalytics("cta_clicked");
      void this.#controller?.submitLead(
        {
          email: this.#contactDraft.email,
          files: this.#contactDraft.files,
          marketingEmailAccepted: this.#contactDraft.marketingEmailAccepted,
          name: this.#contactDraft.name,
          phone: this.#contactDraft.phone,
          ...(this.#contactDraft.preferredContactChannel
            ? { preferredContactChannel: this.#contactDraft.preferredContactChannel }
            : {}),
          ...(this.#contactDraft.preferredContactWindow
            ? { preferredContactWindow: this.#contactDraft.preferredContactWindow }
            : {}),
          privacyAccepted: this.#contactDraft.privacyAccepted,
        },
        () => this.#challengeToken(),
      );
    });
    section.append(form);
    return section;
  }

  async #challengeToken(): Promise<string> {
    if (this.previewMode) return "preview-local";
    const challenge = this.#controller?.state.manifest?.challenge;
    if (!challenge) return "local-disabled";
    const stage = this.#shadow.querySelector<HTMLElement>(".wyceno-stage");
    if (!stage) throw new Error("Nie udało się uruchomić weryfikacji bezpieczeństwa.");
    const region = create("div", "wyceno-challenge");
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.append(create("p", undefined, "Potwierdzamy bezpieczeństwo wysłania…"));
    const target = create("div", "wyceno-challenge-target");
    region.append(target);
    stage.append(region);
    try {
      return await requestTurnstileToken(target, challenge);
    } finally {
      region.remove();
    }
  }

  #renderAnalyticsConsent(state: WidgetState): HTMLElement {
    const section = create(
      "section",
      `wyceno-analytics${state.analyticsConsent === null ? "" : " is-resolved"}`,
    );
    section.setAttribute("aria-label", "Ustawienia analityki");
    if (state.analyticsConsent === null) {
      section.append(
        create(
          "p",
          undefined,
          "Czy zgadzasz się na zbiorczą analitykę korzystania z formularza? Nie zapisujemy odpowiedzi ani danych kontaktowych. Odmowa nie blokuje wyceny.",
        ),
      );
      const actions = create("div", "wyceno-analytics-actions");
      const accept = create("button", "wyceno-secondary", "Zgadzam się");
      accept.type = "button";
      accept.addEventListener("click", () => void this.#controller?.setAnalyticsConsent(true));
      const decline = create("button", "wyceno-text-button", "Nie zgadzam się");
      decline.type = "button";
      decline.addEventListener("click", () => void this.#controller?.setAnalyticsConsent(false));
      actions.append(accept, decline);
      section.append(actions);
    } else {
      const status = create(
        "p",
        undefined,
        state.analyticsConsent
          ? "Zbiorcza analityka jest włączona."
          : "Zbiorcza analityka jest wyłączona.",
      );
      const change = create(
        "button",
        "wyceno-text-button",
        state.analyticsConsent ? "Wycofaj zgodę" : "Włącz analitykę",
      );
      change.type = "button";
      change.addEventListener(
        "click",
        () => void this.#controller?.setAnalyticsConsent(!state.analyticsConsent),
      );
      section.append(status, change);
    }
    if (state.analyticsError) {
      const error = create("p", "wyceno-error", state.analyticsError);
      error.setAttribute("role", "alert");
      section.append(error);
    }
    return section;
  }

  #contactInput(
    type: "email" | "tel" | "text",
    text: string,
    id: string,
    required: boolean,
  ): { input: HTMLInputElement; label: HTMLLabelElement } {
    const label = create("label", "wyceno-contact-field");
    label.htmlFor = id;
    label.append(create("span", undefined, required ? text : `${text} (opcjonalne)`));
    const input = create("input");
    input.id = id;
    input.type = type;
    input.required = required;
    input.maxLength = type === "email" ? 254 : type === "tel" ? 30 : 120;
    if (type === "text") input.minLength = 2;
    if (type === "tel") {
      input.minLength = 7;
      input.pattern = "\\+?[0-9 ()-]{7,30}";
    }
    label.append(input);
    return { input, label };
  }

  #consentControl(
    id: string,
    text: string,
    required: boolean,
  ): { input: HTMLInputElement; label: HTMLLabelElement } {
    const label = create("label", "wyceno-consent");
    label.htmlFor = id;
    const input = create("input");
    input.id = id;
    input.type = "checkbox";
    input.required = required;
    label.append(input, create("span", undefined, text));
    return { input, label };
  }

  #renderStep(step: WidgetStep, state: WidgetState): HTMLElement {
    const form = create("form", "wyceno-form");
    form.noValidate = true;
    const fieldset = create("fieldset");
    fieldset.tabIndex = -1;
    const legend = create("legend", undefined, step.title);
    fieldset.append(legend);
    if (step.description) {
      const description = create("p", "wyceno-description", step.description);
      description.id = `wyceno-hint-${step.key}`;
      fieldset.append(description);
    }
    fieldset.append(this.#renderControl(step, state.answers[step.key], "answer"));

    const error = create("p", "wyceno-error");
    error.id = `wyceno-error-${step.key}`;
    error.setAttribute("role", "alert");
    if (state.errorMessage) error.textContent = state.errorMessage;
    fieldset.append(error);

    const actions = create("div", "wyceno-actions");
    if (state.history.length > 0) {
      const back = create("button", "wyceno-secondary", "Wstecz");
      back.type = "button";
      back.addEventListener("click", () => this.#controller?.back());
      actions.append(back);
    }
    if (!step.required) {
      const skip = create("button", "wyceno-secondary", "Pomiń");
      skip.type = "button";
      skip.addEventListener("click", () => this.#submitAnswer(null));
      actions.append(skip);
    }
    if (step.allowUnknown) {
      const unknown = create("button", "wyceno-secondary", "Nie wiem");
      unknown.type = "button";
      unknown.addEventListener("click", () => this.#submitAnswer("__unknown__"));
      actions.append(unknown);
    }
    const next = create("button", "wyceno-primary", "Dalej");
    next.type = "submit";
    actions.append(next);

    form.append(fieldset, actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const answer = this.#readAnswer(form, step);
      this.#submitAnswer(answer);
    });
    return form;
  }

  #renderQuickForm(state: WidgetState): HTMLElement {
    const form = create("form", "wyceno-form wyceno-form--quick");
    const manifest = state.manifest;
    if (!manifest) return form;
    form.noValidate = true;

    for (const [index, step] of manifest.steps.entries()) {
      const fieldset = create("fieldset", "wyceno-quick-field");
      fieldset.id = `wyceno-field-${step.key}`;
      const legend = create("legend");
      legend.append(create("span", "wyceno-quick-number", String(index + 1).padStart(2, "0")));
      legend.append(document.createTextNode(step.title));
      if (!step.required) legend.append(create("small", undefined, " (opcjonalne)"));
      fieldset.append(legend);
      if (step.description) {
        const description = create("p", "wyceno-description", step.description);
        description.id = `wyceno-hint-${step.key}`;
        fieldset.append(description);
      }
      const answerName = `answer_${step.key}`;
      fieldset.append(this.#renderControl(step, state.answers[step.key], answerName));
      if (step.allowUnknown) {
        const unknown = create("label", "wyceno-unknown");
        const input = create("input");
        input.type = "checkbox";
        input.name = `unknown_${step.key}`;
        input.checked = state.answers[step.key] === "__unknown__";
        unknown.append(input, create("span", undefined, "Nie wiem — ustalimy to później"));
        fieldset.append(unknown);
      }
      if (state.validationStepKey === step.key && state.errorMessage) {
        fieldset.setAttribute("aria-invalid", "true");
        fieldset.tabIndex = -1;
        const error = create("p", "wyceno-error", state.errorMessage);
        error.id = `wyceno-error-${step.key}`;
        error.setAttribute("role", "alert");
        fieldset.append(error);
      }
      form.append(fieldset);
    }

    const actions = create("div", "wyceno-actions wyceno-actions--quick");
    const submit = create("button", "wyceno-primary", "Zobacz orientacyjny wynik");
    submit.type = "submit";
    actions.append(submit);
    form.append(actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const answers: Record<string, WidgetAnswer | null> = {};
      for (const step of manifest.steps) {
        answers[step.key] = data.has(`unknown_${step.key}`)
          ? "__unknown__"
          : this.#readAnswerData(data, step, `answer_${step.key}`);
      }
      const result = this.#controller?.submitQuickForm(answers);
      if (!result?.accepted && result?.firstInvalidStepKey) {
        queueMicrotask(() =>
          this.#shadow
            .querySelector<HTMLElement>(`#wyceno-field-${result.firstInvalidStepKey}`)
            ?.focus(),
        );
        return;
      }
      if (result?.accepted && !this.#started) {
        this.#started = true;
        dispatchWidgetEvent(this, "started");
      }
    });
    return form;
  }

  #renderControl(
    step: WidgetStep,
    current: WidgetAnswer | undefined,
    answerName: string,
  ): HTMLElement {
    if (step.type === "single_choice" || step.type === "multiple_choice") {
      const presentationVariant = step.presentation?.variant ?? "default";
      const choices = create(
        "div",
        `wyceno-choices${presentationVariant === "text_cards" ? " wyceno-choices--text-cards" : presentationVariant === "icon_cards" ? " wyceno-choices--icon-cards" : presentationVariant === "image_cards" ? " wyceno-choices--image-cards" : ""}`,
      );
      for (const option of step.options) {
        const label = create("label", "wyceno-choice");
        const input = create("input");
        input.type = step.type === "single_choice" ? "radio" : "checkbox";
        input.name = answerName;
        input.value = option.key;
        input.checked = Array.isArray(current)
          ? current.includes(option.key)
          : current === option.key;
        if (
          presentationVariant === "text_cards" ||
          presentationVariant === "icon_cards" ||
          presentationVariant === "image_cards"
        ) {
          const copy = create("span", "wyceno-choice-copy");
          copy.append(create("strong", undefined, option.label));
          if (option.presentation?.description) {
            copy.append(create("small", undefined, option.presentation.description));
          }
          if (presentationVariant === "image_cards" && option.presentation?.asset) {
            const media = create("span", "wyceno-choice-media");
            const image = create("img");
            image.alt = option.presentation.asset.alt;
            image.decoding = "async";
            image.height = 600;
            image.loading = "lazy";
            image.src = this.#flowAssetSource(option.presentation.asset.id);
            image.width = 800;
            const fallback = create("span", "wyceno-choice-media-fallback", "Zdjęcie niedostępne");
            image.addEventListener("error", () => media.classList.add("is-failed"), {
              once: true,
            });
            image.addEventListener("load", () => media.classList.add("is-loaded"), {
              once: true,
            });
            media.append(image, fallback);
            label.append(media, input, copy);
          } else if (presentationVariant === "icon_cards" && option.presentation?.icon) {
            label.append(input, createPresentationIcon(option.presentation.icon), copy);
          } else {
            label.append(input, copy);
          }
        } else {
          label.append(input, create("span", undefined, option.label));
        }
        choices.append(label);
      }
      return choices;
    }

    if (step.type === "yes_no") {
      const choices = create("div", "wyceno-choices");
      for (const [value, labelText] of [
        ["true", "Tak"],
        ["false", "Nie"],
      ] as const) {
        const label = create("label", "wyceno-choice");
        const input = create("input");
        input.type = "radio";
        input.name = answerName;
        input.value = value;
        input.checked = current === (value === "true");
        label.append(input, create("span", undefined, labelText));
        choices.append(label);
      }
      return choices;
    }

    if (step.type === "long_text") {
      const textarea = create("textarea");
      textarea.name = answerName;
      const validation = step.validation?.kind === "text_length" ? step.validation : null;
      textarea.maxLength = validation?.maxLength ?? 2000;
      textarea.minLength = validation?.minLength ?? 0;
      textarea.rows = 5;
      textarea.setAttribute("aria-required", String(step.required));
      textarea.value = typeof current === "string" && current !== "__unknown__" ? current : "";
      return textarea;
    }

    const input = create("input");
    input.name = answerName;
    input.value = typeof current === "string" || typeof current === "number" ? String(current) : "";
    input.setAttribute("aria-required", String(step.required));
    if (step.type === "date") {
      input.type = "date";
      if (step.validation?.kind === "date_range") {
        if (step.validation.min) input.min = step.validation.min;
        if (step.validation.max) input.max = step.validation.max;
      }
    } else if (step.type === "number" || step.type === "budget") {
      input.type = "number";
      input.inputMode = "decimal";
      input.step = step.type === "budget" ? "100" : "any";
      if (step.validation?.kind === "number_range") {
        if (step.validation.min !== undefined) input.min = String(step.validation.min);
        if (step.validation.max !== undefined) input.max = String(step.validation.max);
      } else {
        input.min = "0";
      }
    } else {
      input.type = "text";
      const validation = step.validation?.kind === "text_length" ? step.validation : null;
      input.maxLength = validation?.maxLength ?? 500;
      input.minLength = validation?.minLength ?? 0;
      if (step.type === "location") input.autocomplete = "postal-code";
    }
    return input;
  }

  #flowAssetSource(assetId: string): string {
    if (this.previewMode) return this.#previewAssetUrls[assetId] ?? "";
    const publicId = this.getAttribute("public-id") ?? "";
    const baseUrl = this.getAttribute("api-base") ?? window.location.origin;
    return new URL(
      `/api/v1/public/flows/${encodeURIComponent(publicId)}/assets/${encodeURIComponent(assetId)}`,
      baseUrl,
    ).href;
  }

  #readAnswer(form: HTMLFormElement, step: WidgetStep): WidgetAnswer | null {
    const data = new FormData(form);
    return this.#readAnswerData(data, step, "answer");
  }

  #readAnswerData(data: FormData, step: WidgetStep, answerName: string): WidgetAnswer | null {
    if (step.type === "multiple_choice") {
      const values = data.getAll(answerName).map(String);
      return values.length > 0 ? values : null;
    }
    const raw = data.get(answerName);
    if (raw === null || String(raw).trim() === "") return null;
    if (step.type === "yes_no") return raw === "true";
    if (step.type === "number" || step.type === "budget") return Number(raw);
    return String(raw);
  }

  #submitAnswer(answer: WidgetAnswer | null): void {
    if (!this.#controller?.answer(answer)) return;
    if (!this.#started) {
      this.#started = true;
      dispatchWidgetEvent(this, "started");
    }
  }

  #renderStandaloneError(message: string): void {
    const alert = create("div", "wyceno-alert", message);
    alert.setAttribute("role", "alert");
    this.#shadow.querySelector(".wyceno-shell")?.remove();
    const shell = create("div", "wyceno-shell wyceno-shell--inline");
    shell.append(alert);
    this.#shadow.append(shell);
  }
}

export function defineWycenoWidget(): void {
  if (!customElements.get(elementName)) {
    customElements.define(elementName, WycenoWidgetElement);
  }
}
