export type PaginationItem = number | "ellipsis";

export function parseListPage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !/^\d+$/.test(candidate)) return 1;
  const page = Number(candidate);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function clampListPage(page: number, total: number, pageSize: number): number {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
    throw new Error("Rozmiar strony musi być dodatnią liczbą całkowitą.");
  }
  const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
  return Math.min(Math.max(1, page), pageCount);
}

export function paginateCollection<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): Readonly<{ items: readonly T[]; page: number; pageCount: number; total: number }> {
  const currentPage = clampListPage(page, items.length, pageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageCount,
    total: items.length,
  };
}

export function paginationItems(currentPage: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", pageCount];
  if (currentPage >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, "ellipsis", currentPage, "ellipsis", pageCount];
}
