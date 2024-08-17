export function isNum(value) {
  if (value === null || value === undefined || value === '' || value === false) {
    return false;
  }

  const number = Number(value);

  if (isNaN(number)) {
    return false;
  }

  return true;
}

export function roundTo(numToRound, N) {
  if (isNaN(N) || N === 0) {
    throw new Error('Invalid rounding factor.');
  }
  const decimalPlaces = (N.toString().split('.')[1] || '').length;
  const scaleFactor = Math.pow(10, decimalPlaces);
  const scaledNum = numToRound * scaleFactor;
  const scaledN = N * scaleFactor;
  const result = Math.round(scaledNum / scaledN) * scaledN;
  return result / scaleFactor;
}

export function sigFigs(value) {
  const split = value.toString().split('.');
  if (split.length > 1) {
    return split[1].split('').length;
  }

  return 0;
}
