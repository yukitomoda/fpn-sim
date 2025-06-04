// src/components/NumberInput.tsx
import type { Component, Accessor } from 'solid-js';

interface NumberInputProps {
  value: Accessor<string>;
  onInput: (value: string) => void;
}

const NumberInput: Component<NumberInputProps> = (props) => {
  return (
    <div class="input-section">
      <label for="decimalValue">数値:</label>
      <input
        type="text" // Use text to allow 'NaN', 'Infinity'
        id="decimalValue"
        placeholder="例: 3.14159, NaN, Infinity"
        value={props.value()}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
    </div>
  );
};
export default NumberInput;
