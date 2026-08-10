import type { LeadStatus } from "@wyceno/database";

export const leadStatuses: readonly LeadStatus[] = [
  "new",
  "in_progress",
  "qualified",
  "won",
  "lost",
  "spam",
];

export const leadStatusLabels: Readonly<Record<LeadStatus, string>> = {
  in_progress: "W kontakcie",
  lost: "Utracony",
  new: "Nowy",
  qualified: "Zakwalifikowany",
  spam: "Spam",
  won: "Wygrany",
};
