import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { IconLoader, IconProvider, IconLoaderProvider, useIconLoader } from '@/utils/iconloader/IconProvider';
import { IconRegistryManager } from '@/utils/iconloader/registry';
import { IconDefinition, IconLoadStatus } from '@/utils/iconloader/types';

// Mock loadables
jest.mock('@/utils/iconloader/loadables', () => ({
  importSvg: jest.fn(),
  importTSX: jest.fn(),
  importMUI: jest.fn(),
  IconLoadingSkeleton: ({ size, className, color }: any) => (
    <div data-testid="loading-skeleton" data-size={size} className={className} style={{ color }}>
      Loading...
    </div>
  ),
  IconLoadFailFallback: ({ size, className, color }: any) => (
    <div data-testid="fail-fallback" data-size={size} className={className} style={{ color }}>
      Failed to load
    </div>
  ),
}));

const mockIconDefinition: IconDefinition = {
  name: 'test-icon',
  category: 'actions',
  importPath: '@/icons/test-icon',
  type: 'tsx',
  keywords: ['test'],
};

const MockIconComponent = ({ className, width, height, fill, style }: any) => (
  <svg
    data-testid="mock-icon"
    className={className}
    width={width}
    height={height}
    fill={fill}
    style={style}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe('IconLoader', () => {
  let iconLoader: IconLoader;
  let mockRegistry: IconRegistryManager;

  beforeEach(() => {
    mockRegistry = new IconRegistryManager({});
    iconLoader = new IconLoader(mockRegistry);
    
    // Clear console mocks
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getIconDefinition', () => {
    it('should return icon definition when it exists', () => {
      mockRegistry.register(mockIconDefinition);
      
      const result = iconLoader.getIconDefinition('test-icon');
      expect(result).toEqual(mockIconDefinition);
    });

    it('should return null when icon does not exist', () => {
      const result = iconLoader.getIconDefinition('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('isIconLoaded', () => {
    it('should return false for unloaded icon', () => {
      expect(iconLoader.isIconLoaded('test-icon')).toBe(false);
    });

    it('should return true for loaded icon', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      await iconLoader.loadIcon('test-icon');
      expect(iconLoader.isIconLoaded('test-icon')).toBe(true);
    });
  });

  describe('loadIcon', () => {
    it('should load TSX icon successfully', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      const result = await iconLoader.loadIcon('test-icon');
      expect(result).toBe(MockIconComponent);
      expect(importTSX).toHaveBeenCalled();
    });

    it('should load SVG icon successfully', async () => {
      const svgDefinition = { ...mockIconDefinition, type: 'svg' };
      mockRegistry.register(svgDefinition);
      const { importSvg } = require('@/utils/iconloader/loadables');
      importSvg.mockResolvedValue(MockIconComponent);

      const result = await iconLoader.loadIcon('test-icon');
      expect(result).toBe(MockIconComponent);
      expect(importSvg).toHaveBeenCalled();
    });

    it('should load MUI icon successfully', async () => {
      const muiDefinition = { ...mockIconDefinition, type: 'mui' };
      mockRegistry.register(muiDefinition);
      const { importMUI } = require('@/utils/iconloader/loadables');
      importMUI.mockResolvedValue(MockIconComponent);

      const result = await iconLoader.loadIcon('test-icon');
      expect(result).toBe(MockIconComponent);
      expect(importMUI).toHaveBeenCalled();
    });

    it('should return null for non-existent icon', async () => {
      const result = await iconLoader.loadIcon('non-existent');
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Icon "non-existent" not found in registry');
    });

    it('should return cached icon on subsequent calls', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      // Clear any previous calls
      importTSX.mockClear();

      const result1 = await iconLoader.loadIcon('test-icon');
      const result2 = await iconLoader.loadIcon('test-icon');
      
      expect(result1).toBe(result2);
      expect(importTSX).toHaveBeenCalledTimes(1);
    });

    it('should handle loading errors gracefully', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX, IconLoadFailFallback } = require('@/utils/iconloader/loadables');
      importTSX.mockRejectedValue(new Error('Loading failed'));

      const result = await iconLoader.loadIcon('test-icon');
      expect(result).toBe(IconLoadFailFallback);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load icon "test-icon":',
        expect.any(Error)
      );
    });

    it('should handle unsupported icon type', async () => {
      const invalidDefinition = { ...mockIconDefinition, type: 'invalid' as any };
      mockRegistry.register(invalidDefinition);

      const result = await iconLoader.loadIcon('test-icon');
      expect(result).toBeDefined(); // Should return fallback
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('preloadIcon', () => {
    it('should preload icon', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      await iconLoader.preloadIcon('test-icon');
      expect(iconLoader.isIconLoaded('test-icon')).toBe(true);
    });
  });

  describe('preloadIcons', () => {
    it('should preload multiple icons', async () => {
      const icon2 = { ...mockIconDefinition, name: 'test-icon-2' };
      mockRegistry.register(mockIconDefinition);
      mockRegistry.register(icon2);
      
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      await iconLoader.preloadIcons(['test-icon', 'test-icon-2']);
      
      expect(iconLoader.isIconLoaded('test-icon')).toBe(true);
      expect(iconLoader.isIconLoaded('test-icon-2')).toBe(true);
    });
  });

  describe('getAvailableIcons', () => {
    it('should return available icon names', () => {
      mockRegistry.register(mockIconDefinition);
      
      const result = iconLoader.getAvailableIcons();
      expect(result).toContain('test-icon');
    });

    it('should filter by category', () => {
      mockRegistry.register(mockIconDefinition);
      
      const result = iconLoader.getAvailableIcons('actions');
      expect(result).toContain('test-icon');
    });
  });

  describe('searchIcons', () => {
    it('should search icons by query', () => {
      mockRegistry.register(mockIconDefinition);
      
      const result = iconLoader.searchIcons('test');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockIconDefinition);
    });
  });

  describe('clearCache', () => {
    it('should clear cache and loading promises', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      await iconLoader.loadIcon('test-icon');
      expect(iconLoader.isIconLoaded('test-icon')).toBe(true);

      iconLoader.clearCache();
      expect(iconLoader.isIconLoaded('test-icon')).toBe(false);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      mockRegistry.register(mockIconDefinition);
      const { importTSX } = require('@/utils/iconloader/loadables');
      importTSX.mockResolvedValue(MockIconComponent);

      await iconLoader.loadIcon('test-icon');
      
      const stats = iconLoader.getCacheStats();
      expect(stats.cached).toBe(1);
      expect(stats.loading).toBe(0);
      expect(stats.registry).toBe(1);
    });
  });
});

describe('IconProvider', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render loading skeleton initially', () => {
    render(<IconProvider iconName="" />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render loading skeleton when icon name provided', () => {
    render(<IconProvider iconName="test-icon" />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should apply size and color props to skeleton', () => {
    render(<IconProvider iconName="" size="32px" color="#ff0000" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveAttribute('data-size', '32px');
    expect(skeleton).toHaveStyle({ color: '#ff0000' });
  });

  it('should apply className prop', () => {
    render(<IconProvider iconName="" className="custom-class" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should render fallback on icon load failure', async () => {
    // Mock a failing icon load
    const mockLoader = {
      isIconLoaded: jest.fn().mockReturnValue(false),
      loadIcon: jest.fn().mockRejectedValue(new Error('Load failed')),
    };
    
    // Replace the default loader temporarily
    const originalLoader = require('@/utils/iconloader/IconProvider').defaultIconLoader;
    require('@/utils/iconloader/IconProvider').defaultIconLoader = mockLoader;

    render(<IconProvider iconName="failing-icon" />);

    await waitFor(() => {
      expect(screen.getByTestId('fail-fallback')).toBeInTheDocument();
    });

    // Restore
    require('@/utils/iconloader/IconProvider').defaultIconLoader = originalLoader;
  });
});

describe('IconLoaderProvider', () => {
  it('should render children', () => {
    render(
      <IconLoaderProvider>
        <div data-testid="child">Test child</div>
      </IconLoaderProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide icon loader context', () => {
    const TestComponent = () => {
      const context = useIconLoader();
      return <div data-testid="context">{typeof context.loadIcon}</div>;
    };

    render(
      <IconLoaderProvider>
        <TestComponent />
      </IconLoaderProvider>
    );

    expect(screen.getByTestId('context')).toHaveTextContent('function');
  });

  it('should preload icons on mount', async () => {
    const mockLoader = {
      preloadIcons: jest.fn().mockResolvedValue(undefined),
      isIconLoaded: jest.fn(),
      loadIcon: jest.fn(),
      preloadIcon: jest.fn(),
      getAvailableIcons: jest.fn().mockReturnValue([]),
    };

    render(
      <IconLoaderProvider loader={mockLoader as any} preloadIcons={['icon1', 'icon2']}>
        <div>Test</div>
      </IconLoaderProvider>
    );

    await waitFor(() => {
      expect(mockLoader.preloadIcons).toHaveBeenCalledWith(['icon1', 'icon2']);
    });
  });

  it('should handle preload errors gracefully', async () => {
    console.warn = jest.fn();
    
    const mockLoader = {
      preloadIcons: jest.fn().mockRejectedValue(new Error('Preload failed')),
      isIconLoaded: jest.fn(),
      loadIcon: jest.fn(),
      preloadIcon: jest.fn(),
      getAvailableIcons: jest.fn().mockReturnValue([]),
    };

    render(
      <IconLoaderProvider loader={mockLoader as any} preloadIcons={['icon1']}>
        <div>Test</div>
      </IconLoaderProvider>
    );

    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith('Failed to preload some icons:', expect.any(Error));
    });
  });
});

describe('useIconLoader', () => {
  it('should return icon loader context', () => {
    const TestComponent = () => {
      const context = useIconLoader();
      return (
        <div>
          <div data-testid="registry">{typeof context.registry}</div>
          <div data-testid="loadIcon">{typeof context.loadIcon}</div>
          <div data-testid="preloadIcon">{typeof context.preloadIcon}</div>
          <div data-testid="isIconLoaded">{typeof context.isIconLoaded}</div>
          <div data-testid="getAvailableIcons">{typeof context.getAvailableIcons}</div>
        </div>
      );
    };

    render(
      <IconLoaderProvider>
        <TestComponent />
      </IconLoaderProvider>
    );

    expect(screen.getByTestId('registry')).toHaveTextContent('object');
    expect(screen.getByTestId('loadIcon')).toHaveTextContent('function');
    expect(screen.getByTestId('preloadIcon')).toHaveTextContent('function');
    expect(screen.getByTestId('isIconLoaded')).toHaveTextContent('function');
    expect(screen.getByTestId('getAvailableIcons')).toHaveTextContent('function');
  });
});