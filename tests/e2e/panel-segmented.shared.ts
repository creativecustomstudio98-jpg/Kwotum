import { expect, type Locator } from "@playwright/test";

export type SegmentedControlGeometry = Awaited<ReturnType<typeof readSegmentedControlGeometry>>;

export async function readSegmentedControlGeometry(track: Locator) {
  return track.evaluate((element) => {
    const trackBounds = element.getBoundingClientRect();
    const trackStyle = getComputedStyle(element);
    const items = Array.from(
      element.querySelectorAll<HTMLElement>(":scope > a, :scope > button"),
    ).filter((item) => item.getClientRects().length > 0);
    const itemBounds = items.map((item) => item.getBoundingClientRect());
    const active = items.find(
      (item) =>
        item.getAttribute("aria-current") === "page" ||
        item.getAttribute("aria-checked") === "true" ||
        item.getAttribute("aria-pressed") === "true" ||
        item.getAttribute("aria-selected") === "true",
    );
    const inactive = items.find((item) => item !== active);
    if (!active || !inactive) throw new Error("Segmented control needs active and inactive items.");
    const activeBounds = active.getBoundingClientRect();
    const activeStyle = getComputedStyle(active);
    const activeAfter = getComputedStyle(active, "::after");
    const inactiveStyle = getComputedStyle(inactive);
    const horizontalGaps = itemBounds.slice(1).map((bounds, index) => {
      const previous = itemBounds[index];
      return previous ? bounds.left - previous.right : 0;
    });

    return {
      activeAfterContent: activeAfter.content,
      activeAfterDisplay: activeAfter.display,
      activeAfterHeight: Number.parseFloat(activeAfter.height) || 0,
      activeAfterWidth: Number.parseFloat(activeAfter.width) || 0,
      activeBackgroundColor: activeStyle.backgroundColor,
      activeBorderBottomWidth: Number.parseFloat(activeStyle.borderBottomWidth),
      activeBorderRadius: Number.parseFloat(activeStyle.borderRadius),
      activeBoxShadow: activeStyle.boxShadow,
      activeHeight: activeBounds.height,
      horizontalGaps,
      inactiveBackgroundColor: inactiveStyle.backgroundColor,
      itemCount: items.length,
      itemHeights: itemBounds.map((bounds) => bounds.height),
      itemsInsideTrack: itemBounds.every(
        (bounds) => bounds.left >= trackBounds.left - 1 && bounds.right <= trackBounds.right + 1,
      ),
      itemWidths: itemBounds.map((bounds) => bounds.width),
      rowSpread:
        Math.max(...itemBounds.map((bounds) => bounds.top)) -
        Math.min(...itemBounds.map((bounds) => bounds.top)),
      trackBackgroundImage: trackStyle.backgroundImage,
      trackBorderRadius: Number.parseFloat(trackStyle.borderRadius),
      trackBoxShadow: trackStyle.boxShadow,
      trackHeight: trackBounds.height,
      trackOverflowX: trackStyle.overflowX,
      trackWidth: trackBounds.width,
    };
  });
}

export function expectSegmentedControlVisualContract(
  geometry: SegmentedControlGeometry,
  options: Readonly<{ minimumTargetHeight?: number }> = {},
) {
  const minimumTargetHeight = options.minimumTargetHeight ?? 40;
  const visibleUnderline =
    geometry.activeAfterDisplay !== "none" &&
    geometry.activeAfterContent !== "none" &&
    geometry.activeAfterHeight > 1 &&
    geometry.activeAfterWidth > 1;

  expect(geometry.itemCount).toBeGreaterThan(1);
  expect(geometry.trackBackgroundImage).toBe("none");
  expect(geometry.trackBoxShadow).toBe("none");
  expect(geometry.trackBorderRadius).toBeGreaterThanOrEqual(10);
  expect(geometry.activeBackgroundColor).not.toBe(geometry.inactiveBackgroundColor);
  expect(geometry.activeBorderBottomWidth).toBe(0);
  expect(geometry.activeBorderRadius).toBeGreaterThanOrEqual(7);
  expect(geometry.activeBoxShadow).toBe("none");
  expect(visibleUnderline).toBe(false);
  expect(geometry.itemHeights.every((height) => height >= minimumTargetHeight)).toBe(true);
}
