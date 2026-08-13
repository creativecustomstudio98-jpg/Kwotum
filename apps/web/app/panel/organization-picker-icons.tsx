import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const common = {
  "aria-hidden": true,
  fill: "none",
  focusable: false,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.8,
  viewBox: "0 0 24 24",
};

export function OrganizationLayersIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m4 9 8-5 8 5-8 5-8-5Z" />
      <path d="m5.5 13 6.5 4 6.5-4M5.5 17l6.5 4 6.5-4" />
    </svg>
  );
}

export function OrganizationShieldIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M12 3.5 19 6v5.2c0 4.2-2.8 7.6-7 9.3-4.2-1.7-7-5.1-7-9.3V6l7-2.5Z" />
      <path d="m9.2 12 1.8 1.8 4-4" />
    </svg>
  );
}

export function OrganizationChartIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M4 20V10M9.3 20V5M14.7 20v-7M20 20V3" />
      <path d="M2.5 20.5h19" />
    </svg>
  );
}

export function OrganizationHelpIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9.1a2.5 2.5 0 0 1 4.8.9c0 1.9-2.5 2.2-2.5 4M12 17.7h.01" />
    </svg>
  );
}

export function OrganizationSearchIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  );
}

export function OrganizationLogoutIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="M10 5H5.5v14H10M14.5 8l4 4-4 4M8 12h10" />
    </svg>
  );
}

export function OrganizationChevronIcon(props: IconProps) {
  return (
    <svg {...common} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}
