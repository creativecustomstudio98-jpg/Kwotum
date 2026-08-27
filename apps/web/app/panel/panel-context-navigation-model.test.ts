import { describe, expect, it } from "vitest";

import {
  integrationsNavigationItems,
  isPanelContextNavigationItemActive,
  settingsNavigationItems,
} from "./panel-context-navigation-model";

const organizationId = "00000000-0000-4000-8000-000000000001";
const organizationRoot = `/panel/${organizationId}`;

describe("panel context navigation model", () => {
  it("marks only the route represented by a navigation item as current", () => {
    expect(
      isPanelContextNavigationItemActive(
        `${organizationRoot}/ustawienia/`,
        `${organizationRoot}/ustawienia`,
      ),
    ).toBe(true);
    expect(
      isPanelContextNavigationItemActive(
        `${organizationRoot}/powiadomienia`,
        `${organizationRoot}/ustawienia`,
      ),
    ).toBe(false);
  });

  it("includes the privacy destination only when the tenant capability allows it", () => {
    expect(settingsNavigationItems(organizationId, { showPrivacy: false })).toEqual([
      {
        href: `${organizationRoot}/ustawienia`,
        icon: "settings",
        label: "Organizacja",
      },
      {
        href: `${organizationRoot}/powiadomienia`,
        icon: "notification",
        label: "Powiadomienia",
      },
    ]);
    expect(settingsNavigationItems(organizationId, { showPrivacy: true })).toEqual([
      {
        href: `${organizationRoot}/ustawienia`,
        icon: "settings",
        label: "Organizacja",
      },
      {
        href: `${organizationRoot}/powiadomienia`,
        icon: "notification",
        label: "Powiadomienia",
      },
      {
        href: `${organizationRoot}/prywatnosc`,
        icon: "privacy",
        label: "Dane i prywatność",
      },
    ]);
  });

  it("builds each integration destination from its own capability", () => {
    expect(
      integrationsNavigationItems(organizationId, {
        showWebhooks: true,
        showWordPress: false,
      }),
    ).toEqual([{ href: `${organizationRoot}/integracje/webhooki`, label: "Webhooki" }]);
    expect(
      integrationsNavigationItems(organizationId, {
        showWebhooks: false,
        showWordPress: true,
      }),
    ).toEqual([{ href: `${organizationRoot}/integracje/wordpress`, label: "WordPress" }]);
  });
});
