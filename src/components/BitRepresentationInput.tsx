// src/components/BitRepresentationInput.tsx
import type { Component, Accessor, JSX } from 'solid-js';
import { EXPONENT_BITS, SIGNIFICAND_BITS } from '../utils/ieee754';

interface BitRepresentationInputProps {
  sign: Accessor<string>;
  exponent: Accessor<string>;
  significand: Accessor<string>;
  onSignBitClick: () => void;
  onExponentBitClick: (index: number) => void;
  onSignificandBitClick: (index: number) => void;
  exponentSlider?: () => JSX.Element;
  mantissaSlider?: () => JSX.Element;
}

const BitRepresentationInput: Component<BitRepresentationInputProps> = (props) => {
  return (
    <div class="bit-representation-section">
      <h2>ビット表現 (IEEE 754 64ビット)</h2>
      <div class="bit-display">
        <div class="bit-group sign-bit">
          <label>符号 (1ビット):</label>
          {/* No scroll container needed for a single bit */}
          <span class="clickable-bit sign-bit-span" onClick={() => props.onSignBitClick()}>
            {props.sign()}
          </span>
        </div>
        <div class="bit-group exponent-bits">
          {props.exponentSlider && props.exponentSlider()}
          <label>指数 ({EXPONENT_BITS}ビット):</label>
          <div class="bits-scroll-container">
            {props.exponent().split('').map((bit, index) => (
              <span class="clickable-bit exponent-bit-span" onClick={() => props.onExponentBitClick(index)}>
                {bit}
              </span>
            ))}
          </div>
        </div>
        <div class="bit-group significand-bits">
          {props.mantissaSlider && props.mantissaSlider()}
          <label>仮数 ({SIGNIFICAND_BITS}ビット):</label>
          <div class="bits-scroll-container">
            {props.significand().split('').map((bit, index) => (
              <span class="clickable-bit significand-bit-span" onClick={() => props.onSignificandBitClick(index)}>
                {bit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BitRepresentationInput;
