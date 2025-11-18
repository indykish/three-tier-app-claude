import { useState, useEffect } from 'react';

export enum CSSStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

/**
 * Hook for loading CSS files (like Google Fonts)
 * Specifically designed for CSS, not JavaScript
 */
export function useCSSLoader(href: string): CSSStatus {
  const [status, setStatus] = useState<CSSStatus>(
    href ? CSSStatus.LOADING : CSSStatus.IDLE
  );

  useEffect(() => {
    if (!href) {
      setStatus(CSSStatus.IDLE);
      return;
    }

    // Check if CSS is already loaded
    let link = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;

    if (!link) {
      // Create new link element
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-status', CSSStatus.LOADING);

      // Add to head
      document.head.appendChild(link);

      // Set up event handlers for the new link
      const handleLoad = () => {
        link.setAttribute('data-status', CSSStatus.READY);
        setStatus(CSSStatus.READY);
      };

      const handleError = () => {
        link.setAttribute('data-status', CSSStatus.ERROR);
        setStatus(CSSStatus.ERROR);
      };

      link.addEventListener('load', handleLoad);
      link.addEventListener('error', handleError);

      // Cleanup function
      return () => {
        link.removeEventListener('load', handleLoad);
        link.removeEventListener('error', handleError);
      };
    } else {
      // Link already exists, check its status
      const existingStatus = link.getAttribute('data-status') as CSSStatus;
      if (existingStatus) {
        setStatus(existingStatus);
      } else {
        // If no status attribute, assume it's ready
        setStatus(CSSStatus.READY);
      }
    }
  }, [href]);

  return status;
}
