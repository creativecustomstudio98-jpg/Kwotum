export const colorTokens = {
  background: "#F7F6F1",
  surface: "#FFFFFF",
  surfaceMuted: "#EFF0EB",
  textPrimary: "#1A211E",
  textSecondary: "#46504B",
  textMuted: "#626B66",
  border: "#C9D0CB",
  borderStrong: "#69726D",
  brand: "#143D2F",
  brandHover: "#0F3025",
  brandSoft: "#DCE9E1",
  success: "#2F6A4F",
  successSoft: "#E3F0E8",
  danger: "#8A2F35",
  dangerSoft: "#FCE8E9",
  warning: "#7A4A08",
  warningSoft: "#FFF3D9",
  info: "#255A82",
  infoSoft: "#E8F2FA",
  overlay: "rgb(10 23 18 / 58%)",
  inverseBorder: "rgb(255 255 255 / 18%)",
  inverseBorderStrong: "rgb(255 255 255 / 62%)",
  inverseHover: "rgb(255 255 255 / 8%)",
  inverseActive: "rgb(255 255 255 / 12%)",
  dangerBorder: "#D9A3A8",
  focus: "#143D2F",
  text: "#1A211E",
  accent: "#DCE9E1",
  accentStrong: "#143D2F",
  accentText: "#143D2F",
  error: "#8A2F35",
  errorSoft: "#FCE8E9",
} as const;

export const marketingColorTokens = {
  background: "#F7FAFE",
  canvas: "#F3F8FD",
  surface: "#FFFFFF",
  surfaceSoft: "#F3FAF6",
  textPrimary: "#0B1530",
  textSecondary: "#5E6981",
  border: "#DDE5EE",
  brand: "#06753A",
  brandHover: "#056E32",
  brandSoft: "#E7F5EC",
  success: "#15964A",
} as const;

export const panelSidebarTokens = {
  widthExpanded: "256px",
  widthCollapsed: "72px",
  background: "#0D2B24",
  text: "#EEF2EF",
  textMuted: "#C8D3CC",
  textSubtle: "#91A39A",
  label: "#8CD79E",
  line: "rgb(221 228 218 / 14%)",
  hover: "rgb(255 255 255 / 5.5%)",
  activeBackground: "#DDE4DA",
  activeText: "#10382D",
  focus: "#8CD79E",
  status: "#8BDD9A",
  accountBackground: "rgb(255 255 255 / 2.5%)",
  accountBorder: "rgb(221 228 218 / 16%)",
} as const;

export const spacingTokens = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;

export const radiusTokens = {
  small: "0.25rem",
  medium: "0.5rem",
  large: "0.75rem",
  pill: "999px",
  control: "0.5rem",
  panel: "0.75rem",
} as const;

export const shadowTokens = {
  small: "0 1px 2px rgb(20 61 47 / 4%), 0 3px 10px rgb(20 61 47 / 4%)",
  medium: "0 8px 24px rgb(20 61 47 / 6%)",
} as const;

export const typeTokens = {
  xs: "0.75rem",
  small: "0.875rem",
  body: "1rem",
  bodyLarge: "1.125rem",
  titleSmall: "1.25rem",
  titleMedium: "1.5rem",
  titleLarge: "2rem",
  displaySmall: "2.5rem",
  displayMedium: "3.25rem",
  displayLarge: "4rem",
} as const;

export const motionTokens = {
  fast: "120ms",
  standard: "180ms",
  panel: "240ms",
} as const;
