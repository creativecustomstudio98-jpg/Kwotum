"use client";

import { useEffect } from "react";

export function HomeMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reveal = (element: HTMLElement) => {
      element.dataset.revealed = "true";
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(reveal);
      root.dataset.motionReady = "true";
      return;
    }

    const firstViewport = elements.filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top <= window.innerHeight * 1.04 && bounds.bottom >= 0;
    });
    firstViewport.forEach(reveal);
    root.dataset.motionReady = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          reveal(element);
          observer.unobserve(element);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    elements
      .filter((element) => !firstViewport.includes(element))
      .forEach((element) => {
        observer.observe(element);
      });

    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const revealTarget = event.target.closest<HTMLElement>("[data-reveal]");
      if (revealTarget && root.contains(revealTarget)) reveal(revealTarget);
    };

    root.addEventListener("focusin", onFocusIn);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", onFocusIn);
    };
  }, [rootId]);

  return null;
}
