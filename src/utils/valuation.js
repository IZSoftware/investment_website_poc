export const VALUATION_UNITS = [
  { value: 'THOUSANDS', suffix: 'Th', label: 'Thousands (Th)' },
  { value: 'MILLIONS', suffix: 'M', label: 'Millions (M)' },
  { value: 'BILLIONS', suffix: 'B', label: 'Billions (B)' },
];

export const CURRENCY_OPTIONS = [
  { value: 'USD', symbol: '$', label: 'USD ($)' },
  { value: 'KES', symbol: 'KES', label: 'KES' },
];

// Builds the `valuation` object the API expects. `displayText` is
// SERVER-derived on every write (README §9) — never send or compute it here;
// always render the value the API echoes back.
export const buildValuation = ({ currency, amount, unit, allocationPercent, asAtDate }) => ({
  currency,
  amount: amount === '' || amount === null || amount === undefined ? 0 : Number(amount),
  unit,
  allocationPercent:
    allocationPercent === '' || allocationPercent === null || allocationPercent === undefined
      ? 0
      : Number(allocationPercent),
  asAtDate,
});

// "YYYY-MM-DD" -> a Date at LOCAL midnight on that same calendar day.
//
// `new Date('2026-06-15')` is parsed as UTC midnight while formatAsAtDate below reads
// local calendar fields, so anywhere west of UTC the pair walks the date one day
// backwards every time a record is opened and saved. asAtDate is a plain calendar date
// with no zone attached, so it has to be read as one.
export const parseCalendarDate = (value) => {
  if (!value) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!parts) return new Date(value);
  return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
};

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
    asAtDate: parseCalendarDate(valuation.asAtDate),
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
    // Read as a calendar date, not UTC midnight, or the day shown slips backwards
    // west of UTC.
    const d = parseCalendarDate(asAtDate);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return asAtDate;
  }
};
