import type { SVGProps } from "react";

export type PanelIconName =
  | "analytics"
  | "arrow-left"
  | "arrow-right"
  | "attachment"
  | "calendar"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "dashboard"
  | "edit"
  | "email"
  | "external"
  | "file"
  | "folder"
  | "help"
  | "info"
  | "integration"
  | "leads"
  | "location"
  | "menu"
  | "money"
  | "more"
  | "notification"
  | "phone"
  | "plus"
  | "privacy"
  | "processes"
  | "preview"
  | "search"
  | "settings"
  | "sort"
  | "star"
  | "templates"
  | "undo"
  | "user"
  | "warning";

export function PanelIcon({
  name,
  ...props
}: Readonly<{ name: PanelIconName }> & Omit<SVGProps<SVGSVGElement>, "children">) {
  const paths: Record<PanelIconName, React.ReactNode> = {
    analytics: <path d="M5 19V13M10 19V9M15 19V5M20 19V11M3 21h18" />,
    "arrow-left": <path d="m15 18-6-6 6-6" />,
    "arrow-right": <path d="m9 18 6-6-6-6M4 12h11" />,
    attachment: (
      <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L14 3a3.5 3.5 0 0 1 5 5l-9.5 9.5a2 2 0 0 1-3-3L15 6" />
    ),
    calendar: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    "chevron-left": <path d="m15 18-6-6 6-6" />,
    "chevron-right": <path d="m9 18 6-6-6-6" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    dashboard: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4.5-1 10-10a2 2 0 0 0-5-5l-10 10L3 19a1 1 0 0 0 1 1Z" />
      </>
    ),
    email: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    external: (
      <path d="M14 5h5v5M19 5l-9 9M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    ),
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
    folder: (
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.7 2.7 0 1 1 4.8 1.7c-.9.8-2.3 1.3-2.3 2.8M12 17h.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    integration: (
      <>
        <path d="M8 7h8v5a4 4 0 0 1-8 0V7ZM10 4v3M14 4v3M12 16v4" />
        <path d="M7 20h10" />
      </>
    ),
    leads: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 14.5a5 5 0 0 1 6.5 5" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    money: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    more: (
      <>
        <rect height="5" rx="1.4" width="5" x="4" y="4" />
        <rect height="5" rx="1.4" width="5" x="15" y="4" />
        <rect height="5" rx="1.4" width="5" x="4" y="15" />
        <rect height="5" rx="1.4" width="5" x="15" y="15" />
      </>
    ),
    notification: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    phone: (
      <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2a14 14 0 0 1-8-8l2-2-2-4Z" />
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    privacy: (
      <>
        <path d="M12 3 5.5 6v5.5c0 4.2 2.6 7.4 6.5 9.5 3.9-2.1 6.5-5.3 6.5-9.5V6L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    processes: (
      <>
        <rect height="5" rx="1" width="5" x="3" y="4" />
        <rect height="5" rx="1" width="5" x="16" y="4" />
        <rect height="5" rx="1" width="5" x="9.5" y="15" />
        <path d="M8 6.5h8M5.5 9v2.5h6.5V15M18.5 9v2.5H12V15" />
      </>
    ),
    preview: (
      <>
        <path d="M2.8 12s3.3-6 9.2-6 9.2 6 9.2 6-3.3 6-9.2 6-9.2-6-9.2-6Z" />
        <circle cx="12" cy="12" r="2.7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    sort: <path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    templates: (
      <>
        <rect height="15" rx="2" width="17" x="3.5" y="5" />
        <path d="M8 5V3h8v2M8 10h8M8 14h5" />
      </>
    ),
    undo: (
      <>
        <path d="m8 7-4 4 4 4" />
        <path d="M4 11h9a6 6 0 1 1 0 12" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 2.8 19a1.3 1.3 0 0 0 1.1 2h16.2a1.3 1.3 0 0 0 1.1-2L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
