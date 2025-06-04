// src/App.tsx
import type { Component } from 'solid-js';
import { createSignal, createEffect, createMemo, untrack } from 'solid-js';
import NumberInput from './components/NumberInput';
import BitRepresentationInput from './components/BitRepresentationInput';
import OutputDisplay from './components/OutputDisplay';
import ExponentSlider from './components/ExponentSlider';
import MantissaSlider from './components/MantissaSlider';
import VisualValueAdjuster from './components/VisualValueAdjuster'; // Added
import {
  convertDecimalToBits,
  convertBitsToDecimal,
  bitsToMantissaFraction, // Added
  mantissaFractionToBits, // Added
  EXPONENT_BITS,
  SIGNIFICAND_BITS
} from './utils/ieee754';
import type { Ieee754Bits, ExactDecimal } from './utils/ieee754';
import './components/components.css';

const App: Component = () => {
  const [decimalStringInput, setDecimalStringInput] = createSignal<string>('3.14159');
  const [signBitString, setSignBitString] = createSignal<string>('0');
  const [exponentBitString, setExponentBitString] = createSignal<string>('');
  const [significandBitString, setSignificandBitString] = createSignal<string>('');
  const [storedExponentValue, setStoredExponentValue] = createSignal<number>(0);
  const [mantissaFractionValue, setMantissaFractionValue] =
    createSignal<number>(0);

  const [isLastChangeFromDecimal, setIsLastChangeFromDecimal] = createSignal<boolean>(true);
  // True if the last change was from the bit string input fields
  const [isLastChangeFromBits, setIsLastChangeFromBits] =
    createSignal<boolean>(false);
  // True if the last change was from the slider input fields
  const [isLastChangeFromSliders, setIsLastChangeFromSliders] =
    createSignal<boolean>(false);

  // Helper function to toggle a bit in a string
  const toggleBitAtIndex = (bitString: string, index: number): string => {
    const bitArray = bitString.split('');
    if (index >= 0 && index < bitArray.length) {
      bitArray[index] = bitArray[index] === '0' ? '1' : '0';
      return bitArray.join('');
    }
    // If index is out of bounds, return original string or handle error
    // For robustness, ensure the string is always of expected length by padding if necessary
    // However, current logic relies on initial conversion to set correct lengths.
    return bitString;
  };

  // Effect to update bits when decimalStringInput changes AND it was the last source of change
  createEffect(() => {
    const currentDecimalStr = decimalStringInput();
    // This effect should run if the change is from decimal OR on initialization (implicitly handled by SolidJS)
    if (isLastChangeFromDecimal() || untrack(() => !signBitString() && !exponentBitString() && !significandBitString())) {
      untrack(() => {
        const bits = convertDecimalToBits(currentDecimalStr);
        setSignBitString(bits.sign);
        setExponentBitString(bits.exponent);
        setSignificandBitString(bits.significand);

        if (bits.isSpecial) {
          setStoredExponentValue((1 << EXPONENT_BITS) - 1); // All 1s for exponent
          if (bits.originalInput === 'NaN') {
            // A common qNaN pattern is 100...0 for significand, which is 0.5
            // Other NaN patterns are possible, but this is a representative one.
            setMantissaFractionValue(0.5);
          } else { // Infinity or -Infinity
            setMantissaFractionValue(0);
          }
        } else {
          if (bits.exponent) {
            const expValue = parseInt(bits.exponent, 2);
            setStoredExponentValue(expValue);
          } else {
            setStoredExponentValue(0); // Default or error case
          }
          if (bits.significand) {
            setMantissaFractionValue(bitsToMantissaFraction(bits.significand));
          } else {
            setMantissaFractionValue(0); // Default or error case
          }
        }
      });
    }
  });

  const handleDecimalChange = (value: string) => {
    setIsLastChangeFromDecimal(true);
    setIsLastChangeFromBits(false);
    setIsLastChangeFromSliders(false);
    setDecimalStringInput(value);
  };

  const handleSignBitClick = () => {
    setIsLastChangeFromDecimal(false);
    setIsLastChangeFromBits(true);
    setIsLastChangeFromSliders(false);
    setSignBitString(prev => (prev === '0' ? '1' : '0'));
  };

  const handleExponentBitClick = (index: number) => {
    setIsLastChangeFromDecimal(false);
    setIsLastChangeFromBits(true);
    setIsLastChangeFromSliders(false);
    setExponentBitString(prev => toggleBitAtIndex(prev, index));
  };

  const handleSignificandBitClick = (index: number) => {
    setIsLastChangeFromDecimal(false);
    setIsLastChangeFromBits(true);
    setIsLastChangeFromSliders(false);
    setSignificandBitString(prev => toggleBitAtIndex(prev, index));
  };

  // Memo to calculate decimal from current bit strings
  // This also updates sliders if bits were the source of change
  const decimalFromBits = createMemo<ExactDecimal | string>(() => {
    const s = signBitString();
    const e = exponentBitString();
    const m = significandBitString();

    if (s.length === 1 && e.length === EXPONENT_BITS && m.length === SIGNIFICAND_BITS && /^[01]+$/.test(s+e+m) ) {
      const result = convertBitsToDecimal(s, e, m);

      // If the bits were the last thing changed by the user (not decimal input, not sliders)
      // then update the decimal string input and also the slider values.
      if (isLastChangeFromBits()) {
        untrack(() => { // Prevent this memo from re-triggering itself if setDecimalStringInput caused a loop
          if (typeof result === 'object' && result !== null) {
            const newDecimalString = result.originalString !== undefined ? result.originalString : result.value;
            if (newDecimalString !== decimalStringInput()) { // Check to prevent needless update
              setDecimalStringInput(newDecimalString);
            }
          }
          // Update sliders based on these bit changes
          const expValue = parseInt(e, 2);
          setStoredExponentValue(expValue);
          setMantissaFractionValue(bitsToMantissaFraction(m));

          // Handle special cases for sliders from bits
          if (expValue === ((1 << EXPONENT_BITS) - 1)) { // Exponent is all 1s (NaN/Infinity)
            if (parseInt(m, 2) === 0) { // Infinity
              setMantissaFractionValue(0);
            } else { // NaN
              setMantissaFractionValue(0.5); // Or some other representative NaN fraction
            }
          }
        });
      }
      return result;
    }
    // This state implies user is still typing or bits are invalid, or sliders are being used
    // and bits are not yet fully formed from slider input.
    if (s === '' && e === '' && m === '') return '';
    if (isLastChangeFromSliders()) return 'スライダー調整中...'; // Sliders are active
    return 'ビット入力が無効または不完全';
  });

  // Function to handle changes from sliders
  const handleSliderChange = () => {
    setIsLastChangeFromSliders(true);
    setIsLastChangeFromDecimal(false);
    setIsLastChangeFromBits(false);

    untrack(() => {
      const currentSign = signBitString(); // Keep existing sign
      const currentStoredExponent = storedExponentValue();
      const currentMantissaFraction = mantissaFractionValue();

      let newExponentBits = currentStoredExponent.toString(2).padStart(EXPONENT_BITS, '0');
      let newSignificandBits = mantissaFractionToBits(currentMantissaFraction, SIGNIFICAND_BITS);

      // Handle special slider values for NaN/Infinity based on exponent
      // If exponent slider is at max, it signifies a special value.
      if (currentStoredExponent === (1 << EXPONENT_BITS) - 1) {
        // Mantissa slider determines NaN or Infinity
        if (currentMantissaFraction === 0) { // Infinity
          newSignificandBits = '0'.repeat(SIGNIFICAND_BITS);
        } else { // NaN - canonical qNaN is 1 + 0... (fraction 0.5), but any non-zero is NaN
                   // For simplicity, if mantissa slider is > 0 and exponent is max, make it a qNaN.
                   // A common qNaN is first bit of mantissa set.
          newSignificandBits = '1' + '0'.repeat(SIGNIFICAND_BITS - 1);
          // We could also choose to set mantissaFractionValue to 0.5 here if we want slider to snap to that for NaN
        }
      }

      setExponentBitString(newExponentBits);
      setSignificandBitString(newSignificandBits);

      const result = convertBitsToDecimal(currentSign, newExponentBits, newSignificandBits);
      if (typeof result === 'object' && result !== null) {
        const newDecimalString = result.originalString !== undefined ? result.originalString : result.value;
        if (newDecimalString !== decimalStringInput()) {
          setDecimalStringInput(newDecimalString);
        }
      } else if (typeof result === 'string') {
        // Handle error string from convertBitsToDecimal if necessary,
        // though slider logic should ideally produce valid bits.
        // For now, if sliders produce invalid combo leading to error string, decimal field shows it.
        if (result !== decimalStringInput()) {
           setDecimalStringInput(result);
        }
      }
    });
  };

  // Memo for the original input display, which should reflect the decimal input field
  const displayedOriginalInput = createMemo(() => {
    const currentDecimalStr = decimalStringInput();
    if (currentDecimalStr.trim() === '') return '';
    const num = parseFloat(currentDecimalStr);
    if (isNaN(num) && currentDecimalStr !== 'NaN' && currentDecimalStr.toLowerCase() !== 'infinity' && currentDecimalStr !== '-infinity' ) {
        // Handles cases like abc but allows NaN, Infinity strings
        if (currentDecimalStr.trim() !== '' && currentDecimalStr !== '-' && !currentDecimalStr.endsWith('.')) {
            return '無効な数値入力';
        }
    }
    return currentDecimalStr; // Show the raw input for original
  });

  const handleExponentSliderChange = (newValue: number) => {
    setStoredExponentValue(newValue);
    handleSliderChange(); // General handler for slider updates
  };

  const handleMantissaSliderChange = (newValue: number) => {
    setMantissaFractionValue(newValue);
    handleSliderChange(); // General handler for slider updates
  };

  const handleVisualAdjusterChange = (newExponent: number, newMantissaFraction: number) => {
    setStoredExponentValue(newExponent);
    // Clamp newMantissaFraction to be strictly less than 1.0 for mantissaFractionToBits compatibility
    // (2^SIGNIFICAND_BITS - 1) / 2^SIGNIFICAND_BITS is the largest representable fraction
    const maxFraction = (Math.pow(2, SIGNIFICAND_BITS) - 1) / Math.pow(2, SIGNIFICAND_BITS);
    setMantissaFractionValue(Math.min(newMantissaFraction, maxFraction));
    handleSliderChange(); // Reuse slider logic to update bits and decimal input
                          // This also sets isLastChangeFromSliders = true, which is acceptable
  };

  return (
    <div class="app-container">
      <h1>IEEE 754 浮動小数点数シミュレータ</h1>
      <NumberInput
        value={decimalStringInput}
        onInput={handleDecimalChange}
      />
      {/* Interactive Controls Section */}
      <div class="interactive-controls-section">
        {/* Visual Adjuster might take up a certain portion of width */}
        <div style="flex-basis: 320px; /* Adjust as needed based on VisualValueAdjuster width */">
          <VisualValueAdjuster
            storedExponent={storedExponentValue}
            mantissaFraction={mantissaFractionValue}
            onPositionChange={handleVisualAdjusterChange}
          />
        </div>

        {/* Sliders and Bits Group, takes remaining width */}
        <div class="sliders-and-bits-group">
          <ExponentSlider
            value={storedExponentValue}
            onInput={handleExponentSliderChange}
          />
          <MantissaSlider
            value={mantissaFractionValue}
            onInput={handleMantissaSliderChange}
          />
          <BitRepresentationInput
            sign={signBitString}
            exponent={exponentBitString}
            significand={significandBitString}
            onSignBitClick={handleSignBitClick}
            onExponentBitClick={handleExponentBitClick}
            onSignificandBitClick={handleSignificandBitClick}
          />
        </div> {/* Closes sliders-and-bits-group */}
      </div> {/* Closes interactive-controls-section */}

      <OutputDisplay
        decimalFromBits={decimalFromBits}
        originalInput={displayedOriginalInput}
      />
    </div>
  );
};
export default App;
