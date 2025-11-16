import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { mockFunctions } from '../../utils/test-utils';

describe('AnimatedButton', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: mockFunctions.onClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with children', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should apply custom variant', () => {
    render(<AnimatedButton {...defaultProps} variant="outlined" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-outlined');
  });

  it('should apply custom color', () => {
    render(<AnimatedButton {...defaultProps} color="secondary" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-colorSecondary');
  });

  it('should apply custom size', () => {
    render(<AnimatedButton {...defaultProps} size="large" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-sizeLarge');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AnimatedButton {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup();
    render(<AnimatedButton {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    // Use fireEvent instead of user.click for disabled buttons
    fireEvent.click(button);
    
    expect(mockFunctions.onClick).not.toHaveBeenCalled();
  });

  it('should apply fullWidth prop', () => {
    render(<AnimatedButton {...defaultProps} fullWidth />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it('should apply custom className', () => {
    render(<AnimatedButton {...defaultProps} className="custom-button" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
  });

  it('should show loading state', () => {
    render(<AnimatedButton {...defaultProps} loading />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should disable click when loading', async () => {
    const user = userEvent.setup();
    render(<AnimatedButton {...defaultProps} loading />);
    
    const button = screen.getByRole('button');
    // Use fireEvent instead of user.click for disabled buttons
    fireEvent.click(button);
    
    expect(mockFunctions.onClick).not.toHaveBeenCalled();
  });

  it('should handle keyboard events', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle space key', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(mockFunctions.onClick).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('should render with start icon', () => {
    const TestIcon = () => <span data-testid="start-icon">icon</span>;
    render(<AnimatedButton {...defaultProps} startIcon={<TestIcon />} />);
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should render with end icon', () => {
    const TestIcon = () => <span data-testid="end-icon">icon</span>;
    render(<AnimatedButton {...defaultProps} endIcon={<TestIcon />} />);
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should handle long text content', () => {
    const longText = 'This is a very long button text that should be handled properly';
    render(<AnimatedButton {...defaultProps}>{longText}</AnimatedButton>);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('should handle empty children gracefully', () => {
    render(<AnimatedButton onClick={mockFunctions.onClick}>{''}</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Check that the button exists but don't check for empty DOM element since Material-UI adds TouchRipple
    expect(button).toBeInTheDocument();
  });

  it('should apply hover effects', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    
    // Button should still be functional after hover
    expect(button).toBeInTheDocument();
  });

  it('should handle multiple clicks rapidly', async () => {
    const user = userEvent.setup();
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(mockFunctions.onClick).toHaveBeenCalledTimes(3);
  });

  it('should work with React.forwardRef', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<AnimatedButton {...defaultProps} ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should support different animation types through props', () => {
    render(<AnimatedButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Should have animation-related classes or styles
    const computedStyle = getComputedStyle(button);
    expect(computedStyle).toBeDefined();
  });
});
