export function getSafeLocalDestination(
  value: string | string[] | null | undefined,
  fallback = "/panel",
): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : fallback;
}
