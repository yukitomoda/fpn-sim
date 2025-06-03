// src/components/OutputDisplay.tsx
import type { Component, Accessor } from 'solid-js';

interface OutputDisplayProps {
  decimalFromBits: Accessor<number | string>;
  originalInput: Accessor<string>;
}

const OutputDisplay: Component<OutputDisplayProps> = (props) => {
  return (
    <div class="output-section">
      <p>入力された数値 (解釈): <span id="outputDecimal">{props.originalInput()}</span></p>
      <p>ビット表現からの数値: <span id="outputFromBits">{
        () => {
          const val = props.decimalFromBits();
          if (typeof val === 'number' && Object.is(val, -0)) return '-0';
          return String(val);
        }
      }</span></p>
    </div>
  );
};
export default OutputDisplay;
