import React from 'react';
import { renderHook, render, screen } from '@testing-library/react';
import { BrandingProvider, useBranding } from '@/context/BrandingProvider';
import { mockBrandingSettings, MockComponent } from '../utils/test-utils';

describe('BrandingProvider', () => {
  it('should provide branding settings to children', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return <div>{settings.companyName}</div>;
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('should provide colors object with theme colors', () => {
    const TestComponent = () => {
      const { colors } = useBranding();
      return (
        <div>
          <span data-testid="primary">{colors.primary}</span>
          <span data-testid="secondary">{colors.secondary}</span>
          <span data-testid="text">{colors.text}</span>
        </div>
      );
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByTestId('primary')).toHaveTextContent('#ff0000');
    expect(screen.getByTestId('secondary')).toHaveTextContent('#00ff00');
    expect(screen.getByTestId('text')).toHaveTextContent('#333333');
  });

  it('should provide logos object', () => {
    const TestComponent = () => {
      const { logos } = useBranding();
      return (
        <div>
          <span data-testid="website">{logos.websiteLogo || 'none'}</span>
          <span data-testid="favicon">{logos.favIcon || 'none'}</span>
        </div>
      );
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByTestId('website')).toHaveTextContent('test-light-logo.png');
    expect(screen.getByTestId('favicon')).toHaveTextContent('test-favicon.ico');
  });

  it('should provide app title from capabilities', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return <div>{settings.capabilities.general_app_title}</div>;
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByText('Test Bank')).toBeInTheDocument();
  });

  it('should update when settings prop changes', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return <div>{settings.companyName}</div>;
    };

    const { rerender } = render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();

    const updatedSettings = {
      ...mockBrandingSettings,
      companyName: 'Updated Company',
    };

    rerender(
      <BrandingProvider settings={updatedSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByText('Updated Company')).toBeInTheDocument();
  });

  it('should handle missing logos gracefully', () => {
    const settingsWithoutLogos = {
      ...mockBrandingSettings,
      theme: {
        ...mockBrandingSettings.theme,
        logos: {},
      },
    };

    const TestComponent = () => {
      const { logos } = useBranding();
      return (
        <div>
          <span data-testid="light">{logos.light || 'no-light'}</span>
          <span data-testid="dark">{logos.dark || 'no-dark'}</span>
        </div>
      );
    };

    render(
      <BrandingProvider settings={settingsWithoutLogos}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByTestId('light')).toHaveTextContent('no-light');
    expect(screen.getByTestId('dark')).toHaveTextContent('no-dark');
  });

  it('should throw error when useBranding is used outside provider', () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    const TestComponent = () => {
      useBranding(); // This should throw
      return <div>Should not render</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useBranding must be used within BrandingProvider');

    console.error = originalError;
  });

  it('should provide font family from theme', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return <div>{settings.theme.font_family}</div>;
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByText('Arial, sans-serif')).toBeInTheDocument();
  });

  it('should provide button colors', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return (
        <div>
          <span data-testid="primary-btn">{settings.theme.button.primary_color}</span>
          <span data-testid="secondary-btn">{settings.theme.button.secondary_color}</span>
          <span data-testid="hover-btn">{settings.theme.button.hover_color}</span>
        </div>
      );
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByTestId('primary-btn')).toHaveTextContent('#ff0000');
    expect(screen.getByTestId('secondary-btn')).toHaveTextContent('#00ff00');
    expect(screen.getByTestId('hover-btn')).toHaveTextContent('#cc0000');
  });

  it('should handle hook usage properly', () => {
    const { result } = renderHook(() => useBranding(), {
      wrapper: ({ children }) => (
        <BrandingProvider settings={mockBrandingSettings}>
          {children}
        </BrandingProvider>
      ),
    });

    expect(result.current.settings).toEqual(mockBrandingSettings);
    expect(result.current.colors.primary).toBe('#ff0000');
    expect(result.current.logos.websiteLogo).toBe('test-light-logo.png');
  });

  it('should memoize colors object to prevent unnecessary re-renders', () => {
    let renderCount = 0;
    const TestComponent = () => {
      const { colors } = useBranding();
      renderCount++;
      return <div>{colors.primary}</div>;
    };

    const { rerender } = render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    const initialRenderCount = renderCount;

    // Re-render with same settings
    rerender(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    // Should not cause additional renders due to memoization
    expect(renderCount).toBe(initialRenderCount + 1); // Only the rerender itself
  });

  it('should handle complete branding settings structure', () => {
    const TestComponent = () => {
      const { settings } = useBranding();
      return (
        <div>
          <span data-testid="company-name">{settings.companyName}</span>
          <span data-testid="company-url">{settings.companyUrl}</span>
          <span data-testid="theme-color">{settings.theme.theme_color}</span>
          <span data-testid="extra-light">{settings.theme.extra_light_color}</span>
          <span data-testid="border-color">{settings.theme.button.border_color}</span>
        </div>
      );
    };

    render(
      <BrandingProvider settings={mockBrandingSettings}>
        <TestComponent />
      </BrandingProvider>
    );

    expect(screen.getByTestId('company-name')).toHaveTextContent('Test Company');
    expect(screen.getByTestId('company-url')).toHaveTextContent('https://test.com');
    expect(screen.getByTestId('theme-color')).toHaveTextContent('#ff0000');
    expect(screen.getByTestId('extra-light')).toHaveTextContent('#ffcccc');
    expect(screen.getByTestId('border-color')).toHaveTextContent('#cccccc');
  });
});
