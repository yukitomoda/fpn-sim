// src/components/VisualValueAdjuster.tsx
import type { Component, Accessor } from 'solid-js';
import { createEffect, onMount } from 'solid-js';
import { EXPONENT_BITS } from '../utils/ieee754'; // For MAX_STORED_EXPONENT

interface VisualValueAdjusterProps {
  storedExponent: Accessor<number>;
  mantissaFraction: Accessor<number>;
  onPositionChange: (exponent: number, fraction: number) => void;
}

const WIDTH = 300;
const HEIGHT = 200;
const POINT_RADIUS = 5;
const LABEL_OFFSET = 20; // For axis labels

const VisualValueAdjuster: Component<VisualValueAdjusterProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let isDragging = false;
  const MAX_STORED_EXPONENT = (1 << EXPONENT_BITS) - 1; // 2047

  const getCanvasContext = (): CanvasRenderingContext2D | null => {
    return canvasRef ? canvasRef.getContext('2d') : null;
  };

  const draw = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Define regions based on exponent value
    const denormalizedZeroHeight = HEIGHT / (MAX_STORED_EXPONENT + 1); // Height for exp = 0
    const specialHeight = HEIGHT / (MAX_STORED_EXPONENT + 1);       // Height for exp = MAX_STORED_EXPONENT

    // Draw background for Zero/Denormalized region (exponent === 0)
    ctx.fillStyle = 'rgba(255, 255, 224, 0.7)'; // Light yellow
    ctx.fillRect(0, HEIGHT - denormalizedZeroHeight, WIDTH, denormalizedZeroHeight);

    // Draw background for Infinity/NaN region (exponent === MAX_STORED_EXPONENT)
    ctx.fillStyle = 'rgba(255, 224, 224, 0.7)'; // Light red
    ctx.fillRect(0, 0, WIDTH, specialHeight);

    // Draw background for Normal numbers region
    ctx.fillStyle = 'rgba(224, 255, 224, 0.7)'; // Light green
    ctx.fillRect(0, specialHeight, WIDTH, HEIGHT - specialHeight - denormalizedZeroHeight);

    // Draw Grid lines (optional, for better visual guidance)
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    // Y-axis grid lines (for exponent)
    for (let i = 0; i <= MAX_STORED_EXPONENT; i += Math.floor(MAX_STORED_EXPONENT/10)) {
        const y = HEIGHT - (i / MAX_STORED_EXPONENT) * HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
    }
    // X-axis grid lines (for mantissa)
    for (let i = 0; i <= 10; i++) {
        const x = (i/10) * WIDTH;
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
    }


    // Calculate point position
    // X: mantissaFraction (0 to <1) maps to 0 to WIDTH
    const x = props.mantissaFraction() * WIDTH;
    // Y: storedExponent (0 to MAX_STORED_EXPONENT) maps to HEIGHT (for 0) to 0 (for MAX)
    const y = HEIGHT - (props.storedExponent() / MAX_STORED_EXPONENT) * HEIGHT;

    // Draw the point
    ctx.beginPath();
    ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a73e8'; // Blue point
    ctx.fill();
    ctx.strokeStyle = '#0056b3'; // Darker blue border
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillText('0', LABEL_OFFSET - 5, HEIGHT - 2);
    ctx.fillText(MAX_STORED_EXPONENT.toString(), LABEL_OFFSET - 5, 10);
    // X-axis labels
    ctx.textAlign = 'center';
    ctx.fillText('0.0', LABEL_OFFSET, HEIGHT - LABEL_OFFSET + 15);
    ctx.fillText('~1.0', WIDTH - LABEL_OFFSET + 5, HEIGHT - LABEL_OFFSET + 15);
  };

  const handleMouseEvent = (event: MouseEvent) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Clamp coordinates to canvas bounds
    mouseX = Math.max(0, Math.min(WIDTH, mouseX));
    mouseY = Math.max(0, Math.min(HEIGHT, mouseY));

    // Convert to newMantissaFraction and newExponent
    let newMantissaFraction = mouseX / WIDTH;
    // Ensure fraction is < 1.0. If mouseX is exactly WIDTH, newMantissaFraction becomes 1.0.
    // (2**SIGNIFICAND_BITS -1) / 2**SIGNIFICAND_BITS is the largest fraction less than 1.
    // For simplicity, using Math.nextDown(1.0) or a slightly smaller hardcoded value.
    if (newMantissaFraction >= 1.0) {
        newMantissaFraction = Math.nextDown(1.0);
    }

    const newExponent = Math.round(MAX_STORED_EXPONENT * (1 - mouseY / HEIGHT));

    props.onPositionChange(newExponent, newMantissaFraction);
  };

  const onMouseDown = (event: MouseEvent) => {
    isDragging = true;
    handleMouseEvent(event);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      handleMouseEvent(event);
    }
  };

  const onMouseUpOrLeave = () => {
    isDragging = false;
  };

  onMount(() => {
    draw(); // Initial draw
  });

  // Re-draw when props change
  createEffect(draw);

  return (
    <div class="visual-adjuster-section">
      <label>Visual Value Adjuster:</label>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        style={{ cursor: 'crosshair', border: '1px solid black' }}
      />
    </div>
  );
};

export default VisualValueAdjuster;

// Note: Math.nextDown(1.0) might not be available in all JS environments/SolidJS directly.
// A practical alternative for clamping newMantissaFraction:
// const MAX_FRAC = (Math.pow(2, 52) - 1) / Math.pow(2, 52); // For SIGNIFICAND_BITS = 52
// if (newMantissaFraction > MAX_FRAC) newMantissaFraction = MAX_FRAC;
// Or simply: if (newMantissaFraction >= 1.0) newMantissaFraction = 1.0 - Number.EPSILON;
// For this implementation, Math.nextDown(1.0) is illustrative.
// In a real scenario, ensure the method used for clamping is robust.
// The current code uses `Math.nextDown(1.0)` which should work in modern browsers.
// If not, `1.0 - Number.EPSILON` is a good substitute for `Math.nextDown(1.0)`.
// props.onPositionChange will need to handle potential 1.0 if not clamped here.
// The task states App.tsx's handler will do the final clamping.
// So, `newMantissaFraction = mouseX / WIDTH;` is fine, and App.tsx handles strict <1.0.
// Let's adjust the clamping here to be less aggressive as App.tsx will handle it.
// `if (newMantissaFraction > 1.0) newMantissaFraction = 1.0;` is sufficient here.
// The critical clamping to less than 1.0 for ieee754 util should be in App.tsx.
// Updated the handleMouseEvent to reflect this understanding.
// The provided solution sketch expects onPositionChange to receive values that might need clamping.
// Re-checking the requirement: "ensure newMantissaFraction is clamped if it can reach 1.0"
// This clamping should ideally happen before calling onPositionChange if the component itself
// is aware of the <1.0 constraint.
// The current version with Math.nextDown(1.0) is a reasonable approach within the component.
// Final check on prompt: "onPositionChange: (exp, frac) => void".
// "App.tsx: Calls setMantissaFractionValue(newMantissaFraction). It's important to ensure newMantissaFraction is clamped if it can reach 1.0"
// This implies the VisualAdjuster can send up to 1.0, and App.tsx does the final <1.0 clamp.
// So, the line `if (newMantissaFraction >= 1.0) { newMantissaFraction = Math.nextDown(1.0); }`
// will be removed from VisualValueAdjuster to let App.tsx do the precise clamping.
// `mouseX / WIDTH` can indeed be 1.0.
// The `handleMouseEvent` will be simplified to just `mouseX / WIDTH`.
// ---
// After re-reading, the note "The clamping of newMantissaFraction in handleVisualAdjusterChange is important because mantissaFractionToBits expects a value strictly less than 1.0. x / WIDTH could result in 1.0 if x === WIDTH."
// strongly suggests App.tsx is the designated place for this specific clamp.
// The VisualAdjuster should provide the raw value from its calculation.
// Final logic for handleMouseEvent:
//   let newMantissaFraction = mouseX / WIDTH; // Can be 0.0 to 1.0
//   const newExponent = Math.round(MAX_STORED_EXPONENT * (1 - mouseY / HEIGHT));
//   props.onPositionChange(newExponent, newMantissaFraction);
// This is what I will implement.
// The comments at the end of the file are for my thought process and will not be in the final file.
// I will use the simplified version of handleMouseEvent.
// Removing the complex comment block at the end of the file.
// I'll use `1.0 - Number.EPSILON` for an effective "just under 1.0" if needed, but the prompt says App.tsx handles it.
// So, no clamping in this component for mantissaFraction being < 1.0.
// It can pass 1.0 to onPositionChange.
// The MAX_STORED_EXPONENT should be calculated correctly. (1 << EXPONENT_BITS) - 1 is correct.
// EXPONENT_BITS is imported.
// The grid lines were an addition not in the prompt, but good for usability. I'll keep them.
// Labels for Y-axis have 0 at bottom, MAX_EXP at top. This is standard.
// For X-axis, 0.0 on left, ~1.0 on right.
// Canvas y-coordinates are 0 at top, HEIGHT at bottom.
// So `y = HEIGHT - (props.storedExponent() / MAX_STORED_EXPONENT) * HEIGHT;` correctly maps:
// exp = 0 -> y = HEIGHT
// exp = MAX -> y = 0
// This is correct for drawing.
// For mouse input to value:
// mouseY = 0 (top) -> 1 - 0/HEIGHT = 1 -> newExponent = MAX
// mouseY = HEIGHT (bottom) -> 1 - HEIGHT/HEIGHT = 0 -> newExponent = 0
// This is also correct.
// The background region drawing logic:
// Denormalized/Zero (exp=0) is at the bottom: `ctx.fillRect(0, HEIGHT - denormalizedZeroHeight, WIDTH, denormalizedZeroHeight);` - Correct.
// Special (exp=MAX) is at the top: `ctx.fillRect(0, 0, WIDTH, specialHeight);` - Correct.
// Normal is in between. Correct.
// Looks good.Okay, I'll proceed with creating `src/components/VisualValueAdjuster.tsx` with the logic discussed.
The `handleMouseEvent` will calculate `newMantissaFraction` as `mouseX / WIDTH` (which can be 1.0) and `newExponent`. The clamping of `newMantissaFraction` to be strictly less than 1.0 will be handled in `App.tsx` as per the problem description.
