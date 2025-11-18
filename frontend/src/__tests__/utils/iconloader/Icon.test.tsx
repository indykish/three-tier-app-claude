import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon } from '@/utils/iconloader/Icon';
import { ICON_SIZES } from '@/utils/iconloader/types';

// Mock IconProvider
jest.mock('@/utils/iconloader/IconProvider', () => ({
  IconProvider: ({ iconName, size, color, className }: any) => (
    <div data-testid="icon-provider" data-icon-name={iconName} data-size={size} data-color={color} className={className}>
      Mock Icon: {iconName}
    </div>
  ),
}));

// Mock clsx
jest.mock('clsx', () => jest.fn((base, ...classes) => {
  const result = [base];
  classes.forEach(cls => {
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'object' && cls !== null) {
      Object.entries(cls).forEach(([key, value]) => {
        if (value) result.push(key);
      });
    }
  });
  return result.filter(Boolean).join(' ');
}));

describe('Icon', () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it('should render with default props', () => {
    render(<Icon name="test-icon" />);
    
    expect(screen.getByText('Mock Icon: test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-icon-name', 'test-icon');
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-size', ICON_SIZES.md);
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-color', 'currentColor');
  });

  it('should apply custom size from ICON_SIZES', () => {
    render(<Icon name="test-icon" size="lg" />);
    
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-size', ICON_SIZES.lg);
  });

  it('should apply custom size as string', () => {
    render(<Icon name="test-icon" size="48px" />);
    
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-size', '48px');
  });

  it('should apply custom color', () => {
    render(<Icon name="test-icon" color="#ff0000" />);
    
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-color', '#ff0000');
  });

  it('should apply variant class', () => {
    render(<Icon name="test-icon" variant="filled" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveClass('icon-filled');
  });

  it('should apply category class', () => {
    render(<Icon name="test-icon" category="business" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveClass('icon-business');
  });

  it('should apply size class for predefined sizes', () => {
    render(<Icon name="test-icon" size="xl" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveClass('icon-size-xl');
  });

  it('should not apply size class for custom sizes', () => {
    render(<Icon name="test-icon" size="48px" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).not.toHaveClass('icon-size-48px');
  });

  it('should apply custom className', () => {
    render(<Icon name="test-icon" className="custom-class" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('should apply correct container styles', () => {
    render(<Icon name="test-icon" size="lg" color="#ff0000" />);
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveStyle({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: ICON_SIZES.lg,
      height: ICON_SIZES.lg,
      color: '#ff0000',
    });
  });

  it('should pass through additional props', () => {
    render(<Icon name="test-icon" data-testid="custom-icon" />);
    
    const container = screen.getByTestId('custom-icon');
    expect(container).toBeInTheDocument();
  });

  it('should warn and return null when name is not provided', () => {
    const { container } = render(<Icon name="" />);
    
    expect(console.warn).toHaveBeenCalledWith('Icon component requires a name prop');
    expect(container.firstChild).toBeNull();
  });

  it('should warn and return null when name is undefined', () => {
    const { container } = render(<Icon name={undefined as any} />);
    
    expect(console.warn).toHaveBeenCalledWith('Icon component requires a name prop');
    expect(container.firstChild).toBeNull();
  });

  it('should handle all IconSizes correctly', () => {
    const sizes = Object.keys(ICON_SIZES) as Array<keyof typeof ICON_SIZES>;
    
    sizes.forEach(size => {
      const { unmount } = render(<Icon name="test-icon" size={size} />);
      
      expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-size', ICON_SIZES[size]);
      
      unmount();
    });
  });

  it('should combine multiple CSS classes correctly', () => {
    render(
      <Icon 
        name="test-icon" 
        className="custom-class" 
        variant="filled" 
        category="business" 
        size="lg" 
      />
    );
    
    const container = screen.getByText('Mock Icon: test-icon').parentElement;
    expect(container).toHaveClass('icon-container');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveClass('icon-filled');
    expect(container).toHaveClass('icon-business');
    expect(container).toHaveClass('icon-size-lg');
  });

  it('should have correct display name', () => {
    expect(Icon.displayName).toBe('Icon');
  });

  it('should handle numeric size values', () => {
    render(<Icon name="test-icon" size="32px" />);
    
    expect(screen.getByTestId('icon-provider')).toHaveAttribute('data-size', '32px');
  });

  it('should pass className to IconProvider', () => {
    render(<Icon name="test-icon" />);
    
    expect(screen.getByTestId('icon-provider')).toHaveClass('icon-svg');
  });
});