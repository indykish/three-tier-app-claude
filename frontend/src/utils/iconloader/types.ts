import { SvgIconProps } from '@mui/material/SvgIcon';

// Base icon types
export interface BaseIconProps {
  className?: string;
  color?: string;
  size?: string;
  width?: string | number;
  height?: string | number;
  fill?: string;
}

// Standard icon sizes
export type IconSizes = 'sm' | 'md' | 'lg' | 'xl';

// Icon variants
export type IconVariant = 'outlined' | 'filled' | 'rounded' | 'sharp';

// Icon category
export type IconCategory = 
  | 'business' 
  | 'navigation' 
  | 'actions' 
  | 'alerts' 
  | 'content' 
  | 'menu'
  | 'social'
  | 'file'
  | 'editor';

// Icon props for the main Icon component
export interface IconProps extends BaseIconProps {
  name: string;
  size?: IconSizes | string;
  variant?: IconVariant;
  category?: IconCategory;
}

// Icon definition for the loader
export interface IconDefinition {
  name: string;
  category: IconCategory;
  importPath: string;
  type: 'svg' | 'tsx' | 'mui';
  keywords?: string[];
  deprecated?: boolean;
}

// Icon registry for managing available icons
export interface IconRegistry {
  [iconName: string]: IconDefinition;
}

// Icon loader context
export interface IconLoaderContext {
  registry: IconRegistry;
  loadIcon: (name: string) => Promise<React.ComponentType<any> | null>;
  preloadIcon: (name: string) => Promise<void>;
  isIconLoaded: (name: string) => boolean;
  getAvailableIcons: (category?: IconCategory) => string[];
}

// Icon component types
export type SVGIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
export type TSXIconComponent = React.ComponentType<BaseIconProps>;
export type MUIIconComponent = React.ComponentType<SvgIconProps>;

// Icon loader status
export enum IconLoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  CACHED = 'cached'
}

// Icon configuration
export interface IconConfig {
  baseUrl?: string;
  cacheTTL?: number;
  preloadIcons?: string[];
  fallbackIcon?: string;
  enableCache?: boolean;
  logErrors?: boolean;
}

// Icon size mapping
export const ICON_SIZES: Record<IconSizes, string> = {
  sm: '16px',
  md: '20px', 
  lg: '24px',
  xl: '32px'
};

// Default icon configuration
export const DEFAULT_ICON_CONFIG: IconConfig = {
  baseUrl: '',
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  preloadIcons: [],
  fallbackIcon: 'error',
  enableCache: true,
  logErrors: true
};
