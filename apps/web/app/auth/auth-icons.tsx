import type { ReactNode, SVGProps } from "react";

export type AuthIconName =
  | "analytics"
  | "arrow"
  | "check"
  | "clock"
  | "email"
  | "eye"
  | "eyeOff"
  | "integrations"
  | "location"
  | "lock"
  | "people"
  | "process"
  | "shield"
  | "support"
  | "user";

export function AuthIcon({
  name,
  ...props
}: Readonly<{ name: AuthIconName }> & SVGProps<SVGSVGElement>) {
  const paths: Record<AuthIconName, ReactNode> = {
    analytics: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        <path d="m4 8 5-4 5 5 6-6" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.5 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.2 3" />
        <path d="M6.1 6.1C3.8 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5" />
      </>
    ),
    integrations: (
      <>
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="m8.7 10.7 6.6-3.4m-6.6 6 6.6 3.4" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-4 2-6 6-6s6 2 6 6" />
        <path d="M16 5.5a3 3 0 0 1 0 5.5m1 3c2.7.6 4 2.5 4 6" />
      </>
    ),
    process: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <path d="M10 6.5h4a3.5 3.5 0 0 1 3.5 3.5v4M14 17.5h-4A3.5 3.5 0 0 1 6.5 14v-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 4 5v6c0 5.4 3.3 9 8 11 4.7-2 8-5.6 8-11V5l-8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    support: (
      <>
        <path d="M4 13a8 8 0 0 1 16 0" />
        <path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 1Zm16 0v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 1Z" />
        <path d="M16 19c0 1.5-1.4 2-4 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-5 2.7-7 8-7s8 2 8 7" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  );
}

export function GoogleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.8-2.3l-3.3-2.6c-.9.6-2.1 1-3.5 1a6 6 0 0 1-5.6-4.1H3v2.6A10.3 10.3 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path d="M6.4 14a6.1 6.1 0 0 1 0-3.9V7.4H3A10.1 10.1 0 0 0 3 16.6L6.4 14Z" fill="#FBBC05" />
      <path
        d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.8 9.8 0 0 0 3 7.4l3.4 2.7A6 6 0 0 1 12 5.9Z"
        fill="#EA4335"
      />
    </svg>
  );
}
