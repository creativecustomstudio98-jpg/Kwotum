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
      <rect height="6.5" rx="1.5" width="6.5" x="3.5" y="3.5" />
      <rect height="6.5" rx="1.5" width="6.5" x="14" y="3.5" />
      <rect height="6.5" rx="1.5" width="6.5" x="3.5" y="14" />
      <rect height="6.5" rx="1.5" width="6.5" x="14" y="14" />
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
      <path d="M8.5 3.5H5.75A2.25 2.25 0 0 0 3.5 5.75V9h2a2.5 2.5 0 0 1 0 5h-2v4.25a2.25 2.25 0 0 0 2.25 2.25H10v-2a2.5 2.5 0 0 1 5 0v2h3.25a2.25 2.25 0 0 0 2.25-2.25V14h-2a2.5 2.5 0 0 1 0-5h2V5.75a2.25 2.25 0 0 0-2.25-2.25H15v2a2.5 2.5 0 0 1-5 0v-2H8.5Z" />
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
      <circle cx="6" cy="5" r="2.5" />
      <circle cx="6" cy="18.5" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M6 7.5V16M8.5 18.5h7M16.25 16.75 14 14.5" />
      <circle cx="13" cy="13.5" r="1.5" />
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
