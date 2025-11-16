import React, { Suspense, ComponentType } from 'react';
import { IconDefinition, IconLoaderContext, IconLoadStatus } from './types';
import { IconRegistryManager, defaultIconRegistry } from './registry';
import { importSvg, importTSX, importMUI, IconLoadingSkeleton, IconLoadFailFallback } from './loadables';

export interface IconProviderProps {
  iconName: string;
  size?: string;
  color?: string;
  className?: string;
}

export class IconLoader {
  private registry: IconRegistryManager;
  private cache = new Map<string, ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<ComponentType<any>>>();

  constructor(registry: IconRegistryManager = defaultIconRegistry) {
    this.registry = registry;
  }

  // Get icon definition
  getIconDefinition(name: string): IconDefinition | null {
    return this.registry.get(name);
  }

  // Check if icon is already loaded
  isIconLoaded(name: string): boolean {
    return this.cache.has(name);
  }

  // Load icon dynamically
  async loadIcon(name: string): Promise<ComponentType<any> | null> {
    // Check cache first
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    const definition = this.registry.get(name);
    if (!definition) {
      console.warn(`Icon "${name}" not found in registry`);
      return null;
    }

    // Create loading promise
    const loadPromise = this.createLoadPromise(definition);
    this.loadingPromises.set(name, loadPromise);

    try {
      const IconComponent = await loadPromise;
      this.cache.set(name, IconComponent);
      this.loadingPromises.delete(name);
      return IconComponent;
    } catch (error) {
      console.error(`Failed to load icon "${name}":`, error);
      this.loadingPromises.delete(name);
      return IconLoadFailFallback;
    }
  }

  // Create loading promise based on icon type
  private async createLoadPromise(definition: IconDefinition): Promise<ComponentType<any>> {
    const { importPath, type } = definition;

    try {
      switch (type) {
        case 'svg':
          return importSvg(() => import(importPath));
        case 'tsx':
          return importTSX(() => import(importPath));
        case 'mui':
          return importMUI(() => import(importPath));
        default:
          throw new Error(`Unsupported icon type: ${type}`);
      }
    } catch (error) {
      throw new Error(`Failed to import icon from ${importPath}: ${error}`);
    }
  }

  // Preload icon for better performance
  async preloadIcon(name: string): Promise<void> {
    await this.loadIcon(name);
  }

  // Preload multiple icons
  async preloadIcons(names: string[]): Promise<void> {
    await Promise.all(names.map(name => this.preloadIcon(name)));
  }

  // Get available icons
  getAvailableIcons(category?: string): string[] {
    return this.registry.getIconNames(category as any);
  }

  // Search icons
  searchIcons(query: string): IconDefinition[] {
    return this.registry.search(query);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get cache stats
  getCacheStats(): { cached: number; loading: number; registry: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      registry: Object.keys(this.registry.getAll()).length,
    };
  }
}

// Default icon loader instance
export const defaultIconLoader = new IconLoader();

// Icon Provider component
export function IconProvider({ 
  iconName, 
  size = '24px', 
  color = 'currentColor', 
  className = '' 
}: IconProviderProps) {
  const [IconComponent, setIconComponent] = React.useState<ComponentType<any> | null>(null);
  const [status, setStatus] = React.useState<IconLoadStatus>(IconLoadStatus.IDLE);

  React.useEffect(() => {
    let mounted = true;

    const loadIconComponent = async () => {
      if (!iconName) {
        setStatus(IconLoadStatus.IDLE);
        setIconComponent(null);
        return;
      }

      // Check if already loaded
      if (defaultIconLoader.isIconLoaded(iconName)) {
        const cachedIcon = await defaultIconLoader.loadIcon(iconName);
        if (mounted) {
          setIconComponent(() => cachedIcon);
          setStatus(IconLoadStatus.CACHED);
        }
        return;
      }

      setStatus(IconLoadStatus.LOADING);

      try {
        const loadedIcon = await defaultIconLoader.loadIcon(iconName);
        if (mounted) {
          setIconComponent(() => loadedIcon);
          setStatus(IconLoadStatus.LOADED);
        }
      } catch (error) {
        console.error(`Failed to load icon "${iconName}":`, error);
        if (mounted) {
          setIconComponent(() => IconLoadFailFallback);
          setStatus(IconLoadStatus.ERROR);
        }
      }
    };

    loadIconComponent();

    return () => {
      mounted = false;
    };
  }, [iconName]);

  // Show loading skeleton while loading
  if (status === IconLoadStatus.LOADING || status === IconLoadStatus.IDLE) {
    return <IconLoadingSkeleton size={size} className={className} color={color} />;
  }

  // Show fallback on error or if no icon component
  if (!IconComponent || status === IconLoadStatus.ERROR) {
    return <IconLoadFailFallback size={size} className={className} color={color} />;
  }

  // Render the loaded icon
  return (
    <Suspense fallback={<IconLoadingSkeleton size={size} className={className} color={color} />}>
      <IconComponent 
        className={className}
        width={size}
        height={size}
        fill={color}
        style={{ color }}
      />
    </Suspense>
  );
}

// React Context for icon loader
export const IconLoaderReactContext = React.createContext<IconLoaderContext>({
  registry: defaultIconRegistry.getAll(),
  loadIcon: defaultIconLoader.loadIcon.bind(defaultIconLoader),
  preloadIcon: defaultIconLoader.preloadIcon.bind(defaultIconLoader),
  isIconLoaded: defaultIconLoader.isIconLoaded.bind(defaultIconLoader),
  getAvailableIcons: defaultIconLoader.getAvailableIcons.bind(defaultIconLoader),
});

// Hook to use icon loader context
export function useIconLoader(): IconLoaderContext {
  return React.useContext(IconLoaderReactContext);
}

// Icon Loader Provider component
export interface IconLoaderProviderProps {
  children: React.ReactNode;
  loader?: IconLoader;
  preloadIcons?: string[];
}

export function IconLoaderProvider({ 
  children, 
  loader = defaultIconLoader,
  preloadIcons = [] 
}: IconLoaderProviderProps) {
  // Preload icons on mount
  React.useEffect(() => {
    if (preloadIcons.length > 0) {
      loader.preloadIcons(preloadIcons).catch(error => {
        console.warn('Failed to preload some icons:', error);
      });
    }
  }, [loader, preloadIcons]);

  const contextValue: IconLoaderContext = React.useMemo(() => ({
    registry: (loader as any).registry?.getAll?.() || {},
    loadIcon: loader.loadIcon.bind(loader),
    preloadIcon: loader.preloadIcon.bind(loader),
    isIconLoaded: loader.isIconLoaded.bind(loader),
    getAvailableIcons: loader.getAvailableIcons.bind(loader),
  }), [loader]);

  return (
    <IconLoaderReactContext.Provider value={contextValue}>
      {children}
    </IconLoaderReactContext.Provider>
  );
}
