import Link from "next/link";

import { paginationItems } from "./pagination-model";

export function PanelPagination({
  ariaLabel,
  currentPage,
  hrefForPage,
  pageCount,
}: Readonly<{
  ariaLabel: string;
  currentPage: number;
  hrefForPage: (page: number) => string;
  pageCount: number;
}>) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={ariaLabel} className="panel-pagination">
      {currentPage === 1 ? (
        <span aria-disabled="true" aria-label="Poprzednia strona" className="is-disabled">
          ‹
        </span>
      ) : (
        <Link aria-label="Poprzednia strona" href={hrefForPage(currentPage - 1)}>
          ‹
        </Link>
      )}
      {paginationItems(currentPage, pageCount).map((item, index) =>
        item === "ellipsis" ? (
          <span aria-hidden="true" className="panel-pagination__ellipsis" key={`e-${index}`}>
            …
          </span>
        ) : (
          <Link
            aria-current={item === currentPage ? "page" : undefined}
            className={`panel-pagination__page${item === 1 || item === pageCount ? " is-edge" : ""}`}
            href={hrefForPage(item)}
            key={item}
          >
            {item}
          </Link>
        ),
      )}
      {currentPage === pageCount ? (
        <span aria-disabled="true" aria-label="Następna strona" className="is-disabled">
          ›
        </span>
      ) : (
        <Link aria-label="Następna strona" href={hrefForPage(currentPage + 1)}>
          ›
        </Link>
      )}
    </nav>
  );
}
