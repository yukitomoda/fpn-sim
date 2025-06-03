// src/App.tsx
import type { Component } from 'solid-js';
import { createSignal, createEffect, createMemo, untrack } from 'solid-js';
import NumberInput from './components/NumberInput';
import BitRepresentationInput from './components/BitRepresentationInput';
import OutputDisplay from './components/OutputDisplay';
import { convertDecimalToBits, convertBitsToDecimal, EXPONENT_BITS, SIGNIFICAND_BITS } from './utils/ieee754';
import type { Ieee754Bits } from './utils/ieee754'; // Explicit type import
import './components/components.css';

const App: Component = () => {
  const [decimalStringInput, setDecimalStringInput] = createSignal<string>('3.14159');
  const [signBitString, setSignBitString] = createSignal<string>('');
  const [exponentBitString, setExponentBitString] = createSignal<string>('');
  const [significandBitString, setSignificandBitString] = createSignal<string>('');

  const [isLastChangeFromDecimal, setIsLastChangeFromDecimal] = createSignal<boolean>(true);

  // Effect to update bits when decimalStringInput changes
  createEffect(() => {
    const currentDecimalStr = decimalStringInput();
    // Untrack previous bit values to avoid self-triggering if we set them
    untrack(() => {
      const bits = convertDecimalToBits(currentDecimalStr);
      setSignBitString(bits.sign);
      setExponentBitString(bits.exponent);
      setSignificandBitString(bits.significand);
      if (isLastChangeFromDecimal()) {
        // If decimal was the source, update bit strings
      }
    });
  });

  const handleDecimalChange = (value: string) => {
    setIsLastChangeFromDecimal(true);
    setDecimalStringInput(value);
  };

  const handleBitChange = (newBits: Partial<Ieee754Bits>) => {
    setIsLastChangeFromDecimal(false);
    if (newBits.sign !== undefined) setSignBitString(newBits.sign);
    if (newBits.exponent !== undefined) setExponentBitString(newBits.exponent);
    if (newBits.significand !== undefined) setSignificandBitString(newBits.significand);
  };

  // Memo to calculate decimal from current bit strings
  const decimalFromBits = createMemo<number | string>(() => {
    const s = signBitString();
    const e = exponentBitString();
    const m = significandBitString();

    if (s.length === 1 && e.length === EXPONENT_BITS && m.length === SIGNIFICAND_BITS && /^[01]+$/.test(s+e+m) ) {
       const val = convertBitsToDecimal(s, e, m);
        // If the bits were the last thing changed, update the decimalStringInput to reflect this
        if (!isLastChangeFromDecimal() && !Object.is(val, parseFloat(decimalStringInput())) ) {
           // Check if val is NaN, Infinity, -Infinity to set string appropriately
           if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
             setDecimalStringInput(val.toString());
           } else if (isNaN(val)) {
             setDecimalStringInput('NaN');
           } else if (val === Infinity) {
             setDecimalStringInput('Infinity');
           } else if (val === -Infinity) {
             setDecimalStringInput('-Infinity');
           } else {
             // Fallback for other string results from convertBitsToDecimal
             setDecimalStringInput(String(val));
           }
        }
       return val;
    }
    // If bits are not complete/valid for conversion, reflect that.
    // This state implies user is still typing or bits are invalid.
    if (s === '' && e === '' && m === '') return ''; // Empty state
    return 'ビット入力が無効または不完全';
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
        onSignChange={(val) => handleBitChange({ sign: val })}
        onExponentChange={(val) => handleBitChange({ exponent: val })}
        onSignificandChange={(val) => handleBitChange({ significand: val })}
      />
      <OutputDisplay
        decimalFromBits={decimalFromBits}
        originalInput={displayedOriginalInput}
      />
    </div>
  );
};
export default App;
