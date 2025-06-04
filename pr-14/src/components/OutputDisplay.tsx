// src/components/OutputDisplay.tsx
import type { Component, Accessor } from 'solid-js';
import type { ExactDecimal } from '../utils/ieee754'; // Import the interface

interface OutputDisplayProps {
  decimalFromBits: Accessor<ExactDecimal | string | null>; // Updated type
  originalInput: Accessor<string>;
}

const OutputDisplay: Component<OutputDisplayProps> = (props) => {
  return (
    <div class="output-section">
      <p>入力された数値 (解釈): <span id="outputDecimal">{props.originalInput()}</span></p>
      <p>正確な値: <span id="outputFromBits">{
        () => {
          const result = props.decimalFromBits();
          if (result === null || result === undefined) return ''; // Handle null/undefined case
          if (typeof result === 'string') return result; // Error message

          // result is ExactDecimal
          // Use originalString if available (for NaN, Infinity, -0), otherwise use the calculated value.
          let displayValue = result.originalString !== undefined ? result.originalString : result.value;

          if (result.isDenormalized) {
            displayValue += ' [非正規化数]';
          }
          // No need to explicitly handle result.isSpecial here for display purposes,
          // as originalString already covers NaN and Infinity.
          // And for normal numbers, their value is just displayed.
          return displayValue;
        }
      }</span></p>
    </div>
  );
};
export default OutputDisplay;
