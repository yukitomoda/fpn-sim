// src/components/OutputDisplay.tsx
import type { Component, Accessor } from 'solid-js';
import type { ExactDecimal } from '../utils/ieee754';
// +++ Import BigRational type +++
import type { BigRational } from 'big-rational-ts';

interface OutputDisplayProps {
  decimalFromBits: Accessor<ExactDecimal | string | null>;
  originalInput: Accessor<string>;
  // +++ Add new props +++
  exactRationalValue: Accessor<BigRational | null>;
  floatApproximationAsRational: Accessor<BigRational | null>;
  rationalConversionError: Accessor<string | null>;
}

const OutputDisplay: Component<OutputDisplayProps> = (props) => {
  const displayOrNA = (value: BigRational | null | undefined) => {
    return value ? value.toString() : 'N/A';
  };

  const difference = () => {
    const exact = props.exactRationalValue();
    const approx = props.floatApproximationAsRational();
    if (exact && approx) {
      return exact.subtract(approx).reduce(); // Add .reduce()
    }
    return null;
  };

  const ratio = () => {
    const diff = difference();
    const approx = props.floatApproximationAsRational();
    if (diff && approx) {
      if (approx.getNumerator() === 0n) { // Check if approx is zero
        return 'N/A (division by zero)';
      }
      return diff.div(approx).reduce(); // Add .reduce()
    }
    return null;
  };

  return (
    <div class="output-section">
      <p>入力された数値 (そのまま): <span id="outputOriginalInput">{props.originalInput()}</span></p>

      {/* Display Rational Conversion Error if any */}
      {() => {
        const error = props.rationalConversionError();
        return error ? <p style="color: red;">入力エラー: {error}</p> : null;
      }}

      <p>入力の正確な分数表現: <span id="outputExactRational">{displayOrNA(props.exactRationalValue())}</span></p>

      <p>IEEE 754 近似値 (ビット表現から): <span id="outputFromBits">{
        () => {
          const result = props.decimalFromBits();
          if (result === null || result === undefined) return 'N/A';
          if (typeof result === 'string') return result; // Error/status message like "スライダー調整中..."

          let displayValue = result.originalString !== undefined ? result.originalString : String(result.value);
          if (result.isDenormalized) {
            displayValue += ' [非正規化数]';
          }
          return displayValue;
        }
      }</span></p>

      <p>IEEE 754 近似値の分数表現: <span id="outputApproxRational">{displayOrNA(props.floatApproximationAsRational())}</span></p>

      <p>差 (入力の正確な分数 - IEEE 754 近似の分数): <span id="outputDifference">{displayOrNA(difference())}</span></p>

      <p>比率 (差 / IEEE 754 近似の分数): <span id="outputRatio">{
        () => {
          const r = ratio();
          if (typeof r === 'string') return r; // For "N/A (division by zero)"
          return displayOrNA(r);
        }
      }</span></p>
    </div>
  );
};
export default OutputDisplay;
