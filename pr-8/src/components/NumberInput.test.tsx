import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal } from 'solid-js';
import NumberInput from './NumberInput';

describe('NumberInput component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should render with initial value', () => {
    const [value, setValue] = createSignal('3.14159');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const input = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity') as HTMLInputElement;
    expect(input.value).toBe('3.14159');
  });

  it('should call onInput when user types', () => {
    const [value, setValue] = createSignal('');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const input = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity');
    fireEvent.input(input, { target: { value: '42.5' } });

    expect(mockOnInput).toHaveBeenCalledWith('42.5');
  });

  it('should handle special values like NaN and Infinity', () => {
    const [value, setValue] = createSignal('NaN');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const input = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity') as HTMLInputElement;
    expect(input.value).toBe('NaN');

    fireEvent.input(input, { target: { value: 'Infinity' } });
    expect(mockOnInput).toHaveBeenCalledWith('Infinity');

    fireEvent.input(input, { target: { value: '-Infinity' } });
    expect(mockOnInput).toHaveBeenCalledWith('-Infinity');
  });

  it('should handle empty input', () => {
    const [value, setValue] = createSignal('');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const input = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity');
    fireEvent.input(input, { target: { value: '' } });

    expect(mockOnInput).toHaveBeenCalledWith('');
  });

  it('should update display when value prop changes', () => {
    const [value, setValue] = createSignal('1.0');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const input = screen.getByPlaceholderText('例: 3.14159, NaN, Infinity') as HTMLInputElement;
    expect(input.value).toBe('1.0');

    setValue('2.5');
    expect(input.value).toBe('2.5');
  });

  it('should have correct label and accessibility attributes', () => {
    const [value, setValue] = createSignal('0');
    const mockOnInput = vi.fn();

    render(() => <NumberInput value={value} onInput={mockOnInput} />);

    const label = screen.getByText('数値:');
    const input = screen.getByLabelText('数値:');
    
    expect(label).toBeTruthy();
    expect(input.getAttribute('id')).toBe('decimalValue');
    expect(input.getAttribute('type')).toBe('text');
  });
});
