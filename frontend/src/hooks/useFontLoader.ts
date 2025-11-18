import { useState, useEffect, useCallback, startTransition } from 'react';
import { useCSSLoader, CSSStatus } from './useCSSLoader';

export enum FontStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

interface FontLoadOptions {
  weights?: string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
}

interface FontLoadResult {
  status: FontStatus;
  error?: string;
  retry: () => void;
}

// Cache for loaded fonts to avoid duplicate requests
const fontCache = new Map<string, FontStatus>();
const fontPromises = new Map<string, Promise<void>>();

/**
 * Modern font loading hook optimized for React 19 patterns
 * Uses concurrent features and efficient caching
 */
export function useFontLoader(
  fontFamily: string,
  options: FontLoadOptions = {}
): FontLoadResult {
  const { weights = ['400', '500', '600'], display = 'swap', preload = true } = options;
  const [status, setStatus] = useState<FontStatus>(FontStatus.IDLE);
  const [error, setError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);

  // Extract font name for processing
  const fontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  const cacheKey = `${fontName}-${weights.join(',')}`;

  // Debug logging
  console.log('useFontLoader - Processing font:', fontName, 'from:', fontFamily);

  // Check if it's a system font (no loading needed)
  const isSystemFont = ['Arial', 'Helvetica', 'Georgia', 'Times', 'sans-serif', 'serif'].includes(fontName);
  
  console.log('useFontLoader - Is system font:', isSystemFont, 'for:', fontName);

  // Construct Google Fonts URL
  const fontUrl = isSystemFont ? '' : 
    `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weights.join(';')}&display=${display}`;

  console.log('useFontLoader - Generated font URL:', fontUrl);
  
  // Also load a preconnect for faster loading
  useEffect(() => {
    if (!isSystemFont && fontUrl) {
      // Add preconnect for better performance
      const preconnect1 = document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]');
      if (!preconnect1) {
        const link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link1);
      }

      const preconnect2 = document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]');
      if (!preconnect2) {
        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';
        document.head.appendChild(link2);
      }
    }
  }, [isSystemFont, fontUrl]);

  // Use CSS loader for Google Fonts
  const cssStatus = useCSSLoader(fontUrl && !isSystemFont ? fontUrl : '');

  console.log('useFontLoader - CSS status:', cssStatus, 'for:', fontName);

  // Load fonts using Font Face API for better control
  const loadFontsWithAPI = useCallback(async (): Promise<void> => {
    if (!('fonts' in document) || isSystemFont) return;

    const fontPromises = weights.map(async (weight) => {
      try {
        // Use a sample character to test if font loads
        const fontFace = new FontFace(
          fontName,
          `local("${fontName}"), url(https://fonts.gstatic.com/...)`,
          { weight, display }
        );

        await fontFace.load();
        document.fonts.add(fontFace);
        return true;
      } catch {
        // Individual font weight failed, but don't fail the whole family
        return false;
      }
    });

    // Wait for at least one weight to load successfully
    const results = await Promise.allSettled(fontPromises);
    const hasAnySuccess = results.some(result => 
      result.status === 'fulfilled' && result.value === true
    );

    if (!hasAnySuccess) {
      throw new Error(`Failed to load any weights for font: ${fontName}`);
    }
  }, [fontName, weights, display, isSystemFont]);

  // Retry mechanism
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    startTransition(() => {
      setStatus(FontStatus.LOADING);
      setError(undefined);
    });
  }, []);

  // Main effect for font loading logic
  useEffect(() => {
    if (isSystemFont) {
      startTransition(() => {
        setStatus(FontStatus.READY);
      });
      return;
    }

    // Check cache first
    const cachedStatus = fontCache.get(cacheKey);
    if (cachedStatus === FontStatus.READY) {
      startTransition(() => {
        setStatus(FontStatus.READY);
      });
      return;
    }

    // Check if already loading
    const existingPromise = fontPromises.get(cacheKey);
    if (existingPromise) {
      existingPromise
        .then(() => {
          startTransition(() => {
            setStatus(FontStatus.READY);
            fontCache.set(cacheKey, FontStatus.READY);
          });
        })
        .catch((err) => {
          startTransition(() => {
            setStatus(FontStatus.ERROR);
            setError(err.message);
          });
        });
      return;
    }

    // Start loading
    startTransition(() => {
      setStatus(FontStatus.LOADING);
      fontCache.set(cacheKey, FontStatus.LOADING);
    });

    // Create loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      // Wait for CSS to load first
      const checkCSSStatus = () => {
        if (cssStatus === CSSStatus.READY) {
          // CSS loaded, now load fonts with API
          loadFontsWithAPI()
            .then(resolve)
            .catch(reject);
        } else if (cssStatus === CSSStatus.ERROR) {
          reject(new Error('Failed to load font CSS'));
        } else {
          // Still loading, check again
          setTimeout(checkCSSStatus, 100);
        }
      };

      checkCSSStatus();

      // Timeout fallback
      setTimeout(() => {
        resolve(); // Don't reject, just continue with fallback
      }, 5000);
    });

    // Cache the promise
    fontPromises.set(cacheKey, loadPromise);

    // Handle promise result
    loadPromise
      .then(() => {
        startTransition(() => {
          setStatus(FontStatus.READY);
          fontCache.set(cacheKey, FontStatus.READY);
        });
      })
      .catch((err) => {
        startTransition(() => {
          setStatus(FontStatus.ERROR);
          setError(err.message);
          fontCache.set(cacheKey, FontStatus.ERROR);
        });
        console.warn('Font loading failed:', err);
      });

  }, [fontName, cacheKey, cssStatus, loadFontsWithAPI, isSystemFont, retryCount]);

  // Preload font if requested
  useEffect(() => {
    if (preload && fontUrl && status === FontStatus.READY) {
      // Add preload link for better performance
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = fontUrl;
      document.head.appendChild(preloadLink);

      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [fontUrl, preload, status]);

  return { status, error, retry };
}