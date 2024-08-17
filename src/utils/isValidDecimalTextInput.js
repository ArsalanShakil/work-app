export default function isValidDecimalTextInput(text) {
  // The regular expression checks:
  // ^ - start of the string
  // $ - end of the string
  // (\d*) - allows zero or more digits
  // ([.,])? - allows zero or one decimal point or comma
  // (\d{0,2}) - allows zero to two digits after the decimal point or comma
  const regex = /^(\d*)([.,])?(\d{0,2})?$/;

  // Check if the text matches the pattern
  return (
    regex.test(text) && // checks the pattern
    !(text.includes('..') || text.includes(',,') || text.includes('.,') || text.includes(',.'))
  ); // disallows multiple decimal/comma errors
}
