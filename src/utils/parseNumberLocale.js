export function parseNumberLocale(input) {
  // Detect the presence of commas and periods
  const periodIndex = input.lastIndexOf('.');
  const commaIndex = input.lastIndexOf(',');

  if (periodIndex > -1 && commaIndex > -1) {
    // Both separators are present
    if (periodIndex > commaIndex) {
      // Period is after comma, period likely the decimal separator
      return parseFloat(input.replace(/,/g, ''));
    } else {
      // Comma is after period, comma likely the decimal separator
      return parseFloat(input.replace(/\./g, '').replace(/,/g, '.'));
    }
  } else if (commaIndex > -1) {
    // Only commas are present
    const parts = input.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Comma appears to be a decimal separator
      return parseFloat(input.replace(/,/g, '.'));
    } else {
      // Comma appears to be a thousand separator
      return parseFloat(input.replace(/,/g, ''));
    }
  } else if (periodIndex > -1) {
    // Only periods are present
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Period appears to be a decimal separator
      return parseFloat(input);
    } else if (parts.length === 2) {
      // Period with more than 2 digits after it, still treat it as a decimal separator
      return parseFloat(input);
    } else {
      // Multiple periods or period appearing as thousand separator
      return parseFloat(input.replace(/\./g, ''));
    }
  }

  // No separators, plain number
  return parseFloat(input);
}
