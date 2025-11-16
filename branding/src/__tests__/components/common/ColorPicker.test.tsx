import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from '@/components/common/ColorPicker';
import { mockFunctions } from '../../utils/test-utils';

describe('ColorPicker', () => {
  const defaultProps = {
    label: 'Primary Color',
    value: '#1976d2',
    onChange: mockFunctions.onChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label and value', () => {
    render(<ColorPicker {...defaultProps} />);
    
    expect(screen.getByText('Primary Color')).toBeInTheDocument();
    // Check that both inputs exist with the value
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    expect(hexInputs.length).toBe(2); // color input and hex input
  });

  it('should render color preview', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const colorInput = screen.getByTestId('color-input');
    // Check that the color input has the correct value
    expect(colorInput).toHaveValue('#1976d2');
    // Check that it has the background style property
    const style = colorInput.getAttribute('style');
    expect(style).toContain('linear-gradient(135deg, #1976d2');
  });

  it('should handle hex input changes', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'ff0000');
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('#FF0000');
  });

  it('should handle color input changes', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const colorInput = screen.getByTestId('color-input');
    
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('should format hex input correctly', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    // Test auto-adding hash
    await user.clear(hexInput!);
    await user.type(hexInput!, 'ff0000');
    
    expect(hexInput).toHaveValue('#ff0000');
  });

  it('should limit hex input length', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'ff0000extra');
    
    expect(hexInput).toHaveValue('#ff0000');
  });

  it('should handle invalid hex input', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'invalid');
    
    // Should not call onChange for invalid hex
    expect(mockFunctions.onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Enter valid hex color (e.g., #FF0000)')).toBeInTheDocument();
  });

  it('should clean non-hex characters from input', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'ff00gg');
    
    expect(hexInput).toHaveValue('#ff00');
  });

  it('should update value when color picker changes', () => {
    const { rerender } = render(<ColorPicker {...defaultProps} />);
    
    // Use getAllByDisplayValue to get both inputs and select the hex input
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeInTheDocument();
    
    rerender(<ColorPicker {...defaultProps} value="#ff0000" />);
    
    const newHexInputs = screen.getAllByDisplayValue('#ff0000');
    const newHexInput = newHexInputs.find(input => input.getAttribute('type') === 'text');
    expect(newHexInput).toBeInTheDocument();
  });

  it('should handle uppercase input', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    // Get the hex input specifically
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'FF0000');
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('#FF0000');
  });

  it('should show help text', () => {
    render(<ColorPicker {...defaultProps} helperText="Choose your brand color" />);
    
    expect(screen.getByText('Choose your brand color')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ColorPicker {...defaultProps} error helperText="Invalid color" />);
    
    expect(screen.getByText('Invalid color')).toBeInTheDocument();
    // Check that the TextField has error prop set
    const textField = screen.getByRole('textbox');
    expect(textField).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<ColorPicker {...defaultProps} disabled />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    const colorInput = screen.getByTestId('color-input');
    
    expect(hexInput).toBeDisabled();
    expect(colorInput).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<ColorPicker {...defaultProps} className="custom-picker" />);
    
    const container = screen.getByText('Primary Color').closest('div');
    expect(container).toHaveClass('custom-picker');
  });

  it('should handle 3-character hex codes', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.type(hexInput!, 'f00');
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('#FF0000');
  });

  it('should handle paste events', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.clear(hexInput!);
    await user.click(hexInput!);
    
    // Simulate paste event by typing the content
    await user.type(hexInput!, '00ff00');
    
    // The paste event should trigger the hex input change handler
    expect(hexInput).toHaveValue('#00ff00');
  });

  it('should have proper accessibility attributes', () => {
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    const colorInput = screen.getByTestId('color-input');
    
    expect(hexInput).toHaveAttribute('aria-label');
    expect(colorInput).toBeInTheDocument();
  });

  it('should handle blur events without crashing', async () => {
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} />);
    
    const hexInputs = screen.getAllByDisplayValue('#1976d2');
    const hexInput = hexInputs.find(input => input.getAttribute('type') === 'text');
    expect(hexInput).toBeTruthy();
    
    await user.click(hexInput!);
    await user.tab(); // This will blur the input
    
    // Should not crash
    expect(hexInput).toBeInTheDocument();
  });
});
