export const sortByOrder = (arr = []) =>
  arr.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));


export const formatValuation = (valuation) => {
  if (!valuation) return '';
  if (valuation.displayText) return valuation.displayText;
  const { currency, amount, unit } = valuation;
  if (amount == null) return '';
  const unitLabel = unit === 'THOUSANDS' ? 'K' : unit === 'MILLIONS' ? 'M' : unit === 'BILLIONS' ? 'B' : '';
  return `${currency ?? ''} ${amount}${unitLabel}`.trim();
};