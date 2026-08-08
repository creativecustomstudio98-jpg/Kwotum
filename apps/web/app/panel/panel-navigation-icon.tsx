import type { SVGProps } from "react";

import { PanelIcon, type PanelIconName } from "./panel-icon";

const navigationPaths: Partial<Record<PanelIconName, React.ReactNode>> = {
  analytics: (
    <>
      <path d="M4.5 19.5h15" />
      <path d="m5.5 16 4-4 3 2 5.5-7" />
      <circle cx="5.5" cy="16" r="1" />
      <circle cx="9.5" cy="12" r="1" />
      <circle cx="12.5" cy="14" r="1" />
      <circle cx="18" cy="7" r="1" />
    </>
  ),
  dashboard: (
    <>
      <rect height="6.5" rx="1.75" width="7" x="3.5" y="3.5" />
      <rect height="10.5" rx="1.75" width="7" x="13.5" y="3.5" />
      <rect height="10.5" rx="1.75" width="7" x="3.5" y="13.5" />
      <rect height="6.5" rx="1.75" width="7" x="13.5" y="17.5" />
    </>
  ),
  help: (
    <>
      <path d="M5 5.5h14a2 2 0 0 1 2 2v8.25a2 2 0 0 1-2 2h-7.5L7 21v-3.25H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="M9.6 10a2.55 2.55 0 1 1 4.45 1.7c-.82.72-2.05 1.08-2.05 2.3" />
      <path d="M12 16.2h.01" />
    </>
  ),
  integration: (
    <>
      <path d="M9.35 14.65 7.7 16.3a3.55 3.55 0 0 1-5-5l3-3a3.55 3.55 0 0 1 5 0" />
      <path d="m14.65 9.35 1.65-1.65a3.55 3.55 0 1 1 5 5l-3 3a3.55 3.55 0 0 1-5 0" />
      <path d="m8.5 15.5 7-7" />
    </>
  ),
  leads: (
    <>
      <rect height="16" rx="3" width="18" x="3" y="4" />
      <circle cx="8.25" cy="10" r="2.15" />
      <path d="M5.5 16c.55-1.9 1.5-2.8 2.75-2.8S10.45 14.1 11 16" />
      <path d="M14.5 9h3.25M14.5 13h3.25M14.5 17h2" />
    </>
  ),
  more: (
    <>
      <rect height="6.5" rx="1.8" width="6.5" x="3.5" y="3.5" />
      <rect height="6.5" rx="1.8" width="6.5" x="14" y="3.5" />
      <rect height="6.5" rx="1.8" width="6.5" x="3.5" y="14" />
      <rect height="6.5" rx="1.8" width="6.5" x="14" y="14" />
      <path d="M17.25 16.25v2.25M16.125 17.375h2.25" />
    </>
  ),
  notification: (
    <>
      <path d="M18.5 10.5a6.5 6.5 0 0 0-13 0c0 5.15-2.25 5.75-2.25 7.5h17.5c0-1.75-2.25-2.35-2.25-7.5Z" />
      <path d="M9.75 21h4.5" />
      <circle cx="18.5" cy="5" r="2.25" />
    </>
  ),
  privacy: (
    <>
      <path d="M12 3.25 5.5 6.1v5.4c0 4.15 2.45 7.25 6.5 9.4 4.05-2.15 6.5-5.25 6.5-9.4V6.1L12 3.25Z" />
      <path d="M9.25 11.5h5.5v4h-5.5zM10.25 11.5V10a1.75 1.75 0 0 1 3.5 0v1.5" />
    </>
  ),
  processes: (
    <>
      <rect height="5.5" rx="1.65" width="6.5" x="3" y="3.5" />
      <rect height="5.5" rx="1.65" width="6.5" x="14.5" y="15" />
      <circle cx="17.75" cy="6.25" r="2.75" />
      <circle cx="6.25" cy="17.75" r="2.75" />
      <path d="M9.5 6.25h5.5M6.25 9v6M9 17.75h5.5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h5M15 6h5M4 12h9M17 12h3M4 18h2M12 18h8" />
      <rect height="4" rx="2" width="6" x="9" y="4" />
      <rect height="4" rx="2" width="4" x="13" y="10" />
      <rect height="4" rx="2" width="6" x="6" y="16" />
    </>
  ),
  templates: (
    <>
      <rect height="14" rx="2.5" width="14" x="6.5" y="6.5" />
      <path d="M17.5 6.5V4.75A1.75 1.75 0 0 0 15.75 3h-11A1.75 1.75 0 0 0 3 4.75v11a1.75 1.75 0 0 0 1.75 1.75H6.5" />
      <path d="M10 11h7M10 15h5" />
    </>
  ),
};

export function PanelNavigationIcon({
  name,
  strokeWidth = 1.6,
  ...props
}: Readonly<{ name: PanelIconName }> & Omit<SVGProps<SVGSVGElement>, "children">) {
  const paths = navigationPaths[name];

  if (!paths) {
    return <PanelIcon name={name} strokeWidth={strokeWidth} {...props} />;
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      {...props}
    >
      {paths}
    </svg>
  );
}
