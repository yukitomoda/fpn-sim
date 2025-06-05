// src/components/VisualValueAdjuster.tsx
import type { Component, Accessor } from 'solid-js';
import { createEffect, onMount } from 'solid-js';
import { EXPONENT_BITS } from '../utils/ieee754'; // For MAX_STORED_EXPONENT

interface VisualValueAdjusterProps {
  storedExponent: Accessor<number>;
  mantissaFraction: Accessor<number>;
  onPositionChange: (exponent: number, fraction: number) => void;
}

const FIXED_HEIGHT = 200;
const POINT_RADIUS = 5;
const LABEL_OFFSET = 20; // For axis labels

const VisualValueAdjuster: Component<VisualValueAdjusterProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let isDragging = false;
  const MAX_STORED_EXPONENT = (1 << EXPONENT_BITS) - 1; // 2047
  let resizeObserver: ResizeObserver | null = null;

  const getCanvasContext = (): CanvasRenderingContext2D | null => {
    return canvasRef ? canvasRef.getContext('2d') : null;
  };

  const draw = () => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.width, FIXED_HEIGHT);

    // Define regions based on exponent value
    const denormalizedZeroHeight = FIXED_HEIGHT / (MAX_STORED_EXPONENT + 1); // Height for exp = 0
    const specialHeight = FIXED_HEIGHT / (MAX_STORED_EXPONENT + 1);       // Height for exp = MAX_STORED_EXPONENT

    // Draw background for Zero/Denormalized region (exponent === 0)
    ctx.fillStyle = 'rgba(255, 255, 224, 0.7)'; // Light yellow
    ctx.fillRect(0, FIXED_HEIGHT - denormalizedZeroHeight, canvasRef.width, denormalizedZeroHeight);

    // Draw background for Infinity/NaN region (exponent === MAX_STORED_EXPONENT)
    ctx.fillStyle = 'rgba(255, 224, 224, 0.7)'; // Light red
    ctx.fillRect(0, 0, canvasRef.width, specialHeight);

    // Draw background for Normal numbers region
    ctx.fillStyle = 'rgba(224, 255, 224, 0.7)'; // Light green
    ctx.fillRect(0, specialHeight, canvasRef.width, FIXED_HEIGHT - specialHeight - denormalizedZeroHeight);

    // Draw Grid lines (optional, for better visual guidance)
    ctx.strokeStyle = '#ddd';
    if (!canvasRef) return;
    ctx.lineWidth = 0.5;
    // Y-axis grid lines (for exponent)
    for (let i = 0; i <= MAX_STORED_EXPONENT; i += Math.floor(MAX_STORED_EXPONENT/10)) {
        const y = FIXED_HEIGHT - (i / MAX_STORED_EXPONENT) * FIXED_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.width, y);
        ctx.stroke();
    }
    // X-axis grid lines (for mantissa)
    for (let i = 0; i <= 10; i++) {
        const xPos = (i/10) * canvasRef.width;
        ctx.beginPath();
        ctx.moveTo(xPos,0);
        ctx.lineTo(xPos, FIXED_HEIGHT);
        ctx.stroke();
    }


    // Calculate point position
    // X: mantissaFraction (0 to <1) maps to 0 to canvasRef.width
    const x = props.mantissaFraction() * canvasRef.width;
    // Y: storedExponent (0 to MAX_STORED_EXPONENT) maps to FIXED_HEIGHT (for 0) to 0 (for MAX)
    const y = FIXED_HEIGHT - (props.storedExponent() / MAX_STORED_EXPONENT) * FIXED_HEIGHT;

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
    if (!canvasRef) return;
    ctx.font = '10px Arial';
    // Y-axis labels
    ctx.textAlign = 'left'; // Adjusted alignment for potentially longer Japanese text
    ctx.fillText('0', 5, FIXED_HEIGHT - 5); // Adjusted position
    ctx.fillText(`最大指数 (${MAX_STORED_EXPONENT})`, 5, 15); // Adjusted position & text
    // X-axis labels
    ctx.textAlign = 'left';
    ctx.fillText('0.0', 5, FIXED_HEIGHT - LABEL_OFFSET + 10 ); // Adjusted for consistency
    ctx.textAlign = 'right';
    ctx.fillText('ほぼ1.0', canvasRef.width - 5, FIXED_HEIGHT - LABEL_OFFSET + 10); // Adjusted position & text
  };

  const handleMouseEvent = (event: MouseEvent) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    // Clamp coordinates to canvas bounds
    mouseX = Math.max(0, Math.min(canvasRef.width, mouseX));
    mouseY = Math.max(0, Math.min(FIXED_HEIGHT, mouseY));

    // Convert to newMantissaFraction and newExponent
    let newMantissaFraction = mouseX / canvasRef.width;
    // Ensure fraction is < 1.0. If mouseX is exactly canvasRef.width, newMantissaFraction becomes 1.0.
    // (2**SIGNIFICAND_BITS -1) / 2**SIGNIFICAND_BITS is the largest fraction less than 1.
    // For simplicity, using Math.nextDown(1.0) or a slightly smaller hardcoded value.
    if (newMantissaFraction >= 1.0) {
        newMantissaFraction = Math.nextDown(1.0);
    }

    const newExponent = Math.round(MAX_STORED_EXPONENT * (1 - mouseY / FIXED_HEIGHT));

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

  const handleTouchEvent = (event: TouchEvent) => {
    if (!canvasRef || event.touches.length === 0) return;
    const rect = canvasRef.getBoundingClientRect();
    const touch = event.touches[0];
    let touchX = touch.clientX - rect.left;
    let touchY = touch.clientY - rect.top;

    // Clamp coordinates to canvas bounds
    touchX = Math.max(0, Math.min(canvasRef.width, touchX));
    touchY = Math.max(0, Math.min(FIXED_HEIGHT, touchY));

    // Convert to newMantissaFraction and newExponent
    let newMantissaFraction = touchX / canvasRef.width;
    // Ensure fraction is < 1.0. If touchX is exactly canvasRef.width, newMantissaFraction becomes 1.0.
    if (newMantissaFraction >= 1.0) {
        newMantissaFraction = Math.nextDown(1.0);
    }

    const newExponent = Math.round(MAX_STORED_EXPONENT * (1 - touchY / FIXED_HEIGHT));

    props.onPositionChange(newExponent, newMantissaFraction);
  };

  // Touch event handlers
  const onTouchStartHandler = (event: TouchEvent) => {
    isDragging = true;
    handleTouchEvent(event);
    event.preventDefault();
  };

  const onTouchMoveHandler = (event: TouchEvent) => {
    if (isDragging) {
      handleTouchEvent(event);
    }
    event.preventDefault();
  };

  const onTouchEndHandler = () => { // No event argument needed for onTouchEnd
    isDragging = false;
  };

  onMount(() => {
    if (!canvasRef || !canvasRef.parentElement) return;

    const parentEl = canvasRef.parentElement;

    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === parentEl && canvasRef) {
          const newWidth = entry.contentRect.width;
          canvasRef.width = newWidth;
          canvasRef.height = FIXED_HEIGHT;
          draw();
        }
      }
    });

    resizeObserver.observe(parentEl);

    // Initial sizing based on parent
    canvasRef.width = parentEl.clientWidth;
    canvasRef.height = FIXED_HEIGHT;
    draw(); // Initial draw

    // Cleanup observer on component unmount
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  });

  // Re-draw when props change
  createEffect(draw);

  return (
    <div class="visual-adjuster-section">
      <label for="visualAdjusterCanvas">2Dビジュアル調整 (Y軸: 指数, X軸: 仮数小数部):</label>
      <canvas
        id="visualAdjusterCanvas"
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onTouchStart={onTouchStartHandler}
        onTouchMove={onTouchMoveHandler}
        onTouchEnd={onTouchEndHandler}
        style={{ cursor: 'crosshair', border: '1px solid black', touchAction: 'none' }} // Added touchAction: 'none' to prevent scrolling on touch
      />
    </div>
  );
};

export default VisualValueAdjuster;
