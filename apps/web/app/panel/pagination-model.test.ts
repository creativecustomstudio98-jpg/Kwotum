import { describe, expect, it } from "vitest";

import {
  clampListPage,
  paginateCollection,
  paginationItems,
  parseListPage,
} from "./pagination-model";

describe("panel list pagination", () => {
  it("parses one safe page value and rejects malformed input", () => {
    expect(parseListPage(undefined)).toBe(1);
    expect(parseListPage("0")).toBe(1);
    expect(parseListPage("2.5")).toBe(1);
    expect(parseListPage(["7", "2"])).toBe(7);
    expect(parseListPage("13")).toBe(13);
  });

  it("covers empty, single-record and 100+ collections", () => {
    expect(paginateCollection([], 8, 8)).toMatchObject({ items: [], page: 1, pageCount: 1 });
    expect(paginateCollection(["only"], 1, 8)).toMatchObject({
      items: ["only"],
      page: 1,
      pageCount: 1,
    });

    const records = Array.from({ length: 101 }, (_, index) => index + 1);
    expect(paginateCollection(records, 13, 8)).toMatchObject({
      items: [97, 98, 99, 100, 101],
      page: 13,
      pageCount: 13,
      total: 101,
    });
    expect(clampListPage(99, records.length, 8)).toBe(13);
  });

  it("keeps compact page windows around both boundaries", () => {
    expect(paginationItems(1, 12)).toEqual([1, 2, 3, "ellipsis", 12]);
    expect(paginationItems(6, 12)).toEqual([1, "ellipsis", 6, "ellipsis", 12]);
    expect(paginationItems(12, 12)).toEqual([1, "ellipsis", 10, 11, 12]);
  });
});
