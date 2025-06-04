// src/components/SpecialValueButtons.tsx
import type { Component } from 'solid-js';
import './components.css'; // Assuming shared CSS

interface SpecialValueButtonsProps {
  onSpecialValueClick: (value: string) => void;
}

const SpecialValueButtons: Component<SpecialValueButtonsProps> = (props) => {
  const values = [
    { label: 'NaN', value: 'NaN' },
    { label: 'Infinity', value: 'Infinity' },
    { label: '-Infinity', value: '-Infinity' },
    { label: '+0', value: '0.0' },
    { label: '-0', value: '-0.0' }, // IEEE 754 distinguishes +0 and -0
    { label: '1', value: '1.0' },
    // For "Epsilon", we'll use Number.EPSILON, which is the difference between 1 and the smallest float greater than 1.
    // The smallest positive normalized number is different, it's Number.MIN_VALUE for double precision.
    // Let's clarify which one is needed. For now, using Number.EPSILON as it's a common "small" float value.
    { label: 'Epsilon', value: Number.EPSILON.toString() },
    { label: 'Min Normal', value: Number.MIN_VALUE.toString()}, // Smallest positive normal for double
    { label: 'Max Value', value: Number.MAX_VALUE.toString() } // Max finite value for double
  ];

  return (
    <div class="special-buttons-container">
      <h3>特定の値に設定:</h3>
      <div class="buttons-wrapper"> {/* Added wrapper for flex layout */}
        {values.map(item => (
          <button
            type="button"
            class="special-value-button"
          onClick={() => props.onSpecialValueClick(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpecialValueButtons;
