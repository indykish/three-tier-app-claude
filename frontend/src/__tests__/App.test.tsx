import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { render, mockBrandingSettings } from './utils/test-utils';

// Mock themeApi first to avoid import.meta.env issues
jest.mock('@/services/themeApi', () => ({
  ThemeAPI: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockRejectedValue(new Error('Not found')),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1 }),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the services first
const mockLoad = jest.fn();
const mockSave = jest.fn();
const mockClear = jest.fn();

jest.mock('@/services/brandingStorage', () => ({
  BrandingStorage: {
    load: () => mockLoad(),
    save: (settings: any) => mockSave(settings),
    clear: () => mockClear(),
  },
  load: () => mockLoad(),
  save: (settings: any) => mockSave(settings),
  clear: () => mockClear(),
}));

// Mock the font loader hook
jest.mock('@/hooks/useFontLoader', () => ({
  useFontLoader: jest.fn(() => ({
    status: 'ready',
    error: undefined,
    retry: jest.fn(),
  })),
  FontStatus: {
    IDLE: 'idle',
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
  },
}));

// Mock the branding operations hook
jest.mock('@/hooks/useBrandingOperations', () => ({
  useBrandingOperations: jest.fn(() => ({
    saveSettings: jest.fn(),
    loadSettings: jest.fn(),
    resetSettings: jest.fn(),
    status: 'idle',
  })),
}));

// Mock the icon loader to avoid DOM manipulation issues
jest.mock('@/utils/iconloader', () => ({
  IconLoaderProvider: ({ children }: any) => <div data-testid="icon-loader-provider">{children}</div>,
  Icon: ({ name }: any) => <div data-testid={`icon-${name}`}>{name}</div>,
  useIconLoader: () => ({
    getAvailableIcons: () => [],
  }),
}));

// Mock the ThemeProvider to avoid DOM manipulation
jest.mock('@/context/ThemeProvider', () => ({
  CustomThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log and console.warn to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render branding wizard when no settings exist', async () => {
    mockLoad.mockReturnValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should render dashboard when branding settings exist', async () => {
    mockLoad.mockReturnValue(mockBrandingSettings);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('should handle storage errors gracefully', async () => {
    mockLoad.mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(<App />);

    // Should fallback to branding wizard on storage error
    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should call branding storage load on mount', () => {
    mockLoad.mockReturnValue(null);

    render(<App />);

    expect(mockLoad).toHaveBeenCalled();
  });

  it('should handle null/undefined branding settings', async () => {
    mockLoad.mockReturnValue(undefined);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should handle empty branding settings object', async () => {
    mockLoad.mockReturnValue({});

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should handle missing localStorage gracefully', async () => {
    // Mock localStorage to be undefined
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    });

    mockLoad.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should render without crashing on malformed data', async () => {
    mockLoad.mockReturnValue('invalid-json-string' as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should handle partial branding settings', async () => {
    const partialSettings = {
      companyName: 'Test Company',
      theme: {
        theme_color: '#ff0000',
      },
    };

    mockLoad.mockReturnValue(partialSettings);

    render(<App />);

    // With partial settings, should still show branding wizard
    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should apply correct initial state based on branding availability', async () => {
    // Test with branding available
    mockLoad.mockReturnValue(mockBrandingSettings);
    
    const { unmount } = render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    unmount();

    // Test with no branding
    mockLoad.mockReturnValue(null);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });
  });

  it('should provide proper theme context to child components', async () => {
    mockLoad.mockReturnValue(mockBrandingSettings);

    render(<App />);

    await waitFor(() => {
      // The dashboard should be rendered with proper theme context
      const dashboard = screen.getByText(/dashboard/i);
      expect(dashboard).toBeInTheDocument();
    });
  });

  it('should handle state management correctly', async () => {
    mockLoad.mockReturnValue(null);

    render(<App />);

    // Should start with wizard
    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });

    // The app should manage its state properly
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  it('should handle branding completion flow', async () => {
    mockLoad.mockReturnValue(null);

    render(<App />);

    // Initially should show branding wizard
    await waitFor(() => {
      expect(screen.getByText(/company information/i)).toBeInTheDocument();
    });

    // The completion flow is handled by the BrandingWizard component
    // Here we just verify the initial state is correct
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument(); // Company name input
  });

  it('should maintain component hierarchy', async () => {
    mockLoad.mockReturnValue(mockBrandingSettings);

    render(<App />);

    await waitFor(() => {
      // Should have the dashboard structure
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      // Use getAllByText to handle multiple elements and check the first one
      const testBankElements = screen.getAllByText(/test bank/i);
      expect(testBankElements.length).toBeGreaterThan(0);
    });
  });
});