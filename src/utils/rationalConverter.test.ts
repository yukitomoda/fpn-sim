import { BigRational } from 'big-rational-ts';
import { toBigRational } from './rationalConverter';

describe('toBigRational', () => {
  it('should convert an integer string to BigRational', () => {
    const rational = toBigRational('123');
    expect(rational.getNumerator()).toBe(123n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert a positive decimal string to BigRational and reduce it', () => {
    const rational = toBigRational('0.5');
    expect(rational.getNumerator()).toBe(1n);
    expect(rational.getDenominator()).toBe(2n); // 5/10 reduces to 1/2
  });

  it('should convert a positive float number to BigRational', () => {
    const rational = toBigRational(0.75);
    expect(rational.getNumerator()).toBe(3n);
    expect(rational.getDenominator()).toBe(4n); // 75/100 reduces to 3/4
  });

  it('should convert a string with leading/trailing spaces', () => {
    const rational = toBigRational(' 2.5 ');
    expect(rational.getNumerator()).toBe(5n);
    expect(rational.getDenominator()).toBe(2n); // 25/10 reduces to 5/2
  });

  it('should convert a negative integer string', () => {
    const rational = toBigRational('-45');
    expect(rational.getNumerator()).toBe(-45n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert a negative decimal string', () => {
    const rational = toBigRational('-0.25');
    expect(rational.getNumerator()).toBe(-1n);
    expect(rational.getDenominator()).toBe(4n); // -25/100 reduces to -1/4
  });

  it('should convert "0" correctly', () => {
    const rational = toBigRational('0');
    expect(rational.getNumerator()).toBe(0n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert "0.0" correctly', () => {
    const rational = toBigRational('0.0');
    expect(rational.getNumerator()).toBe(0n);
    expect(rational.getDenominator()).toBe(1n); // 0/1 or 0/10 reduces to 0/1
  });

  it('should convert a number like "3.14"', () => {
    const rational = toBigRational('3.14');
    expect(rational.getNumerator()).toBe(157n);
    expect(rational.getDenominator()).toBe(50n); // 314/100 reduces to 157/50
  });

  it('should convert a whole number string like "7"', () => {
    const rational = toBigRational('7');
    expect(rational.getNumerator()).toBe(7n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert a number input like 5 to 5/1', () => {
    const rational = toBigRational(5);
    expect(rational.getNumerator()).toBe(5n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should handle longer decimal parts', () => {
    const rational = toBigRational('0.12345');
    // 12345 / 100000. GCD(12345, 100000) = 5
    // N = 12345 / 5 = 2469
    // D = 100000 / 5 = 20000
    expect(rational.getNumerator()).toBe(2469n);
    expect(rational.getDenominator()).toBe(20000n);
  });

  // Tests for scientific notation
  it('should convert simple scientific notation like "1e3"', () => {
    const rational = toBigRational('1e3'); // 1000
    expect(rational.getNumerator()).toBe(1000n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert scientific notation "1.23e2"', () => {
    const rational = toBigRational('1.23e2'); // 123
    expect(rational.getNumerator()).toBe(123n);
    expect(rational.getDenominator()).toBe(1n);
  });

  it('should convert scientific notation "1.23e+2"', () => {
    const rational = toBigRational('1.23e+2'); // 123
    expect(rational.getNumerator()).toBe(123n);
    expect(rational.getDenominator()).toBe(1n);
  });


  it('should convert scientific notation with negative exponent "1.23e-2"', () => {
    const rational = toBigRational('1.23e-2'); // 0.0123 -> 123/10000
    expect(rational.getNumerator()).toBe(123n);
    expect(rational.getDenominator()).toBe(10000n);
  });

  it('should convert scientific notation "123e-3"', () => {
    const rational = toBigRational('123e-3'); // 0.123 -> 123/1000
    expect(rational.getNumerator()).toBe(123n);
    expect(rational.getDenominator()).toBe(1000n);
  });

  it('should convert "1e-1" (0.1)', () => {
    const rational = toBigRational('1e-1');
    expect(rational.getNumerator()).toBe(1n);
    expect(rational.getDenominator()).toBe(10n);
  });

  // Error handling tests
  it('should throw error for empty string', () => {
    expect(() => toBigRational('')).toThrow('Input value cannot be empty.');
  });

  it('should throw error for string with only spaces', () => {
    expect(() => toBigRational('   ')).toThrow('Input value cannot be empty.');
  });

  it('should throw error for invalid number format (multiple dots)', () => {
    expect(() => toBigRational('1.2.3')).toThrow('Invalid number format: "1.2.3"');
  });

  it('should throw error for invalid characters in decimal part', () => {
    expect(() => toBigRational('0.abc')).toThrow('Invalid characters in decimal part: "abc"');
  });

  it('should throw error for invalid characters in integer part', () => {
    expect(() => toBigRational('abc')).toThrow('Invalid characters in number: "abc"');
  });

  it('should throw error for invalid characters mixed with numbers', () => {
    expect(() => toBigRational('12a3')).toThrow('Invalid characters in number: "12a3"');
  });

  it('should throw error for invalid scientific notation (e.g., "1.2e") ', () => {
    // Number("1.2e") is NaN
    expect(() => toBigRational('1.2e')).toThrow('Invalid scientific notation input: "1.2e"');
  });

  it('should throw error for "Infinity" string input', () => {
    expect(() => toBigRational('Infinity')).toThrow('Invalid characters in number: "Infinity"');
  });

  it('should throw error for Number.POSITIVE_INFINITY input', () => {
    // This will be converted to "Infinity" string first, then fail.
    expect(() => toBigRational(Number.POSITIVE_INFINITY)).toThrow('Invalid characters in number: "Infinity"');
  });

  it('should throw error for Number.NaN input', () => {
     // This will be converted to "NaN" string first, then fail.
    expect(() => toBigRational(Number.NaN)).toThrow('Invalid characters in number: "NaN"');
  });

});
