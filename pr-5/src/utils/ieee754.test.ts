import { describe, it, expect } from 'vitest';
import { convertBitsToDecimal, EXPONENT_BITS, SIGNIFICAND_BITS } from './ieee754';

describe('convertBitsToDecimal', () => {
  // Helper to generate bit strings
  // const zeroPad = (num: number, len: number) => num.toString(2).padStart(len, '0');

  it('should correctly convert positive zero', () => {
    const result = convertBitsToDecimal('0', '0'.repeat(EXPONENT_BITS), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toEqual({ value: '0', isDenormalized: false, isSpecial: false, originalString: '0' });
  });

  it('should correctly convert negative zero', () => {
    const result = convertBitsToDecimal('1', '0'.repeat(EXPONENT_BITS), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toEqual({ value: '-0', isDenormalized: false, isSpecial: false, originalString: '-0' });
  });

  it('should correctly convert positive Infinity', () => {
    const result = convertBitsToDecimal('0', '1'.repeat(EXPONENT_BITS), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toEqual({ value: 'Infinity', isDenormalized: false, isSpecial: true, originalString: 'Infinity' });
  });

  it('should correctly convert negative Infinity', () => {
    const result = convertBitsToDecimal('1', '1'.repeat(EXPONENT_BITS), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toEqual({ value: '-Infinity', isDenormalized: false, isSpecial: true, originalString: '-Infinity' });
  });

  it('should correctly convert NaN', () => {
    const result = convertBitsToDecimal('0', '1'.repeat(EXPONENT_BITS), '1' + '0'.repeat(SIGNIFICAND_BITS - 1));
    expect(result).toEqual({ value: 'NaN', isDenormalized: false, isSpecial: true, originalString: 'NaN' });
  });

  it('should correctly convert a normalized number (0.1)', () => {
    // Bits for 0.1 double precision: sign=0, exp=01111111011, significand=1001100110011001100110011001100110011001100110011010
    // The actual significand from IEEE 754 for 0.1 is '1001100110011001100110011001100110011001100110011010' (52 bits)
    // The value for 0.1 is actually 0.1000000000000000055511151231257827021181583404541015625 with standard double precision.
    // The value provided in the prompt '0.100000001490116119384765625' seems to be for single precision or a slightly different representation.
    // Let's use the standard double precision representation for 0.1.
    const sign = '0';
    const exponent = '01111111011'; // Corresponds to -4 (1019 - 1023)
    const significand = '1001100110011001100110011001100110011001100110011010'; // Fractional part
    const result = convertBitsToDecimal(sign, exponent, significand);
    expect(result).toEqual({
      // The exact value of 0.1 in binary64 is 0.1000000000000000055511151231257827021181583404541015625
      // Our function with 100 digits of precision should give something very close to this,
      // but the prompt has a different expected value, let's stick to the prompt's expectation for now.
      value: '0.1000000000000000055511151231257827021181583404541015625', // Corrected value
      isDenormalized: false,
      isSpecial: false,
    });
  });

  it('should correctly convert a positive denormalized number (smallest positive double)', () => {
    // Smallest positive denormalized double: sign=0, exp=0...0, significand=0...01 (2^-52 for fraction part)
    const sign = '0';
    const exponent = '0'.repeat(EXPONENT_BITS);
    const significand = '0'.repeat(SIGNIFICAND_BITS - 1) + '1';
    const result = convertBitsToDecimal(sign, exponent, significand);
    // Value is 2^-52 * 2^(1-1023) = 2^-52 * 2^-1022 = 2^-1074
    // Decimal.js calculates this as 4.94065645841246544176568792868221372365089473130190075083769e-324
    // The prompt has a slightly different string representation (ending ...3651e-324)
    // Let's use the one from the prompt for consistency.
    expect(result).toEqual({
        value: '4.940656458412465441765687928682213723650598026143247644255856825006755072702087518652998363616359925e-324', // Corrected value
        isDenormalized: true,
        isSpecial: false,
    });
  });

  it('should correctly convert a negative denormalized number', () => {
    const sign = '1';
    const exponent = '0'.repeat(EXPONENT_BITS);
    const significand = '0'.repeat(SIGNIFICAND_BITS - 1) + '1';
    const result = convertBitsToDecimal(sign, exponent, significand);
    expect(result).toEqual({
        value: '-4.940656458412465441765687928682213723650598026143247644255856825006755072702087518652998363616359925e-324', // Corrected value
        isDenormalized: true,
        isSpecial: false,
    });
  });

  it('should return error string for invalid bit length (sign)', () => {
    const result = convertBitsToDecimal('00', '0'.repeat(EXPONENT_BITS), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toBe('無効なビット入力');
  });

  it('should return error string for invalid bit length (exponent)', () => {
    const result = convertBitsToDecimal('0', '0'.repeat(EXPONENT_BITS - 1), '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toBe('無効なビット入力');
  });

  it('should return error string for invalid characters in bits', () => {
    const result = convertBitsToDecimal('0', '0'.repeat(EXPONENT_BITS - 1) + 'X', '0'.repeat(SIGNIFICAND_BITS));
    expect(result).toBe('無効なビット入力');
  });
});
