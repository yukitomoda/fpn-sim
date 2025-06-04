// src/utils/ieee754.ts

import { Decimal } from 'decimal.js';

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

export interface ExactDecimal {
  value: string;
  isDenormalized: boolean;
  isSpecial: boolean;
  originalString?: string; // For NaN, Infinity, -0
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

export function convertBitsToDecimal(signStr: string, exponentStr: string, significandStr: string): ExactDecimal | string {
  if (signStr.length !== 1 || exponentStr.length !== EXPONENT_BITS || significandStr.length !== SIGNIFICAND_BITS ||
      !/^[01]+$/.test(signStr + exponentStr + significandStr)) {
    return '無効なビット入力'; // Invalid bit input
  }

  const sign = parseInt(signStr, 2);
  const exponentValue = parseInt(exponentStr, 2);

  const isExponentAllOnes = exponentStr === '1'.repeat(EXPONENT_BITS);
  const isSignificandZero = significandStr === '0'.repeat(SIGNIFICAND_BITS);

  if (isExponentAllOnes) {
    if (isSignificandZero) {
      const valStr = sign === 1 ? '-Infinity' : 'Infinity';
      return { value: valStr, isDenormalized: false, isSpecial: true, originalString: valStr };
    }
    return { value: 'NaN', isDenormalized: false, isSpecial: true, originalString: 'NaN' };
  }

  if (exponentValue === 0 && isSignificandZero) {
    const valStr = sign === 1 ? '-0' : '0';
    return { value: valStr, isDenormalized: false, isSpecial: false, originalString: valStr };
  }

  Decimal.set({ precision: 100 }); // Set precision for decimal.js

  let calculatedSignificandFraction = new Decimal(0);
  for (let i = 0; i < significandStr.length; i++) {
    if (significandStr[i] === '1') {
      calculatedSignificandFraction = calculatedSignificandFraction.plus(new Decimal(1).div(new Decimal(2).pow(i + 1)));
    }
  }

  let value: Decimal;
  const isDenormalized = exponentValue === 0 && !isSignificandZero;

  if (isDenormalized) {
    // For denormalized numbers, the value is: (-1)^sign * (0 + significand_fraction) * 2^(1 - bias).
    const effectiveExponent = 1 - EXPONENT_BIAS;
    value = calculatedSignificandFraction.times(new Decimal(2).pow(effectiveExponent));
  } else {
    // For normal numbers, the value is: (-1)^sign * (1 + significand_fraction) * 2^(exponent - bias).
    const effectiveExponent = exponentValue - EXPONENT_BIAS;
    value = new Decimal(1).plus(calculatedSignificandFraction).times(new Decimal(2).pow(effectiveExponent));
  }

  if (sign === 1) {
    // Check if value is already -0, which is handled by the (exponentValue === 0 && isSignificandZero) block.
    // Otherwise, negate.
    // This check for -0 is important because negating 0 would give -0, but we want to preserve the originalString for -0.
    if (!(value.isZero() && exponentValue === 0 && isSignificandZero)) {
        value = value.negated();
    }
  }

  return {
    value: value.toString(),
    isDenormalized: isDenormalized,
    isSpecial: false
    // originalString is not set here for normal/denormalized numbers as it's covered by 'value'
    // or explicitly handled for special cases like -0 above.
  };
}

export function mantissaFractionToBits(fraction: number, bits: number): string {
  if (fraction < 0 || fraction >= 1) {
    // console.warn(`Fraction ${fraction} is out of range [0, 1). Clamping.`);
    fraction = Math.max(0, Math.min(fraction, Math.nextDown(1))); // Clamp to [0, almost 1)
  }
  // Math.round can be problematic for perfect halves, but standard for IEEE 754 tie-breaking (round half to even)
  // is complex to implement here. Standard Math.round (half up) is used.
  let intValue = Math.round(fraction * Math.pow(2, bits));

  // Ensure intValue does not exceed the max possible value for 'bits' number of bits
  const maxValue = Math.pow(2, bits) - 1;
  if (intValue > maxValue) {
    intValue = maxValue;
  }

  let binaryString = intValue.toString(2);
  return binaryString.padStart(bits, '0');
}

export function bitsToMantissaFraction(bitString: string): number {
  if (!/^[01]+$/.test(bitString) || bitString.length === 0) {
    // console.warn(`Invalid bitString: ${bitString}. Returning 0.`);
    return 0;
  }
  const intValue = parseInt(bitString, 2);
  return intValue / Math.pow(2, bitString.length);
}
