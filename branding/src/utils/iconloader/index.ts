// Main exports for the icon loader system
export { Icon as default, Icon } from './Icon';
export { IconProvider, IconLoader, IconLoaderProvider, useIconLoader, defaultIconLoader } from './IconProvider';
export { 
  importSvg, 
  importTSX, 
  importMUI, 
  importFromUrl,
  createRetryableIcon,
  createBatchLoader,
  preloadIcon,
  IconLoadFailFallback,
  IconLoadingSkeleton 
} from './loadables';
export { 
  IconRegistryManager, 
  defaultIconRegistry, 
  DEFAULT_ICON_REGISTRY 
} from './registry';
export * from './types';

// Re-export for convenience
export type { IconProps, IconDefinition, IconRegistry, IconCategory } from './types';
