const elementName = "wyceno-widget";
let loading: Promise<void> | null = null;

function register(): Promise<void> {
  if (customElements.get(elementName)) return Promise.resolve();
  loading ??= import("./element.js").then(({ defineWycenoWidget }) => defineWycenoWidget());
  return loading;
}

if (typeof document !== "undefined") {
  if (document.querySelector(elementName)) {
    void register();
  } else {
    const observer = new MutationObserver(() => {
      if (document.querySelector(elementName)) {
        observer.disconnect();
        void register();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

export { register as registerWycenoWidget };
