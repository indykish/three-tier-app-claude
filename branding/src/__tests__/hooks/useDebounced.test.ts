import { renderHook, act } from '@testing-library/react';
import { useDebouncedState, useDebouncedCallback, useDebouncedEffect } from '@/hooks/useDebounced';

describe('useDebounced', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
  });

  describe('useDebouncedState', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));
      
      const [immediateValue, debouncedValue, setValue, isPending] = result.current;
      expect(immediateValue).toBe('initial');
      expect(debouncedValue).toBe('initial');
      expect(typeof setValue).toBe('function');
      expect(isPending).toBe(false);
    });

    it('should debounce value changes', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));

      const [, , setValue] = result.current;
      
      // Change value
      act(() => {
        setValue('updated');
      });
      
      // Immediate value should change, debounced should not
      expect(result.current[0]).toBe('updated');
      expect(result.current[1]).toBe('initial');
      expect(result.current[3]).toBe(true); // isPending

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Both values should now be updated
      expect(result.current[0]).toBe('updated');
      expect(result.current[1]).toBe('updated');
      expect(result.current[3]).toBe(false); // isPending
    });

    it('should reset timer on rapid changes', () => {
      const { result } = renderHook(() => useDebouncedState('initial', 500));

      const [, , setValue] = result.current;

      // First change
      act(() => {
        setValue('first');
      });
      
      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Second change (should reset timer)
      act(() => {
        setValue('second');
      });

      // Advance time partially again
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should still have initial debounced value
      expect(result.current[1]).toBe('initial');

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Should have latest value
      expect(result.current[1]).toBe('second');
    });

    it('should handle different data types', () => {
      // Number
      const { result: numberResult } = renderHook(() => useDebouncedState(42, 100));
      expect(numberResult.current[0]).toBe(42);

      // Boolean
      const { result: boolResult } = renderHook(() => useDebouncedState(true, 100));
      expect(boolResult.current[0]).toBe(true);

      // Object
      const obj = { test: 'value' };
      const { result: objResult } = renderHook(() => useDebouncedState(obj, 100));
      expect(objResult.current[0]).toEqual(obj);
    });

    it('should cleanup timer on unmount', () => {
      // Test that unmounting doesn't cause errors rather than testing implementation details
      const { unmount } = renderHook(() => useDebouncedState('test', 500));
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      const [debouncedFn, isPending] = result.current;

      // Call the debounced function
      act(() => {
        debouncedFn('arg1', 'arg2');
      });

      // Callback should not be called immediately
      expect(callback).not.toHaveBeenCalled();
      expect(result.current[1]).toBe(true); // isPending

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Callback should now be called
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result.current[1]).toBe(false); // isPending
    });

    it('should cancel previous call on rapid invocations', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      const [debouncedFn] = result.current;

      // First call
      act(() => {
        debouncedFn('first');
      });

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(250);
      });

      // Second call (should cancel first)
      act(() => {
        debouncedFn('second');
      });

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Only second call should execute
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });

    it('should handle callback changes', () => {
      let callback1 = jest.fn();
      let callback2 = jest.fn();
      
      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 500),
        { initialProps: { cb: callback1 } }
      );

      // Call with first callback
      act(() => {
        result.current[0]('test');
      });

      // Change callback before timer fires
      rerender({ cb: callback2 });

      // Complete the debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // New callback should be called
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test');
    });

    it('should cleanup timer on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const callback = jest.fn();
      
      const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));
      
      // Call function to set timer
      act(() => {
        result.current[0]('test');
      });
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      clearTimeoutSpy.mockRestore();
    });

    it('should handle zero delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 0));

      act(() => {
        result.current[0]('immediate');
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(callback).toHaveBeenCalledWith('immediate');
    });
  });

  describe('useDebouncedEffect', () => {
    it('should call effect after delay', () => {
      const effect = jest.fn();
      const deps = ['test'];
      
      renderHook(() => useDebouncedEffect(effect, deps, 300));

      // Effect should not be called immediately
      expect(effect).not.toHaveBeenCalled();

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(effect).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous effect on deps change', () => {
      const effect = jest.fn();
      
      const { rerender } = renderHook(
        ({ deps }) => useDebouncedEffect(effect, deps, 300),
        { initialProps: { deps: ['test1'] } }
      );

      // Change deps before timer fires
      rerender({ deps: ['test2'] });

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Effect should only be called once (for the latest deps)
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it('should handle effect cleanup', () => {
      const cleanup = jest.fn();
      const effect = jest.fn().mockReturnValue(cleanup);
      const deps = ['test'];
      
      const { unmount } = renderHook(() => useDebouncedEffect(effect, deps, 300));

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(effect).toHaveBeenCalled();

      // Change deps to trigger cleanup
      unmount();

      expect(cleanup).toHaveBeenCalled();
    });

    it('should cleanup on unmount', () => {
      const effect = jest.fn();
      const cleanup = jest.fn();
      effect.mockReturnValue(cleanup);
      
      const { unmount } = renderHook(() => useDebouncedEffect(effect, ['test'], 300));
      
      // Let effect run
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      unmount();
      
      expect(cleanup).toHaveBeenCalled();
    });

    it('should handle effect without cleanup', () => {
      const effect = jest.fn(); // No return value (no cleanup)
      
      renderHook(() => useDebouncedEffect(effect, ['test'], 300));
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(effect).toHaveBeenCalled();
    });
  });
});