// src/components/ExponentSlider.tsx
import type { Component, Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import { EXPONENT_BIAS, EXPONENT_BITS } from '../utils/ieee754'; // Assuming EXPONENT_BIAS is exported

interface ExponentSliderProps {
  value: Accessor<number>; // Stored exponent value (0-2047)
  onInput: (value: number) => void;
  // isDisabled?: Accessor<boolean>; // Keep for future, but don't implement disabling yet
}

const ExponentSlider: Component<ExponentSliderProps> = (props) => {
  const MAX_STORED_EXPONENT = (1 << EXPONENT_BITS) - 1; // 2047

  const effectiveExponent = createMemo(() => {
    const stored = props.value();
    if (stored === 0) return `1 - ${EXPONENT_BIAS} (denormalized/zero)`; // or specific value like 1 - 1023 = -1022
    if (stored === MAX_STORED_EXPONENT) return 'Special (Infinity/NaN)';
    return `${stored} - ${EXPONENT_BIAS} = ${stored - EXPONENT_BIAS}`;
  });

  return (
    <div class="slider-section">
      <label for="exponentSlider">Exponent (Stored: {props.value()}):</label>
      <input
        type="range"
        id="exponentSlider"
        min="0"
        max={MAX_STORED_EXPONENT}
        value={props.value()}
        onInput={(e) => props.onInput(parseInt(e.currentTarget.value))}
        // disabled={props.isDisabled && props.isDisabled()}
      />
      <div>Effective Exponent: {effectiveExponent()}</div>
    </div>
  );
};

export default ExponentSlider;
