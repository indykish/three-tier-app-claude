import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrandingProvider } from '@/context/BrandingProvider';
import { CustomThemeProvider } from '@/context/ThemeProvider';
import { BrandingSettings, DEFAULT_BRANDING } from '@/types/branding';

// Test theme for consistent testing
const testTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  brandingSettings?: BrandingSettings;
  withBranding?: boolean;
  withTheme?: boolean;
}

// Custom render function with providers
function customRender(
  ui: ReactElement,
  {
    brandingSettings = DEFAULT_BRANDING,
    withBranding = false,
    withTheme = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrappedChildren = children;

    if (withTheme) {
      wrappedChildren = (
        <CustomThemeProvider brandingSettings={brandingSettings}>
          <CssBaseline />
          {wrappedChildren}
        </CustomThemeProvider>
      );
    } else {
      wrappedChildren = (
        <ThemeProvider theme={testTheme}>
          <CssBaseline />
          {wrappedChildren}
        </ThemeProvider>
      );
    }

    if (withBranding) {
      wrappedChildren = (
        <BrandingProvider settings={brandingSettings}>
          {wrappedChildren}
        </BrandingProvider>
      );
    }

    return <>{wrappedChildren}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock branding settings for testing
export const mockBrandingSettings: BrandingSettings = {
  id: 'test-id',
  organizationId: 'test-org',
  companyName: 'Test Company',
  companyUrl: 'https://test.com',
  theme: {
    theme_color: '#ff0000',
    primary_dark_color: '#cc0000',
    extra_light_color: '#ffcccc',
    text_color: '#333333',
    font_family: 'Arial, sans-serif',
    button: {
      primary_color: '#ff0000',
      secondary_color: '#00ff00',
      hover_color: '#cc0000',
      border_color: '#cccccc',
    },
    logos: {
      websiteLogo: 'test-light-logo.png',
      websiteLogoHeight: '40px',
      favIcon: 'test-favicon.ico',
    },
  },
  capabilities: {
    general_app_title: 'Test Bank',
  },
};

// Mock functions for testing
export const mockFunctions = {
  onComplete: jest.fn(),
  onResetBranding: jest.fn(),
  onSettingsChange: jest.fn(),
  onChange: jest.fn(),
  onSecondaryColorChange: jest.fn(),
  onClick: jest.fn(),
  onClose: jest.fn(),
  onOpen: jest.fn(),
  onSubmit: jest.fn(),
  onLogoChange: jest.fn(),
  onError: jest.fn(),
  onFontChange: jest.fn(),
  onFileChange: jest.fn(),
};

// Mock DOM APIs
export const mockDOM = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  createElement: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  querySelector: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Helper to wait for async operations
export const waitForAsync = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Helper to trigger events
export const triggerEvent = (element: Element, eventType: string) => {
  const event = new Event(eventType, { bubbles: true });
  element.dispatchEvent(event);
};

// Mock file for file upload tests
export const mockFile = new File(['test content'], 'test.png', {
  type: 'image/png',
});

// Mock component for testing higher-order components
export const MockComponent: React.FC<{ testProp?: string }> = ({ testProp }) => (
  <div data-testid="mock-component">{testProp || 'Mock Component'}</div>
);

// Export everything needed for tests
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';

// Simple test to verify test utils work
describe('test-utils', () => {
  it('should export mockBrandingSettings', () => {
    expect(mockBrandingSettings).toBeDefined();
    expect(mockBrandingSettings.companyName).toBe('Test Company');
  });

  it('should export mockFunctions', () => {
    expect(mockFunctions.onComplete).toBeDefined();
    expect(typeof mockFunctions.onComplete).toBe('function');
  });

  it('should export MockComponent', () => {
    expect(MockComponent).toBeDefined();
    expect(typeof MockComponent).toBe('function');
  });
});
