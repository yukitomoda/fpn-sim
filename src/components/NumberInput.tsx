// src/components/NumberInput.tsx
import type { Component, Accessor } from 'solid-js';
import { styled } from 'solid-styled-components';

interface NumberInputProps {
  value: Accessor<string>;
  onInput: (value: string) => void;
}

const StyledNumberInputContainer = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #555;
  }

  input[type='text'] {
    width: 100%;
    padding: 12px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  input[type='text']:focus {
    border-color: #1a73e8;
    outline: none;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.25);
  }
`;

const NumberInput: Component<NumberInputProps> = (props) => {
  return (
    <StyledNumberInputContainer>
      <label for="decimalValue">数値:</label>
      <input
        type="text" // Use text to allow 'NaN', 'Infinity'
        id="decimalValue"
        placeholder="例: 3.14159, NaN, Infinity"
        value={props.value()}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
    </StyledNumberInputContainer>
  );
};
export default NumberInput;
