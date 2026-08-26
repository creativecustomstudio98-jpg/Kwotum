import type { WidgetPresentationIcon } from "./contracts.js";

const namespace = "http://www.w3.org/2000/svg";

const iconPaths: Readonly<Record<WidgetPresentationIcon, readonly string[]>> = {
  apartment: ["M4 21V7l8-4 8 4v14", "M8 21v-4h8v4", "M8 9h2m4 0h2M8 13h2m4 0h2"],
  building: ["M5 21V3h14v18M3 21h18", "M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2"],
  calendar: ["M5 4h14a2 2 0 0 1 2 2v13H3V6a2 2 0 0 1 2-2Z", "M8 2v4m8-4v4M3 9h18"],
  camera: ["M4 7h4l2-3h4l2 3h4v12H4Z", "M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  check: ["m5 12 4 4L19 6"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  document: ["M6 3h8l4 4v14H6Z", "M14 3v5h4M9 12h6M9 16h6"],
  door: ["M6 21V3h12v18M9 6h6v15", "M13 12h.01"],
  fence: ["M5 21V5l2-2 2 2v16M15 21V5l2-2 2 2v16", "M3 9h18M3 15h18"],
  globe: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
    "M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  ],
  home: ["m3 11 9-8 9 8", "M5 10v11h14V10M9 21v-6h6v6"],
  kitchen: ["M4 3h16v18H4ZM4 10h16M9 3v7m6-7v7", "M8 14h3m2 0h3M8 18h8"],
  layers: ["m4 8 8-5 8 5-8 5Z", "m4 12 8 5 8-5M4 16l8 5 8-5"],
  location: ["M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z", "M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  palette: [
    "M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4 0c0-1.4 1.1-2.5 2.5-2.5H14A7 7 0 0 0 12 3Z",
    "M8 9h.01M12 7h.01M16 9h.01",
  ],
  phone: ["M7 3h3l1 5-2 1a14 14 0 0 0 6 6l1-2 5 1v3c0 2-2 4-4 4A14 14 0 0 1 3 7c0-2 2-4 4-4Z"],
  renovation: ["m4 20 7-7", "m9 5 3-2 9 9-2 3-5-5-2 2-3-3Z", "m3 21 3-1-2-2Z"],
  ruler: ["m5 19 14-14 3 3L8 22Z", "m15 7 2 2m-5 1 2 2m-5 1 2 2"],
  settings: ["M4 7h10m4 0h2M14 4v6", "M4 17h2m4 0h10M10 14v6"],
  shopping_bag: ["M5 8h14l1 13H4Z", "M9 10V6a3 3 0 0 1 6 0v4"],
  snowflake: ["M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7", "m9 4 3 3 3-3m-6 16 3-3 3 3"],
  sparkles: [
    "m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z",
    "m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z",
  ],
  store: [
    "M4 9v12h16V9",
    "M3 9l2-6h14l2 6M8 21v-6h8v6",
    "M3 9a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2",
  ],
  wardrobe: ["M5 3h14v18H5ZM12 3v18", "M9 12h.01m6 0h.01"],
};

export function createPresentationIcon(icon: WidgetPresentationIcon): SVGSVGElement {
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "wyceno-presentation-icon");
  svg.setAttribute("fill", "none");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("viewBox", "0 0 24 24");
  for (const data of iconPaths[icon]) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", data);
    svg.append(path);
  }
  return svg;
}

export const presentationIconCount = Object.keys(iconPaths).length;
