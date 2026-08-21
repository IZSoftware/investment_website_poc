export const VALUATION_UNITS = [
  { value: 'THOUSANDS', suffix: 'Th', label: 'Thousands (Th)' },
  { value: 'MILLIONS', suffix: 'M', label: 'Millions (M)' },
  { value: 'BILLIONS', suffix: 'B', label: 'Billions (B)' },
];

export const CURRENCY_OPTIONS = [
  { value: 'USD', symbol: '$', label: 'USD ($)' },
  { value: 'KES', symbol: 'KES', label: 'KES' },
];

const unitSuffix = (unit) => VALUATION_UNITS.find((u) => u.value === unit)?.suffix || '';
const currencySymbol = (currency) => CURRENCY_OPTIONS.find((c) => c.value === currency)?.symbol || currency || '';

export const buildDisplayText = ({ currency, amount, unit }) => {
  const symbol = currencySymbol(currency);
  const suffix = unitSuffix(unit);
  return `${symbol} ${amount ?? 0} ${suffix}`.replace(/\s+/g, ' ').trim();
};

// Builds the full `valuation` object the API expects, including a
// frontend-computed `displayText` (confirmed with you: frontend sends this).
export const buildValuation = ({ currency, amount, unit, allocationPercent, asAtDate }) => ({
  currency,
  amount: amount === '' || amount === null || amount === undefined ? 0 : Number(amount),
  unit,
  allocationPercent:
    allocationPercent === '' || allocationPercent === null || allocationPercent === undefined
      ? 0
      : Number(allocationPercent),
  asAtDate,
  displayText: buildDisplayText({ currency, amount, unit }),
});

// Turns an API `valuation` object into flat form-field values for editing.
export const parseValuation = (valuation) => {
  if (!valuation) {
    return { currency: 'USD', amount: '', unit: 'BILLIONS', allocationPercent: '', asAtDate: null };
  }
  return {
    currency: valuation.currency || 'USD',
    amount: valuation.amount ?? '',
    unit: valuation.unit || 'BILLIONS',
    allocationPercent: valuation.allocationPercent ?? '',
    asAtDate: valuation.asAtDate ? new Date(valuation.asAtDate) : null,
  };
};

// JS Date -> "YYYY-MM-DD" for the API's `asAtDate`.
export const formatAsAtDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const formatDisplayDate = (asAtDate) => {
  if (!asAtDate) return '';
  try {
    return new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return asAtDate;
  }
};