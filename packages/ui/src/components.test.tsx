import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Button, FormField, Input, Menu, SegmentedControl, Switch, Tabs } from "./components";

describe("Button", () => {
  it("blokuje działanie i komunikuje ładowanie", async () => {
    const user = userEvent.setup();
    let calls = 0;
    render(
      <Button loading onClick={() => (calls += 1)}>
        Zapisz
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Proszę czekać…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(calls).toBe(0);
  });

  it("zachowuje szerokość etykiety i pozwala nazwać stan ładowania", () => {
    render(
      <Button loading loadingLabel="Zapisywanie zmian…">
        Zapisz bardzo długą nazwę organizacji
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Zapisywanie zmian…" })).toHaveAttribute(
      "data-loading",
      "true",
    );
    expect(screen.getByText("Zapisz bardzo długą nazwę organizacji")).toHaveAttribute(
      "data-hidden",
      "true",
    );
  });
});

describe("FormField", () => {
  it("łączy etykietę, instrukcję i błąd z kontrolką", () => {
    render(
      <FormField
        error="Podaj poprawny adres."
        hint="Na ten adres wyślemy potwierdzenie."
        label="E-mail"
      >
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "E-mail" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(screen.getByText("Podaj poprawny adres.")).toBeVisible();
  });

  it("komunikuje sukces i daje pierwszeństwo błędowi", () => {
    const { rerender } = render(
      <FormField label="Nazwa" success="Nazwa jest dostępna.">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: "Nazwa" });
    expect(screen.getByRole("status")).toHaveTextContent("Nazwa jest dostępna.");
    expect(input).toHaveAttribute("aria-describedby");

    rerender(
      <FormField error="Nazwa jest zajęta." label="Nazwa" success="Nazwa jest dostępna.">
        <Input />
      </FormField>,
    );
    expect(screen.queryByText("Nazwa jest dostępna.")).not.toBeInTheDocument();
    expect(screen.getByText("Nazwa jest zajęta.")).toBeVisible();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Switch", () => {
  it("zachowuje natywny checkbox i przełącza się etykietą", async () => {
    const user = userEvent.setup();
    render(
      <Switch description="Usuwaj leady po zatwierdzonym okresie." label="Automatyczne usuwanie" />,
    );
    const control = screen.getByRole("switch", { name: "Automatyczne usuwanie" });
    expect(control).not.toBeChecked();
    await user.click(screen.getByText("Automatyczne usuwanie"));
    expect(control).toBeChecked();
    expect(control).toHaveAttribute("aria-describedby");
  });
});

describe("SegmentedControl", () => {
  it("obsługuje strzałki i pomija wyłączoną opcję", async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState("week");
      return (
        <SegmentedControl
          items={[
            { label: "Tydzień", value: "week" },
            { disabled: true, label: "Miesiąc", value: "month" },
            { label: "Kwartał", value: "quarter" },
          ]}
          label="Zakres raportu"
          onChange={setValue}
          value={value}
        />
      );
    }

    render(<Example />);
    const week = screen.getByRole("button", { name: "Tydzień" });
    week.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Kwartał" })).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Home}");
    expect(week).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: "Kwartał" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Menu", () => {
  it("otwiera się z klawiatury, pomija disabled i oddaje fokus po Escape", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        items={[
          { id: "edit", label: "Edytuj", onSelect: () => undefined },
          { disabled: true, id: "archive", label: "Archiwizuj", onSelect: () => undefined },
          { id: "delete", label: "Usuń", onSelect: () => undefined, tone: "danger" },
        ]}
        label="Więcej działań"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Więcej działań" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Edytuj" })).toHaveFocus());
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Usuń" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("obsługuje strzałki, Home i End zgodnie z wzorcem ARIA", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        label="Przykładowe dane"
        tabs={[
          { content: "Treść pierwsza", id: "first", label: "Pierwsza" },
          { content: "Treść druga", id: "second", label: "Druga" },
          { content: "Treść trzecia", id: "third", label: "Trzecia" },
        ]}
      />,
    );
    const first = screen.getByRole("tab", { name: "Pierwsza" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Druga" })).toHaveFocus();
    expect(screen.getByText("Treść druga")).toBeVisible();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Trzecia" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
  });
});
