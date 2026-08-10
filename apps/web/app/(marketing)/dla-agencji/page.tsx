import { marketingMetadata } from "../../../lib/marketing/metadata";
import { CtaBand } from "../components";
import { AgencyHero } from "./agency-hero";
import { AgencyIsolation } from "./agency-isolation";
import { AgencyMethod } from "./agency-method";
import { AgencyOwnership } from "./agency-ownership";

export const metadata = marketingMetadata(
  "Formularze wyceny dla agencji WordPress i web",
  "Projektuj prowadzone formularze dla firm usługowych, publikuj wersje i przekazuj klientom uporządkowane leady bez logiki kopiowanej między stronami.",
  "/dla-agencji",
);

export default function AgencyPage() {
  return (
    <>
      <AgencyHero />
      <AgencyMethod />

      <AgencyOwnership />

      <AgencyIsolation />

      <CtaBand
        description="Porównaj trzy priorytetowe branże i zobacz, jak zmienia się zestaw pytań przy wspólnej architekturze."
        title="Zbuduj usługę wdrożeniową wokół jakości briefu."
      />
    </>
  );
}
