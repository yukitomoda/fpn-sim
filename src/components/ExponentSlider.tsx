// src/components/ExponentSlider.tsx
import type { Component, Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import { styled } from 'solid-styled-components';
import { EXPONENT_BIAS, EXPONENT_BITS } from '../utils/ieee754'; // Assuming EXPONENT_BIAS is exported

interface ExponentSliderProps {
  value: Accessor<number>; // Stored exponent value (0-2047)
  onInput: (value: number) => void;
  // isDisabled?: Accessor<boolean>; // Keep for future, but don't implement disabling yet
}

const StyledSliderContainer = styled.div`
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;

  label {
    display: block;
    margin-bottom: 5px; /* Specific to slider section */
    font-weight: 600; /* From general label style */
    color: #555; /* From general label style */
  }

  input[type="range"] {
    width: 100%;
  }

  /* Styling for the div displaying effective exponent, if needed */
  div {
    margin-top: 5px; /* Example: add some space above this text */
    font-size: 0.9em;
    color: #333;
  }
`;

const ExponentSlider: Component<ExponentSliderProps> = (props) => {
  const MAX_STORED_EXPONENT = (1 << EXPONENT_BITS) - 1; // 2047

  const effectiveExponent = createMemo(() => {
    const stored = props.value();
    if (stored === 0) return `${1 - EXPONENT_BIAS} (非正規化数/ゼロ)`;
    if (stored === MAX_STORED_EXPONENT) return '特殊値 (無限大/NaN)';
    return `${stored} - ${EXPONENT_BIAS} = ${stored - EXPONENT_BIAS}`; // Calculation can remain
  });

  return (
    <StyledSliderContainer>
      <label for="exponentSlider">指数 (内部値: {props.value()}):</label>
      <input
        type="range"
        id="exponentSlider"
        min="0"
        max={MAX_STORED_EXPONENT}
        value={props.value()}
        onInput={(e) => props.onInput(parseInt(e.currentTarget.value))}
        // disabled={props.isDisabled && props.isDisabled()}
      />
      <div>実効指数: {effectiveExponent()}</div>
    </StyledSliderContainer>
  );
};

export default ExponentSlider;
