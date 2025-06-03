import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSignal } from 'solid-js';
import OutputDisplay from './OutputDisplay';
import type { ExactDecimal } from '../utils/ieee754';

describe('OutputDisplay component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should display original input value', () => {
    const [originalInput, setOriginalInput] = createSignal('3.14159');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '3.14158999999999988261834005243144929409027099609375',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    expect(screen.getByText('入力された数値 (解釈):')).toBeTruthy();
    expect(screen.getByText('正確な値:')).toBeTruthy();
    
    const originalOutput = document.getElementById('outputDecimal');
    expect(originalOutput?.textContent).toBe('3.14159');
  });

  it('should display exact decimal value for normal numbers', () => {
    const [originalInput, setOriginalInput] = createSignal('1.5');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '1.5',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('1.5');
  });

  it('should display denormalized number with label', () => {
    const [originalInput, setOriginalInput] = createSignal('1e-324');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '4.9406564584124654e-324',
      isDenormalized: true,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('4.9406564584124654e-324 [非正規化数]');
  });

  it('should display special values using originalString', () => {
    const [originalInput, setOriginalInput] = createSignal('NaN');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: 'NaN',
      originalString: 'NaN',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('NaN');
  });

  it('should display Infinity correctly', () => {
    const [originalInput, setOriginalInput] = createSignal('Infinity');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: 'Infinity',
      originalString: 'Infinity',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('Infinity');
  });

  it('should display negative Infinity correctly', () => {
    const [originalInput, setOriginalInput] = createSignal('-Infinity');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '-Infinity',
      originalString: '-Infinity',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('-Infinity');
  });

  it('should handle negative zero special case', () => {
    const [originalInput, setOriginalInput] = createSignal('-0');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '-0',
      originalString: '-0',
      isDenormalized: false,
      isSpecial: true
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('-0');
  });

  it('should handle error string messages', () => {
    const [originalInput, setOriginalInput] = createSignal('invalid');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>('Error: Invalid input');

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('Error: Invalid input');
  });

  it('should handle null/undefined values', () => {
    const [originalInput, setOriginalInput] = createSignal('');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>(null);

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('');
  });

  it('should update when values change', () => {
    const [originalInput, setOriginalInput] = createSignal('1.0');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '1.0',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    let originalOutput = document.getElementById('outputDecimal');
    let exactOutput = document.getElementById('outputFromBits');
    expect(originalOutput?.textContent).toBe('1.0');
    expect(exactOutput?.textContent).toBe('1.0');

    setOriginalInput('2.5');
    setDecimalFromBits({
      value: '2.5',
      isDenormalized: false,
      isSpecial: false
    });

    originalOutput = document.getElementById('outputDecimal');
    exactOutput = document.getElementById('outputFromBits');
    expect(originalOutput?.textContent).toBe('2.5');
    expect(exactOutput?.textContent).toBe('2.5');
  });

  it('should prefer originalString over value when available', () => {
    const [originalInput, setOriginalInput] = createSignal('0');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '0',
      originalString: '0.0',
      isDenormalized: false,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('0.0');
  });

  it('should handle denormalized special case with originalString', () => {
    const [originalInput, setOriginalInput] = createSignal('1e-324');
    const [decimalFromBits, setDecimalFromBits] = createSignal<ExactDecimal | string | null>({
      value: '4.9406564584124654e-324',
      originalString: '5e-324',
      isDenormalized: true,
      isSpecial: false
    });

    render(() => <OutputDisplay decimalFromBits={decimalFromBits} originalInput={originalInput} />);

    const exactOutput = document.getElementById('outputFromBits');
    expect(exactOutput?.textContent).toBe('5e-324 [非正規化数]');
  });
});
