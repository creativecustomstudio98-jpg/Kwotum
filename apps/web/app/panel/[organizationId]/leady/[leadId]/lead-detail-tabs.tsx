"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "summary-panel", key: "summary", label: "Podsumowanie" },
  { id: "answers-panel", key: "answers", label: "Odpowiedzi" },
  { id: "files-panel", key: "files", label: "Pliki" },
  { id: "history-panel", key: "history", label: "Historia" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

function sectionFromHash(hash: string): SectionKey {
  const id = hash.replace(/^#/, "");
  return sections.find((section) => section.id === id)?.key ?? "summary";
}

export function LeadDetailTabs() {
  const [activeSection, setActiveSection] = useState<SectionKey>("summary");

  useEffect(() => {
    const synchronize = () => setActiveSection(sectionFromHash(window.location.hash));
    synchronize();
    window.addEventListener("hashchange", synchronize);
    return () => window.removeEventListener("hashchange", synchronize);
  }, []);

  return (
    <nav aria-label="Sekcje szczegółów leada" className="lead-reference-tabs">
      {sections.map((section) => {
        const active = activeSection === section.key;
        return (
          <a
            aria-controls={section.id}
            aria-current={active ? "location" : undefined}
            className={`is-${section.key}${active ? " is-active" : ""}`}
            href={`#${section.id}`}
            key={section.id}
            onClick={() => {
              setActiveSection(section.key);
              window.setTimeout(() => {
                document.getElementById(section.id)?.focus({ preventScroll: true });
              }, 0);
            }}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
