import { BigRational } from 'big-rational-ts';

/**
 * Converts a number or string representation of a number (integer or decimal)
 * into a BigRational object.
 *
 * @param {string | number} value - The number or string to convert.
 * @returns {BigRational} The BigRational representation.
 * @throws {Error} if the input is invalid or cannot be converted.
 */
export function toBigRational(value: string | number): BigRational {
  const stringValue = String(value).trim();

  if (stringValue === '') {
    throw new Error('Input value cannot be empty.');
  }

  // Handle scientific notation (e.g., "1.23e-5")
  if (stringValue.toLowerCase().includes('e')) {
    const num = Number(stringValue);
    if (isNaN(num) || !isFinite(num)) {
      throw new Error(`Invalid scientific notation input: "${stringValue}"`);
    }
    // Convert to a string with sufficient precision.
    // This is a tricky part, as JavaScript's number precision can be an issue.
    // For very small or very large numbers, this might lose precision.
    // A more robust solution for scientific notation might require a library
    // that handles arbitrary precision decimal arithmetic before converting to rational.
    // However, for typical user inputs, this should be acceptable.
    // Let's try to get a reasonable number of decimal places.
    let decimalPlaces = 0;
    if (num !== 0) {
        const eParts = stringValue.toLowerCase().split('e');
        if (eParts.length === 2) {
            const exp = parseInt(eParts[1], 10);
            if (!isNaN(exp)) {
                const baseParts = eParts[0].split('.');
                if (baseParts.length === 2) {
                    decimalPlaces = baseParts[1].length - exp;
                } else {
                    decimalPlaces = -exp;
                }
                decimalPlaces = Math.max(0, decimalPlaces); // Ensure non-negative
            }
        }
    }
    // Cap decimal places to avoid overly large intermediate strings
    // This limit is somewhat arbitrary and might need adjustment.
    const maxDecimalPlaces = 20;
    const effectiveDecimalPlaces = Math.min(decimalPlaces, maxDecimalPlaces);

    return toBigRational(num.toFixed(effectiveDecimalPlaces));
  }

  const parts = stringValue.split('.');
  let numeratorString = parts[0];
  let denominatorBigInt = 1n;

  if (parts.length > 2) {
    throw new Error(`Invalid number format: "${stringValue}"`);
  }

  if (parts.length === 2) {
    const decimalPart = parts[1];
    if (!/^\d+$/.test(decimalPart)) {
      throw new Error(`Invalid characters in decimal part: "${decimalPart}"`);
    }
    numeratorString += decimalPart;
    denominatorBigInt = BigInt('1' + '0'.repeat(decimalPart.length));
  }

  if (!/^-?\d+$/.test(numeratorString)) {
    throw new Error(`Invalid characters in number: "${numeratorString}"`);
  }

  const numeratorBigInt = BigInt(numeratorString);

  if (denominatorBigInt === 0n) {
    // This case should ideally not be reached if logic is correct
    throw new Error('Denominator cannot be zero.');
  }

  return new BigRational(numeratorBigInt, denominatorBigInt).reduce();
}
