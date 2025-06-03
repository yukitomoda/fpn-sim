// src/components/BitRepresentationInput.tsx
import type { Component, Accessor } from 'solid-js';
import { EXPONENT_BITS, SIGNIFICAND_BITS } from '../utils/ieee754';

interface BitRepresentationInputProps {
  sign: Accessor<string>;
  exponent: Accessor<string>;
  significand: Accessor<string>;
  onSignChange: (value: string) => void;
  onExponentChange: (value: string) => void;
  onSignificandChange: (value: string) => void;
}

const BitRepresentationInput: Component<BitRepresentationInputProps> = (props) => {
  const handleBitInput = (value: string, maxLength: number, handler: (val: string) => void) => {
    const filteredValue = value.replace(/[^01]/g, ''); // Allow only 0 or 1
    handler(filteredValue.slice(0, maxLength));
  };

  return (
    <div class="bit-representation-section">
      <h2>ビット表現 (IEEE 754 64ビット)</h2>
      <div class="bit-display">
        <div class="bit-group sign-bit">
          <label for="bit-sign">符号 (1ビット):</label>
          <input type="text" id="bit-sign"
            value={props.sign()}
            onInput={(e) => handleBitInput(e.currentTarget.value, 1, props.onSignChange)}
            placeholder="0"
          />
        </div>
        <div class="bit-group exponent-bits">
          <label for="bit-exponent">指数 ({EXPONENT_BITS}ビット):</label>
          <input type="text" id="bit-exponent"
            value={props.exponent()}
            onInput={(e) => handleBitInput(e.currentTarget.value, EXPONENT_BITS, props.onExponentChange)}
            placeholder={'0'.repeat(EXPONENT_BITS)}
          />
        </div>
        <div class="bit-group significand-bits">
          <label for="bit-significand">仮数 ({SIGNIFICAND_BITS}ビット):</label>
          <input type="text" id="bit-significand"
            value={props.significand()}
            onInput={(e) => handleBitInput(e.currentTarget.value, SIGNIFICAND_BITS, props.onSignificandChange)}
            placeholder={'0'.repeat(SIGNIFICAND_BITS)}
          />
        </div>
      </div>
    </div>
  );
};
export default BitRepresentationInput;
