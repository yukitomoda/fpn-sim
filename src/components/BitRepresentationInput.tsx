// src/components/BitRepresentationInput.tsx
import type { Component, Accessor } from 'solid-js';
import { For } from 'solid-js'; // Import For for list rendering
import { EXPONENT_BITS, SIGNIFICAND_BITS } from '../utils/ieee754';

// Helper function to format bits with line breaks
const formatBitsWithLineBreaks = (bitString: string, chunkSize: number): string[] => {
  if (!bitString) return [];
  const reversedBits = bitString.split('').reverse().join('');
  const chunks: string[] = [];
  for (let i = 0; i < reversedBits.length; i += chunkSize) {
    chunks.push(reversedBits.slice(i, i + chunkSize));
  }
  // Reverse each chunk and then the array of chunks to get the original MSB-first order for display
  return chunks.map(chunk => chunk.split('').reverse().join('')).reverse();
};

interface BitRepresentationInputProps {
  sign: Accessor<string>;
  exponent: Accessor<string>;
  significand: Accessor<string>;
  onSignBitClick: () => void;
  onExponentBitClick: (index: number) => void;
  onSignificandBitClick: (index: number) => void;
}

const BitRepresentationInput: Component<BitRepresentationInputProps> = (props) => {
  return (
    <div class="bit-representation-section">
      <h2>ビット表現 (IEEE 754 64ビット)</h2>
      <div class="bit-display">
        <div class="bit-group sign-bit">
          <label>符号 (1ビット):</label>
          {/* No scroll container needed for a single bit */}
          <span class={`clickable-bit sign-bit-span ${props.sign() === '0' ? 'bit-zero' : 'bit-one'}`} onClick={() => props.onSignBitClick()}>
            {props.sign()}
          </span>
        </div>
        <div class="bit-group exponent-bits">
          <label>指数 ({EXPONENT_BITS}ビット):</label>
          <div class="bits-scroll-container">
            {() => {
              const exponentChunks = formatBitsWithLineBreaks(props.exponent(), 4);
              let originalBitIndex = 0;
              return (
                <For each={exponentChunks}>
                  {(chunk, _chunkIndex) => (
                    <div class="bit-chunk">
                      <For each={chunk.split('')}>
                        {(bit, bitInChunkIndex) => {
                          const currentIndex = originalBitIndex + bitInChunkIndex();
                          return (
                            <span
                              class={`clickable-bit exponent-bit-span ${bit === '0' ? 'bit-zero' : 'bit-one'}`}
                              onClick={() => props.onExponentBitClick(currentIndex)}
                            >
                              {bit}
                            </span>
                          );
                        }}
                      </For>
                      {originalBitIndex += chunk.length}
                    </div>
                  )}
                </For>
              );
            }}
          </div>
        </div>
        <div class="bit-group significand-bits">
          <label>仮数 ({SIGNIFICAND_BITS}ビット):</label>
          <div class="bits-scroll-container">
            {() => {
              const significandChunks = formatBitsWithLineBreaks(props.significand(), 4);
              let originalBitIndex = 0;
              return (
                <For each={significandChunks}>
                  {(chunk, _chunkIndex) => (
                    <div class="bit-chunk">
                      <For each={chunk.split('')}>
                        {(bit, bitInChunkIndex) => {
                          const currentIndex = originalBitIndex + bitInChunkIndex();
                          return (
                            <span
                              class={`clickable-bit significand-bit-span ${bit === '0' ? 'bit-zero' : 'bit-one'}`}
                              onClick={() => props.onSignificandBitClick(currentIndex)}
                            >
                              {bit}
                            </span>
                          );
                        }}
                      </For>
                      {originalBitIndex += chunk.length}
                    </div>
                  )}
                </For>
              );
            }}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BitRepresentationInput;

// Add some basic styling for bit-chunk for line breaks
// This should ideally be in a CSS file, but for simplicity here.
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .bit-chunk {
      display: block; /* Each chunk takes a new line */
      margin-bottom: 2px; /* Optional: add some space between lines */
    }
    .bit-chunk span {
      margin-right: 1px; /* Adjust spacing between bits if necessary */
    }
  `;
  document.head.appendChild(style);
}
