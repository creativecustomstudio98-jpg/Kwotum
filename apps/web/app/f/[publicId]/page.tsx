import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HostedWidget } from "./hosted-widget";
import "./styles.css";

const publicIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type PageProps = { params: Promise<{ publicId: string }> };

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Uporządkowane zapytanie",
};

export default async function HostedFlowPage({ params }: PageProps) {
  const { publicId } = await params;
  if (!publicIdPattern.test(publicId)) notFound();

  return (
    <main className="hosted-flow">
      <a className="hosted-skip-link" href="#wyceno-formularz">
        Przejdź do formularza
      </a>
      <section id="wyceno-formularz" aria-label="Formularz zapytania">
        <HostedWidget publicId={publicId} />
      </section>
      <footer>Bezpieczny formularz obsługiwany przez Kwotum.</footer>
    </main>
  );
}
