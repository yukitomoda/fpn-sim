// src/components/BitRepresentationInput.tsx
import type { Component, Accessor } from 'solid-js';
import { styled } from 'solid-styled-components';
import { EXPONENT_BITS, SIGNIFICAND_BITS } from '../utils/ieee754';

interface BitRepresentationInputProps {
  sign: Accessor<string>;
  exponent: Accessor<string>;
  significand: Accessor<string>;
  onSignBitClick: () => void;
  onExponentBitClick: (index: number) => void;
  onSignificandBitClick: (index: number) => void;
}

const StyledBitRepresentationSection = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;

  h2 {
    font-size: 1.2em;
    color: #333;
    margin-top: 0;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
`;

const StyledBitDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const StyledBitGroupBase = styled.div`
  padding: 15px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  background-color: #ffffff;
  flex-grow: 1;

  label {
    font-size: 0.9em;
    color: #444;
    margin-bottom: 6px;
    display: block; // Ensure label takes full width and margin bottom applies
  }

  /* Targeting the direct label child, not nested ones if any */
  > label {
    font-weight: 600; /* From general label style, ensure it's applied */
    color: #555; /* From general label style */
  }
`;

const StyledSignBitGroup = styled(StyledBitGroupBase)`
  min-width: 80px;
  flex-basis: 100px;
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    flex-basis: auto;
  }
`;

const StyledExponentBitGroup = styled(StyledBitGroupBase)`
  min-width: 180px;
  flex-basis: 220px;
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    flex-basis: auto;
  }
`;

const StyledSignificandBitGroup = styled(StyledBitGroupBase)`
  min-width: 280px;
  flex-basis: 850px;
  flex-grow: 2;
  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    flex-basis: auto;
  }
`;

const StyledBitsScrollContainer = styled.div`
  white-space: nowrap;
  overflow-x: auto;
  padding-bottom: 8px;
  min-width: 0;
`;

const StyledClickableBit = styled.span`
  display: inline-block;
  padding: 4px 0;
  margin: 0; /* Adjusted from 0 0 to just 0 for simplicity */
  border: 1px solid #ccc;
  border-radius: 2px;
  cursor: pointer;
  user-select: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
  min-width: 1.1em;
  text-align: center;
  line-height: 1.2;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:nth-last-child(4n) {
    margin-left: 0.2em;
  }

  &:nth-last-child(8n) {
    margin-left: 0.5em;
  }

  &:hover {
    background-color: #f0f0f0;
    border-color: #aaa;
  }
`;

const BitRepresentationInput: Component<BitRepresentationInputProps> = (props) => {
  return (
    <StyledBitRepresentationSection>
      <h2>ビット表現 (IEEE 754 64ビット)</h2>
      <StyledBitDisplay>
        <StyledSignBitGroup>
          <label>符号 (1ビット):</label>
          <StyledClickableBit onClick={() => props.onSignBitClick()}>
            {props.sign()}
          </StyledClickableBit>
        </StyledSignBitGroup>
        <StyledExponentBitGroup>
          <label>指数 ({EXPONENT_BITS}ビット):</label>
          <StyledBitsScrollContainer>
            {props.exponent().split('').map((bit, index) => (
              <StyledClickableBit onClick={() => props.onExponentBitClick(index)}>
                {bit}
              </StyledClickableBit>
            ))}
          </StyledBitsScrollContainer>
        </StyledExponentBitGroup>
        <StyledSignificandBitGroup>
          <label>仮数 ({SIGNIFICAND_BITS}ビット):</label>
          <StyledBitsScrollContainer>
            {props.significand().split('').map((bit, index) => (
              <StyledClickableBit onClick={() => props.onSignificandBitClick(index)}>
                {bit}
              </StyledClickableBit>
            ))}
          </StyledBitsScrollContainer>
        </StyledSignificandBitGroup>
      </StyledBitDisplay>
    </StyledBitRepresentationSection>
  );
};
export default BitRepresentationInput;
