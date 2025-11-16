import React, { Suspense, ComponentType } from 'react';
import { BaseIconProps, SVGIconComponent, TSXIconComponent, MUIIconComponent } from './types';

const logger = 'branding:iconloader:loadables';

// Fallback component for failed icon loads
function IconLoadFailFallback(props: BaseIconProps) {
  const { size = '24px', color = 'currentColor', className = '', ...rest } = props;
  
  return (
    <svg
      role="img"
      className={className}
      width={props.width || size}
      height={props.height || size}
      viewBox="0 0 24 24"
      fill={color}
      {...rest}
    >
      {/* Generic fallback icon - a simple circle with question mark */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <text 
        x="12" 
        y="16" 
        textAnchor="middle" 
        fontSize="12" 
        fill={color}
      >
        ?
      </text>
    </svg>
  );
}

// Loading skeleton for icons
function IconLoadingSkeleton(props: BaseIconProps) {
  const { size = '24px', className = '', ...rest } = props;
  
  return (
    <div
      role="presentation"
      className={`icon-loading-skeleton ${className}`}
      style={{
        width: props.width || size,
        height: props.height || size,
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...rest
      }}
    />
  );
}

// Generic icon implementation with error boundaries
function createIconImpl<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyIcon = React.lazy(importFn);

  return function LoadableIcon(props: any) {
    return (
      <Suspense fallback={<IconLoadingSkeleton {...props} />}>
        <LazyIcon {...props} />
      </Suspense>
    );
  };
}

// Import SVG icons (using webpack's ReactComponent)
export function importSvg(
  importFn: () => Promise<{ ReactComponent: SVGIconComponent }>
): SVGIconComponent {
  return createIconImpl(
    async () => {
      try {
        const module = await importFn();
        if (module?.ReactComponent) {
          return { default: module.ReactComponent };
        }
        throw new Error(`${logger}: SVG module does not have ReactComponent export`);
      } catch (error) {
        console.warn(`${logger}: Failed to load SVG icon:`, error);
        return { default: IconLoadFailFallback };
      }
    }
  );
}

// Import TypeScript/JSX icons
export function importTSX(
  importFn: () => Promise<{ default: TSXIconComponent }>
): TSXIconComponent {
  return createIconImpl(
    async () => {
      try {
        const module = await importFn();
        if (module?.default) {
          return { default: module.default };
        }
        throw new Error(`${logger}: TSX module does not have default export`);
      } catch (error) {
        console.warn(`${logger}: Failed to load TSX icon:`, error);
        return { default: IconLoadFailFallback };
      }
    }
  );
}

// Import Material-UI icons
export function importMUI(
  importFn: () => Promise<{ default: MUIIconComponent }>
): MUIIconComponent {
  return createIconImpl(
    async () => {
      try {
        const module = await importFn();
        if (module?.default) {
          return { default: module.default };
        }
        throw new Error(`${logger}: MUI module does not have default export`);
      } catch (error) {
        console.warn(`${logger}: Failed to load MUI icon:`, error);
        return { default: IconLoadFailFallback };
      }
    }
  );
}

// Import icon from URL (for remote icons)
export function importFromUrl(
  url: string,
  type: 'svg' | 'image' = 'svg'
): ComponentType<BaseIconProps> {
  return function UrlIcon(props: BaseIconProps) {
    const { size = '24px', className = '', color, ...rest } = props;

    if (type === 'image') {
      return (
        <img
          src={url}
          alt="icon"
          className={className}
          width={props.width || size}
          height={props.height || size}
          style={{ color }}
          {...rest}
        />
      );
    }

    // For SVG URLs, use object or embed
    return (
      <object
        data={url}
        type="image/svg+xml"
        className={className}
        width={props.width || size}
        height={props.height || size}
        style={{ color }}
        {...rest}
      >
        <IconLoadFailFallback {...props} />
      </object>
    );
  };
}

// Create a lazy-loaded icon with retry mechanism
export function createRetryableIcon<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3
): ComponentType<any> {
  const retryableImport = async (): Promise<{ default: T }> => {
    let retryCount = 0;
    
    const attemptImport = async (): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`${logger}: Retrying icon load (${retryCount}/${maxRetries})`);
          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
          return attemptImport();
        }
        throw error;
      }
    };
    
    return attemptImport();
  };

  return createIconImpl(retryableImport);
}

// Batch load multiple icons
export function createBatchLoader(
  icons: Record<string, () => Promise<{ default: ComponentType<any> }>>
): Record<string, ComponentType<any>> {
  const loadedIcons: Record<string, ComponentType<any>> = {};

  Object.entries(icons).forEach(([name, importFn]) => {
    loadedIcons[name] = createIconImpl(importFn);
  });

  return loadedIcons;
}

// Preload icon for better performance
export function preloadIcon(importFn: () => Promise<any>): Promise<void> {
  return importFn()
    .then(() => {
      console.log(`${logger}: Icon preloaded successfully`);
    })
    .catch((error) => {
      console.warn(`${logger}: Failed to preload icon:`, error);
    });
}

export {
  IconLoadFailFallback,
  IconLoadingSkeleton,
  createIconImpl,
};
