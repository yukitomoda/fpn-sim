import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal, JSX } from 'solid-js'; // Added JSX
import BitRepresentationInput from './BitRepresentationInput';
import ExponentSlider from './ExponentSlider'; // Import ExponentSlider
import MantissaSlider from './MantissaSlider'; // Import MantissaSlider

describe('BitRepresentationInput component', () => {
  const mockBasicProps = { // Renamed for clarity
    sign: () => '0',
    exponent: () => '01111111111',
    significand: () => '1001001000011111101101010100010001000010110100011000',
    onSignBitClick: vi.fn(),
    onExponentBitClick: vi.fn(),
    onSignificandBitClick: vi.fn(),
    // Sliders are optional, so not included in basic props by default
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockProps to a clean state for each test if they are modified within tests
    // This might involve redefining parts of mockBasicProps if necessary, e.g. mock functions
    mockBasicProps.onSignBitClick = vi.fn();
    mockBasicProps.onExponentBitClick = vi.fn();
    mockBasicProps.onSignificandBitClick = vi.fn();
  });

  it('should render all bit sections with correct labels without sliders', () => {
    render(() => <BitRepresentationInput {...mockBasicProps} />);

    expect(screen.getByText('ビット表現 (IEEE 754 64ビット)')).toBeTruthy();
    expect(screen.getByText('符号 (1ビット):')).toBeTruthy();
    expect(screen.getByText('指数 (11ビット):')).toBeTruthy();
    expect(screen.getByText('仮数 (52ビット):')).toBeTruthy();

    // Ensure slider-specific texts are not present
    expect(screen.queryByText(/指数 \(内部値:/)).toBeNull();
    expect(screen.queryByText(/仮数 \(小数部:/)).toBeNull();
  });

  it('should display sign bit correctly', () => {
    const [sign, setSign] = createSignal('1');
    const props = { ...mockBasicProps, sign };

    render(() => <BitRepresentationInput {...props} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit?.textContent).toBe('1');
  });

  it('should call onSignBitClick when sign bit is clicked', () => {
    render(() => <BitRepresentationInput {...mockBasicProps} />);

    const signBit = document.querySelector('.clickable-bit.sign-bit-span');
    expect(signBit).toBeTruthy();
    
    fireEvent.click(signBit!);
    expect(mockBasicProps.onSignBitClick).toHaveBeenCalledTimes(1);
  });

  it('should display exponent bits correctly', () => {
    const [exponent, setExponent] = createSignal('10000000000');
    const props = { ...mockBasicProps, exponent };

    render(() => <BitRepresentationInput {...props} />);

    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    expect(exponentBits).toHaveLength(11);
    expect(exponentBits[0].textContent).toBe('1');
    expect(exponentBits[1].textContent).toBe('0');
  });

  it('should call onExponentBitClick with correct index', () => {
    render(() => <BitRepresentationInput {...mockBasicProps} />);

    const exponentBits = document.querySelectorAll('.clickable-bit.exponent-bit-span');
    
    fireEvent.click(exponentBits[0]);
    expect(mockBasicProps.onExponentBitClick).toHaveBeenCalledWith(0);
    
    fireEvent.click(exponentBits[5]);
    expect(mockBasicProps.onExponentBitClick).toHaveBeenCalledWith(5);
  });

  it('should display significand bits correctly', () => {
    const testSignificand = '1010101010101010101010101010101010101010101010101010';
    const [significand, setSignificand] = createSignal(testSignificand);
    const props = { ...mockBasicProps, significand };

    render(() => <BitRepresentationInput {...props} />);

    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');
    expect(significandBits).toHaveLength(52);
    expect(significandBits[0].textContent).toBe('1');
    expect(significandBits[1].textContent).toBe('0');
    expect(significandBits[2].textContent).toBe('1');
  });

  it('should call onSignificandBitClick with correct index', () => {
    render(() => <BitRepresentationInput {...mockBasicProps} />);

    const significandBits = document.querySelectorAll('.clickable-bit.significand-bit-span');
    
    fireEvent.click(significandBits[0]);
    expect(mockBasicProps.onSignificandBitClick).toHaveBeenCalledWith(0);
    
    fireEvent.click(significandBits[25]);
    expect(mockBasicProps.onSignificandBitClick).toHaveBeenCalledWith(25);
    
    fireEvent.click(significandBits[51]);
    expect(mockBasicProps.onSignificandBitClick).toHaveBeenCalledWith(51);
  });

  it('should update when bit values change', () => {
    const [sign, setSign] = createSignal('0');
    const [exponent, setExponent] = createSignal('01111111111');
    const props = { ...mockBasicProps, sign, exponent };

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
      ...mockBasicProps,
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
      ...mockBasicProps,
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

  // New tests for sliders
  describe('Slider integration', () => {
    const [exponentValue, setExponentValue] = createSignal(1023);
    const [mantissaValue, setMantissaValue] = createSignal(0.5);
    const mockExponentSlider = () => <ExponentSlider value={exponentValue} onInput={vi.fn()} />;
    const mockMantissaSlider = () => <MantissaSlider value={mantissaValue} onInput={vi.fn()} />;

    it('should render ExponentSlider when exponentSlider prop is provided', () => {
      const propsWithExponentSlider = {
        ...mockBasicProps,
        exponentSlider: mockExponentSlider,
      };
      render(() => <BitRepresentationInput {...propsWithExponentSlider} />);
      expect(screen.getByText(/指数 \(内部値:/)).toBeTruthy();
      expect(screen.getByText(exponentValue().toString())).toBeTruthy(); // Check for value rendering
    });

    it('should render MantissaSlider when mantissaSlider prop is provided', () => {
      const propsWithMantissaSlider = {
        ...mockBasicProps,
        mantissaSlider: mockMantissaSlider,
      };
      render(() => <BitRepresentationInput {...propsWithMantissaSlider} />);
      expect(screen.getByText(/仮数 \(小数部:/)).toBeTruthy();
      // Mantissa value is formatted, so check for part of it or use a more robust query
      expect(screen.getByText(mantissaValue().toFixed(5))).toBeTruthy();
    });

    it('should render both sliders when both props are provided', () => {
      const propsWithBothSliders = {
        ...mockBasicProps,
        exponentSlider: mockExponentSlider,
        mantissaSlider: mockMantissaSlider,
      };
      render(() => <BitRepresentationInput {...propsWithBothSliders} />);
      expect(screen.getByText(/指数 \(内部値:/)).toBeTruthy();
      expect(screen.getByText(exponentValue().toString())).toBeTruthy();
      expect(screen.getByText(/仮数 \(小数部:/)).toBeTruthy();
      expect(screen.getByText(mantissaValue().toFixed(5))).toBeTruthy();
    });

    it('should not render sliders if props are not provided (already covered by first test, but explicit)', () => {
      render(() => <BitRepresentationInput {...mockBasicProps} />);
      expect(screen.queryByText(/指数 \(内部値:/)).toBeNull();
      expect(screen.queryByText(/仮数 \(小数部:/)).toBeNull();
    });
  });
});
