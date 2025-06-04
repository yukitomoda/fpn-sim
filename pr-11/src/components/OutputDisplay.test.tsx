import { render, screen, cleanup } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createSignal, type Accessor } from 'solid-js'; // Import Accessor
import OutputDisplay from './OutputDisplay';
import type { ExactDecimal } from '../utils/ieee754';
import { BigRational } from 'big-rational-ts'; // Import BigRational itself for constructing test data
import { toBigRational } from '../utils/rationalConverter'; // For creating instances easily

describe('OutputDisplay component', () => {
  // Default mocks for new props
  let setExactRationalValue: (val: BigRational | null) => void;
  let exactRationalValueSignal: Accessor<BigRational | null>;

  let setFloatApproximationAsRational: (val: BigRational | null) => void;
  let floatApproximationAsRationalSignal: Accessor<BigRational | null>;

  let setRationalConversionError: (val: string | null) => void;
  let rationalConversionErrorSignal: Accessor<string | null>;

  // Mocks for existing props
  let setOriginalInput: (val: string) => void;
  let originalInputSignal: Accessor<string>;

  let setDecimalFromBits: (val: ExactDecimal | string | null) => void;
  let decimalFromBitsSignal: Accessor<ExactDecimal | string | null>;


  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize with default signal accessors
    const [erv, setErvSignal] = createSignal<BigRational | null>(null);
    exactRationalValueSignal = erv;
    setExactRationalValue = setErvSignal;

    const [far, setFarSignal] = createSignal<BigRational | null>(null);
    floatApproximationAsRationalSignal = far;
    setFloatApproximationAsRational = setFarSignal;

    const [rce, setRceSignal] = createSignal<string | null>(null);
    rationalConversionErrorSignal = rce;
    setRationalConversionError = setRceSignal;

    const [oi, setOiSignal] = createSignal('');
    originalInputSignal = oi;
    setOriginalInput = setOiSignal;

    const [dfb, setDfbSignal] = createSignal<ExactDecimal | string | null>(null);
    decimalFromBitsSignal = dfb;
    setDecimalFromBits = setDfbSignal;
  });

  afterEach(() => {
    cleanup(); // Clean up DOM after each test
  });

  // --- Existing tests (ensure they still pass, may need slight adjustments if props changed fundamentally) ---
  it('should display original input value', () => {
    setOriginalInput('3.14159');
    setDecimalFromBits({
        value: '3.14158999999999988261834005243144929409027099609375',
        isDenormalized: false,
        isSpecial: false
    });

    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);

    expect(screen.getByText('入力された数値 (そのまま):')).toBeTruthy();
    expect(screen.getByText('IEEE 754 近似値 (ビット表現から):')).toBeTruthy();
    const originalDisplay = document.getElementById('outputOriginalInput');
    expect(originalDisplay?.textContent).toBe('3.14159');
  });

  it('should display exact decimal value for normal numbers', () => {
    setOriginalInput('1.5');
    setDecimalFromBits({
      value: '1.5',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('1.5');
  });

  it('should display denormalized number with label', () => {
    setOriginalInput('1e-324');
    setDecimalFromBits({
      value: '4.9406564584124654e-324',
      isDenormalized: true,
      isSpecial: false
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('4.9406564584124654e-324 [非正規化数]');
  });

  it('should display special values using originalString', () => {
    setOriginalInput('NaN');
    setDecimalFromBits({
      value: 'NaN',
      originalString: 'NaN',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('NaN');
  });

  it('should display Infinity correctly', () => {
    setOriginalInput('Infinity');
    setDecimalFromBits({
      value: 'Infinity',
      originalString: 'Infinity',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('Infinity');
  });

  it('should display negative Infinity correctly', () => {
    setOriginalInput('-Infinity');
    setDecimalFromBits({
      value: '-Infinity',
      originalString: '-Infinity',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('-Infinity');
  });

  it('should handle negative zero special case', () => {
    setOriginalInput('-0');
    setDecimalFromBits({
      value: '-0',
      originalString: '-0',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('-0');
  });

  it('should handle error string messages', () => {
    setOriginalInput('invalid');
    setDecimalFromBits('Error: Invalid input');

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('Error: Invalid input');
  });

  it('should handle null/undefined values', () => {
    setOriginalInput('');
    setDecimalFromBits(null);

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    // When decimalFromBits is null, the component renders 'N/A' for the IEEE 754 value.
    expect(exactOutput?.textContent).toBe('N/A');
  });

  it('should update when values change', () => {
    setOriginalInput('1.0');
    setDecimalFromBits({
      value: '1.0',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    let originalDisplay = document.getElementById('outputOriginalInput');
    let exactOutput = document.getElementById('outputFromBits');
    expect(originalDisplay?.textContent).toBe('1.0');
    expect(exactOutput?.textContent).toBe('1.0');

    setOriginalInput('2.5');
    setDecimalFromBits({
      value: '2.5',
      isDenormalized: false,
      isSpecial: false
    });

    originalDisplay = document.getElementById('outputOriginalInput');
    exactOutput = document.getElementById('outputFromBits');
    expect(originalDisplay?.textContent).toBe('2.5');
    expect(exactOutput?.textContent).toBe('2.5');
  });

  it('should prefer originalString over value when available', () => {
    setOriginalInput('0');
    setDecimalFromBits({
      value: '0',
      originalString: '0.0',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('0.0');
  });

  it('should handle denormalized special case with originalString', () => {
    setOriginalInput('1e-324');
    setDecimalFromBits({
      value: '4.9406564584124654e-324',
      originalString: '5e-324',
      isDenormalized: true,
      isSpecial: false
    });

    render(() => <OutputDisplay
      decimalFromBits={decimalFromBitsSignal}
      originalInput={originalInputSignal}
      exactRationalValue={exactRationalValueSignal}
      floatApproximationAsRational={floatApproximationAsRationalSignal}
      rationalConversionError={rationalConversionErrorSignal}
    />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('5e-324 [非正規化数]');
  });

  // --- New tests for rational number display and calculations ---

  it('should display rational conversion error when present', () => {
    setRationalConversionError('Test error message');
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(screen.getByText('入力エラー: Test error message')).toBeTruthy();
  });

  it('should not display error message when error is null', () => {
    setRationalConversionError(null);
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(screen.queryByText(/入力エラー:/)).toBeNull();
  });

  it('should display exact and approximate rational values', () => {
    setExactRationalValue(new BigRational(1n, 2n)); // Changed from toBigRational('1/2')
    setFloatApproximationAsRational(new BigRational(1n, 3n)); // Changed from toBigRational('1/3')
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(document.getElementById('outputExactRational')?.textContent).toBe('1 / 2');
    expect(document.getElementById('outputApproxRational')?.textContent).toBe('1 / 3');
  });

  it('should display N/A for rational values if null', () => {
    setExactRationalValue(null);
    setFloatApproximationAsRational(null);
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(document.getElementById('outputExactRational')?.textContent).toBe('N/A');
    expect(document.getElementById('outputApproxRational')?.textContent).toBe('N/A');
    expect(document.getElementById('outputDifference')?.textContent).toBe('N/A');
    expect(document.getElementById('outputRatio')?.textContent).toBe('N/A');
  });

  it('should calculate and display difference correctly', () => {
    setExactRationalValue(new BigRational(3n, 4n)); // Changed
    setFloatApproximationAsRational(new BigRational(1n, 2n)); // Changed
    // Difference = 3/4 - 1/2 = 3/4 - 2/4 = 1/4. Subtract does not auto-reduce.
    // (3*2 - 1*4) / (4*2) = (6-4)/8 = 2/8
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(document.getElementById('outputDifference')?.textContent).toBe('1 / 4'); // Now reduced
  });

  it('should calculate and display ratio correctly', () => {
    setExactRationalValue(new BigRational(3n, 4n));  // Changed
    setFloatApproximationAsRational(new BigRational(1n, 2n)); // Changed
    // Difference = (3/4) - (1/2) = 2/8.reduce() = 1/4
    // Ratio = (1/4) / (1/2) = (1*2) / (4*1) = 2/4.reduce() = 1/2
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(document.getElementById('outputRatio')?.textContent).toBe('1 / 2'); // Now reduced
  });

  it('should display N/A for ratio when difference cannot be calculated', () => {
    setExactRationalValue(null); // Difference will be null
    setFloatApproximationAsRational(new BigRational(1n, 2n)); // Changed
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    expect(document.getElementById('outputRatio')?.textContent).toBe('N/A');
  });

  it('should display "N/A (division by zero)" for ratio when approximate rational is zero', () => {
    setExactRationalValue(new BigRational(1n, 2n)); // Changed
    setFloatApproximationAsRational(new BigRational(0n, 1n)); // Zero Changed
    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);
    // Difference is (1/2) - (0/1) = (1*1 - 0*2)/(2*1) = 1/2
    expect(document.getElementById('outputDifference')?.textContent).toBe('1 / 2'); // Unchanged, direct result
    expect(document.getElementById('outputRatio')?.textContent).toBe('N/A (division by zero)');
  });

  it('should handle a more complex case for difference and ratio', () => {
    // User input: 0.1 (1/10)
    setExactRationalValue(toBigRational('0.1')); // This is 1/10 (reduced)
    // Let's say float is 0.100000001 = 100000001 / 1000000000 (this is already reduced if no common factors)
    const floatApprox = new BigRational(100000001n, 1000000000n);
    setFloatApproximationAsRational(floatApprox);

    // exact = 1/10
    // approx = 100000001 / 1000000000
    // diff = exact.subtract(approx).reduce()
    //      = (-10 / 10000000000).reduce() = -1 / 1000000000
    const expectedDifferenceReduced = new BigRational(-1n, 1000000000n);

    // ratio = diff.div(approx).reduce()
    //       = (-1 / 1000000000).div(100000001 / 1000000000).reduce()
    //       = ((-1 * 1000000000) / (1000000000 * 100000001)).reduce()
    //       = (-1000000000 / 100000001000000000).reduce()
    //       = -1 / 100000001
    const expectedRatioReduced = new BigRational(-1n, 100000001n);

    render(() => <OutputDisplay
        decimalFromBits={decimalFromBitsSignal}
        originalInput={originalInputSignal}
        exactRationalValue={exactRationalValueSignal}
        floatApproximationAsRational={floatApproximationAsRationalSignal}
        rationalConversionError={rationalConversionErrorSignal}
    />);

    expect(document.getElementById('outputExactRational')?.textContent).toBe('1 / 10');
    expect(document.getElementById('outputApproxRational')?.textContent).toBe('100000001 / 1000000000'); // This one is not reduced by default by new BigRational if already in lowest terms
    expect(document.getElementById('outputDifference')?.textContent).toBe(expectedDifferenceReduced.toString());

    expect(document.getElementById('outputRatio')?.textContent).toBe(expectedRatioReduced.toString());
  });
});
