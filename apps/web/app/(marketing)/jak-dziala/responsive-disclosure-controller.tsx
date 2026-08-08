"use client";

import { useEffect } from "react";

const selector = [
  ".trust-map__details",
  ".process-stage-card__details",
  ".process-outcome-card__details",
  ".security-model__details",
  ".how-overview__details",
].join(",");

export function ResponsiveDisclosureController() {
  useEffect(() => {
    const media = window.matchMedia("(max-width: 48rem)");

    const synchronize = () => {
      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((details) => {
        details.open = !media.matches;
      });
    };

    synchronize();
    media.addEventListener("change", synchronize);

    return () => media.removeEventListener("change", synchronize);
  }, []);

  return null;
}
