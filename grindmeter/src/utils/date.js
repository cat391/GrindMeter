// Formats a Date as YYYY-MM-DD in the user's local timezone.
// Session dates are stored and queried as local calendar days — do not use
// toISOString() for this, as it shifts the date to the UTC day.
export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
