import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal } from 'solid-js';
import BitRepresentationInput from './BitRepresentationInput';

describe('BitRepresentationInput component', () => {
  const mockProps = {
    sign: () => '0',
    exponent: () => '01111111111',
    significand: () => '1001001000011111101101010100010001000010110100011000',
    onSignBitClick: vi.fn(),
    onExponentBitClick: vi.fn(),
    onSignificandBitClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all bit sections with correct labels', () => {
    render(() => <BitRepresentationInput {...mockProps} />);

    expect(screen.getByText('ビット表現 (IEEE 754 64ビット)')).toBeTruthy();
    expect(screen.getByText('符号 (1ビット):')).toBeTruthy();
    expect(screen.getByText('指数 (11ビット):')).toBeTruthy();
    expect(screen.getByText('仮数 (52ビット):')).toBeTruthy();
  });

  it('should display sign bit correctly', () => {
    const [sign, setSign] = createSignal('1');
    const props = { ...mockProps, sign };

    render(() => <BitRepresentationInput {...props} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit?.textContent).toBe('1');
  });

  it('should call onSignBitClick when sign bit is clicked', () => {
    render(() => <BitRepresentationInput {...mockProps} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit).toBeTruthy();
    
    fireEvent.click(signBit!);
    expect(mockProps.onSignBitClick).toHaveBeenCalledTimes(1);
  });

  it('should display exponent bits correctly', () => {
    const [exponent, setExponent] = createSignal('10000000000');
    const props = { ...mockProps, exponent };

    render(() => <BitRepresentationInput {...props} />);

    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    expect(exponentBits).toHaveLength(11);
    expect(exponentBits[0].textContent).toBe('1');
    expect(exponentBits[1].textContent).toBe('0');
  });

  it('should call onExponentBitClick with correct index', () => {
    render(() => <BitRepresentationInput {...mockProps} />);

    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    
    fireEvent.click(exponentBits[0]);
    expect(mockProps.onExponentBitClick).toHaveBeenCalledWith(0);
    
    fireEvent.click(exponentBits[5]);
    expect(mockProps.onExponentBitClick).toHaveBeenCalledWith(5);
  });

  it('should display significand bits correctly', () => {
    const testSignificand = '1010101010101010101010101010101010101010101010101010';
    const [significand, setSignificand] = createSignal(testSignificand);
    const props = { ...mockProps, significand };

    render(() => <BitRepresentationInput {...props} />);

    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');
    expect(significandBits).toHaveLength(52);
    expect(significandBits[0].textContent).toBe('1');
    expect(significandBits[1].textContent).toBe('0');
    expect(significandBits[2].textContent).toBe('1');
  });

  it('should call onSignificandBitClick with correct index', () => {
    render(() => <BitRepresentationInput {...mockProps} />);

    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');
    
    fireEvent.click(significandBits[0]);
    expect(mockProps.onSignificandBitClick).toHaveBeenCalledWith(0);
    
    fireEvent.click(significandBits[25]);
    expect(mockProps.onSignificandBitClick).toHaveBeenCalledWith(25);
    
    fireEvent.click(significandBits[51]);
    expect(mockProps.onSignificandBitClick).toHaveBeenCalledWith(51);
  });

  it('should update when bit values change', () => {
    const [sign, setSign] = createSignal('0');
    const [exponent, setExponent] = createSignal('01111111111');
    const props = { ...mockProps, sign, exponent };

    render(() => <BitRepresentationInput {...props} />);

    let signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit?.textContent).toBe('0');

    setSign('1');
    signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit?.textContent).toBe('1');

    setExponent('10000000000');
    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    expect(exponentBits[0].textContent).toBe('1');
  });

  it('should handle edge case with all zeros', () => {
    const zeroProps = {
      ...mockProps,
      sign: () => '0',
      exponent: () => '00000000000',
      significand: () => '0000000000000000000000000000000000000000000000000000',
    };

    render(() => <BitRepresentationInput {...zeroProps} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');

    expect(signBit?.textContent).toBe('0');
    expect(Array.from(exponentBits).every(bit => bit.textContent === '0')).toBe(true);
    expect(Array.from(significandBits).every(bit => bit.textContent === '0')).toBe(true);
  });

  it('should handle edge case with all ones', () => {
    const onesProps = {
      ...mockProps,
      sign: () => '1',
      exponent: () => '11111111111',
      significand: () => '1111111111111111111111111111111111111111111111111111',
    };

    render(() => <BitRepresentationInput {...onesProps} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');

    expect(signBit?.textContent).toBe('1');
    expect(Array.from(exponentBits).every(bit => bit.textContent === '1')).toBe(true);
    expect(Array.from(significandBits).every(bit => bit.textContent === '1')).toBe(true);
  });
});
