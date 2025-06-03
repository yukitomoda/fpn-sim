// src/App.tsx
import type { Component } from 'solid-js';
import { createSignal, createEffect, createMemo, untrack } from 'solid-js';
import NumberInput from './components/NumberInput';
import BitRepresentationInput from './components/BitRepresentationInput';
import OutputDisplay from './components/OutputDisplay';
import { convertDecimalToBits, convertBitsToDecimal, EXPONENT_BITS, SIGNIFICAND_BITS, ExactDecimal } from './utils/ieee754'; // Added ExactDecimal
import type { Ieee754Bits } from './utils/ieee754'; // Explicit type import
import './components/components.css';

const App: Component = () => {
  const [decimalStringInput, setDecimalStringInput] = createSignal<string>('3.14159');
  const [signBitString, setSignBitString] = createSignal<string>('');
  const [exponentBitString, setExponentBitString] = createSignal<string>('');
  const [significandBitString, setSignificandBitString] = createSignal<string>('');

  const [isLastChangeFromDecimal, setIsLastChangeFromDecimal] = createSignal<boolean>(true);

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
    // Only update bits if the decimal input was the last thing changed by the user
    if (isLastChangeFromDecimal()) {
      untrack(() => { // Untrack to prevent loop if convertDecimalToBits somehow triggers a read
        const bits = convertDecimalToBits(currentDecimalStr);
        setSignBitString(bits.sign);
        setExponentBitString(bits.exponent);
        setSignificandBitString(bits.significand);
      });
    }
  });

  const handleDecimalChange = (value: string) => {
    setIsLastChangeFromDecimal(true); // Mark decimal as the source of truth
    setDecimalStringInput(value);
    // Bits will be updated by the createEffect above
  };

  const handleSignBitClick = () => {
    setIsLastChangeFromDecimal(false);
    setSignBitString(prev => (prev === '0' ? '1' : '0'));
  };

  const handleExponentBitClick = (index: number) => {
    setIsLastChangeFromDecimal(false);
    setExponentBitString(prev => toggleBitAtIndex(prev, index));
  };

  const handleSignificandBitClick = (index: number) => {
    setIsLastChangeFromDecimal(false);
    setSignificandBitString(prev => toggleBitAtIndex(prev, index));
  };

  // Memo to calculate decimal from current bit strings
  const decimalFromBits = createMemo<ExactDecimal | string>(() => { // Changed type here
    const s = signBitString();
    const e = exponentBitString();
    const m = significandBitString();

    if (s.length === 1 && e.length === EXPONENT_BITS && m.length === SIGNIFICAND_BITS && /^[01]+$/.test(s+e+m) ) {
       const result = convertBitsToDecimal(s, e, m); // result is ExactDecimal | string
        // If the bits were the last thing changed, update the decimalStringInput to reflect this
        if (!isLastChangeFromDecimal()) {
          if (typeof result === 'object' && result !== null) {
            // result is ExactDecimal
            const newDecimalString = result.originalString !== undefined ? result.originalString : result.value;
            if (newDecimalString !== untrack(decimalStringInput)) {
              setDecimalStringInput(newDecimalString);
            }
          }
          // If result is a string (error message), do not update decimalStringInput
        }
       return result;
    }
    // If bits are not complete/valid for conversion, reflect that.
    // This state implies user is still typing or bits are invalid.
    if (s === '' && e === '' && m === '') return ''; // Empty state, considered a string for the memo type
    return 'ビット入力が無効または不完全'; // This is a string, fitting ExactDecimal | string
  });

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


  return (
    <div class="app-container">
      <h1>IEEE 754 浮動小数点数シミュレータ (Solid.js Version)</h1>
      <NumberInput
        value={decimalStringInput}
        onInput={handleDecimalChange}
      />
      <BitRepresentationInput
        sign={signBitString}
        exponent={exponentBitString}
        significand={significandBitString}
        onSignBitClick={handleSignBitClick}
        onExponentBitClick={handleExponentBitClick}
        onSignificandBitClick={handleSignificandBitClick}
      />
      <OutputDisplay
        decimalFromBits={decimalFromBits}
        originalInput={displayedOriginalInput}
      />
    </div>
  );
};
export default App;
