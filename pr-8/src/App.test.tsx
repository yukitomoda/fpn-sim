import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, afterEach, vi } from 'vitest';
import App from './App';
import { convertDecimalToBits, convertBitsToDecimal, ExactDecimal } from './utils/ieee754'; // Added ExactDecimal

// Mock the ResizeObserver as it's often problematic in JSDOM for tests
// and not relevant to this component's logic.
const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', MockResizeObserver);


describe('App component', () => {
  afterEach(() => {
    // testing-library usually cleans up automatically, but explicit cleanup can be added if needed
    // For example, if using vi.restoreAllMocks() or similar general cleanup.
    vi.clearAllMocks(); // Clear mocks after each test
  });

  it('should update the NumberInput when the sign bit is toggled', async () => {
    render(() => <App />);

    const initialInputValue = '3.14159';
    const expectedNegativeValue = '-3.14158999999999988261834005243144929409027099609375';

    const numberInput = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity') as HTMLInputElement;
    expect(numberInput.value).toBe(initialInputValue);

    // Get initial bits from the model, not UI, to ensure accuracy for assertion
    const initialModelBits = convertDecimalToBits(initialInputValue);

    // Find the sign bit span.
    // The BitRepresentationInput renders the sign bit as the first element with class 'bit-square.clickable'
    // A more robust selector would be a test-id.
    // The sign bit is a span with classes 'clickable-bit' and 'sign-bit-span'.
    const signBitSpan = document.querySelector('.clickable-bit.sign-bit-span') as HTMLElement;

    if (!signBitSpan) {
      throw new Error("Could not find the clickable sign bit span. Check classes: .clickable-bit.sign-bit-span");
    }

    expect(signBitSpan.textContent).toBe(initialModelBits.sign);

    // Toggle the sign bit
    fireEvent.click(signBitSpan);

    const newSign = initialModelBits.sign === '0' ? '1' : '0';
    // Check UI update for the bit itself
    expect(signBitSpan.textContent).toBe(newSign);

    // The number input should update to the negative equivalent.
    // Solid's reactivity updates are generally synchronous, but testing-library's screen updates might take a tick.
    // Using findBy queries if value doesn't update immediately, or await tick if Solid provides one.
    // For now, expecting it to be synchronous.
    expect(numberInput.value).toBe(expectedNegativeValue);

    // As a sanity check, let's verify the displayed "正確な値" also updates.
    // This value comes from the `decimalFromBits` memo in App.tsx which calls `convertBitsToDecimal`
    const exactValueOutput = document.getElementById('outputFromBits') as HTMLElement;

    if (!exactValueOutput) {
      throw new Error("Could not find the exact value output span with id 'outputFromBits'");
    }

    // The `convertBitsToDecimal` function returns an object.
    // The OutputDisplay component will render `result.value` or `result.originalString`.
    // For normal numbers, originalString is undefined, so it's result.value.
    expect(exactValueOutput.textContent).toBe(expectedNegativeValue);
  });
});
