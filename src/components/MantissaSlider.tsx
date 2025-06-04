// src/components/MantissaSlider.tsx
import type { Component, Accessor } from 'solid-js';

interface MantissaSliderProps {
  value: Accessor<number>; // Mantissa fraction value (0.0 to <1.0)
  onInput: (value: number) => void;
  // isDisabled?: Accessor<boolean>; // Keep for future
}

// Define a practical maximum for the slider input to represent fraction < 1.0
const SLIDER_MAX_INT_VALUE = (1 << 16) -1; // e.g., 65535, for a 16-bit precision feel

const MantissaSlider: Component<MantissaSliderProps> = (props) => {
  // Convert fraction (0 to <1) to an integer for the slider
  const sliderIntValue = () => Math.round(props.value() * SLIDER_MAX_INT_VALUE);

  // Convert slider integer back to fraction for onInput
  const handleSliderInput = (intValue: number) => {
    props.onInput(intValue / SLIDER_MAX_INT_VALUE);
  };

  return (
    <div class="slider-section">
      <label for="mantissaSlider">小数部: {props.value().toFixed(5)}</label>
      <input
        type="range"
        id="mantissaSlider"
        min="0"
        max={SLIDER_MAX_INT_VALUE}
        value={sliderIntValue()}
        onInput={(e) => handleSliderInput(parseInt(e.currentTarget.value))}
        // disabled={props.isDisabled && props.isDisabled()}
      />
    </div>
  );
};

export default MantissaSlider;
