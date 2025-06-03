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
