"use client";

import { useEffect, useRef } from "react";

export function HostedWidget({ publicId }: Readonly<{ publicId: string }>) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    let script = document.querySelector<HTMLScriptElement>('script[data-wyceno-loader="v1"]');
    if (!script) {
      script = document.createElement("script");
      script.dataset.wycenoLoader = "v1";
      script.src = "/widget/v1/loader.js";
      script.type = "module";
      document.head.append(script);
    }

    const widget = document.createElement("wyceno-widget");
    widget.setAttribute("public-id", publicId);
    widget.setAttribute("mode", "inline");
    container.append(widget);

    return () => widget.remove();
  }, [publicId]);

  return <div className="hosted-widget-frame" ref={host} />;
}
