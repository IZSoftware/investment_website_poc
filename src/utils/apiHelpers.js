export const sortByOrder = (arr = []) =>
  arr.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

// Money is rendered from the server-derived `displayText` ONLY (README §9) —
// no client-side formatting fallback, so the site/portal/admin can't drift.
export const formatValuation = (valuation) => valuation?.displayText ?? '';
