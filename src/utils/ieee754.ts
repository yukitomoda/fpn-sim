// src/utils/ieee754.ts

export const EXPONENT_BITS = 11;
export const SIGNIFICAND_BITS = 52;
export const EXPONENT_BIAS = (1 << (EXPONENT_BITS - 1)) - 1; // 1023

export interface Ieee754Bits {
  sign: string;
  exponent: string;
  significand: string;
  originalInput?: string | number; // To store what was actually typed or resulted in these bits
  isSpecial?: boolean; // For NaN, Infinity
}

export function convertDecimalToBits(numberInput: number | string): Ieee754Bits {
  let number = typeof numberInput === 'string' ? parseFloat(numberInput) : numberInput;

  if (typeof numberInput === 'string' && numberInput.trim() === '') {
    return { sign: '', exponent: '', significand: '', originalInput: '' };
  }
  if (isNaN(number)) {
    // Represent NaN: sign can be 0 or 1, exponent all 1s, significand non-zero (first bit is 1 for quiet NaN)
    return { sign: '0', exponent: '1'.repeat(EXPONENT_BITS), significand: '1' + '0'.repeat(SIGNIFICAND_BITS - 1), originalInput: 'NaN', isSpecial: true };
  }
  if (number === 0) {
    const sign = Object.is(number, -0) ? '1' : '0';
    return { sign, exponent: '0'.repeat(EXPONENT_BITS), significand: '0'.repeat(SIGNIFICAND_BITS), originalInput: Object.is(number, -0) ? '-0' : '0' };
  }
  if (number === Infinity) {
    return { sign: '0', exponent: '1'.repeat(EXPONENT_BITS), significand: '0'.repeat(SIGNIFICAND_BITS), originalInput: 'Infinity', isSpecial: true };
  }
  if (number === -Infinity) {
    return { sign: '1', exponent: '1'.repeat(EXPONENT_BITS), significand: '0'.repeat(SIGNIFICAND_BITS), originalInput: '-Infinity', isSpecial: true };
  }

  const buffer = new ArrayBuffer(8); // 64 bits for double
  const floatView = new DataView(buffer);
  floatView.setFloat64(0, number, false); // false for big-endian (network byte order)

  let binaryString = '';
  for (let i = 0; i < 8; i++) {
    binaryString += floatView.getUint8(i).toString(2).padStart(8, '0');
  }

  return {
    sign: binaryString[0],
    exponent: binaryString.substring(1, 1 + EXPONENT_BITS),
    significand: binaryString.substring(1 + EXPONENT_BITS),
    originalInput: number.toString()
  };
}

export function convertBitsToDecimal(sign: string, exponent: string, significand: string): number | string {
  if (sign.length !== 1 || exponent.length !== EXPONENT_BITS || significand.length !== SIGNIFICAND_BITS ||
      !/^[01]+$/.test(sign + exponent + significand)) {
    //This case should ideally be prevented by input validation before calling
    return '無効なビット入力';
  }

  const binaryString = sign + exponent + significand;

  // Check for special values
  const isExponentAllOnes = exponent === '1'.repeat(EXPONENT_BITS);
  const isSignificandZero = significand === '0'.repeat(SIGNIFICAND_BITS);

  if (isExponentAllOnes) {
    if (isSignificandZero) {
      return sign === '1' ? -Infinity : Infinity;
    }
    return NaN; // Significand non-zero
  }

  // Denormalized numbers (exponent is all zeros, significand is non-zero)
  // Or signed zero (exponent is all zeros, significand is all zeros)
  // The DataView conversion handles these cases correctly.

  const buffer = new ArrayBuffer(8);
  const floatView = new DataView(buffer);

  for (let i = 0; i < 8; i++) {
    floatView.setUint8(i, parseInt(binaryString.substring(i * 8, (i + 1) * 8), 2));
  }

  const result = floatView.getFloat64(0, false);
  return result;
}
