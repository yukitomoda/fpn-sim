// src/components/OutputDisplay.tsx
import type { Component, Accessor } from 'solid-js';
import { styled } from 'solid-styled-components';
import type { ExactDecimal } from '../utils/ieee754'; // Import the interface

interface OutputDisplayProps {
  decimalFromBits: Accessor<ExactDecimal | string | null>; // Updated type
  originalInput: Accessor<string>;
}

const StyledOutputDisplayContainer = styled.div`
  /* Base section styles */
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #b3d7ff; /* Specific border-color for output */
  border-radius: 8px;
  background-color: #e9f5ff; /* Specific background-color for output */

  p {
    font-size: 1.1em;
    margin: 10px 0;
    color: #222;
  }

  span {
    font-weight: bold;
    color: #0056b3;
    word-break: break-all;
  }
`;

const OutputDisplay: Component<OutputDisplayProps> = (props) => {
  return (
    <StyledOutputDisplayContainer>
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
    </StyledOutputDisplayContainer>
  );
};
export default OutputDisplay;
