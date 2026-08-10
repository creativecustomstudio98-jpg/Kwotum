import { marketingMetadata, siteOrigin } from "../../lib/marketing/metadata";
import { JsonLd } from "./components";
import { HomeMotion } from "./home-motion";
import { HomeRedesign } from "./home-redesign";

export const metadata = marketingMetadata(
  "Uporządkowane zapytania i leady gotowe do sprzedaży",
  "Kwotum zbiera zakres, budżet, termin, lokalizację i materiały, kwalifikuje zapytanie według reguł firmy i wskazuje następny krok sprzedażowy.",
  "/",
);

export default function HomePage() {
  return (
    <>
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "Organization",
          description:
            "Oprogramowanie do porządkowania zapytań, kwalifikacji leadów i obsługi następnego kroku sprzedażowego.",
          name: "Kwotum",
          url: siteOrigin,
        }}
      />
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          applicationCategory: "BusinessApplication",
          description:
            "Prowadzony proces zapytania, kwalifikacja leadów i uporządkowany brief dla polskich firm usługowych.",
          featureList: [
            "Formularz wieloetapowy",
            "Orientacyjny pricing",
            "Lead scoring",
            "Widget na stronę",
            "Tenantowy panel leadów",
          ],
          name: "Kwotum",
          operatingSystem: "Web",
          url: siteOrigin,
        }}
      />
      <HomeRedesign />

      <HomeMotion rootId="lorum-home" />
    </>
  );
}
