import { useState, useEffect, useRef, useCallback, startTransition } from 'react';

/**
 * Modern debounced state hook with React 19 patterns
 * Uses startTransition for smooth updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void, boolean] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    setIsPending(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value);
        setIsPending(false);
      });
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [immediateValue, debouncedValue, setValue, isPending];
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): [T, boolean] {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      setIsPending(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        startTransition(() => {
          callbackRef.current(...args);
          setIsPending(false);
        });
      }, delay);
    }) as T,
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, isPending];
}

/**
 * Debounced effect hook
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | void | undefined>(undefined);

  useEffect(() => {
    // Clear existing timeout and cleanup
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        cleanupRef.current = effect();
      });
    }, delay);

    // Cleanup on unmount or deps change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [...deps, delay]); // eslint-disable-line react-hooks/exhaustive-deps
}
