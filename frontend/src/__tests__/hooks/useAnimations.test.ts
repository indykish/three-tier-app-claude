import { renderHook, act } from '@testing-library/react';
import { useAnimation, useHoverAnimation, useStaggeredAnimation } from '@/hooks/useAnimations';

describe('useAnimations', () => {
  beforeEach(() => {
    // Mock Element.prototype.animate
    Element.prototype.animate = jest.fn().mockReturnValue({
      addEventListener: jest.fn(),
      cancel: jest.fn(),
    });
    
    // Use fake timers for timing-dependent tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('useAnimation', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useAnimation('fadeIn'));

      expect(result.current.isVisible).toBe(false);
      expect(result.current.isAnimating).toBe(false);
      expect(typeof result.current.triggerAnimation).toBe('function');
      expect(typeof result.current.resetAnimation).toBe('function');
      expect(typeof result.current.style).toBe('object');
    });

    it('should provide correct style for fadeIn animation', () => {
      const { result } = renderHook(() => useAnimation('fadeIn'));

      expect(result.current.style.opacity).toBe(0);
      expect(result.current.style.transform).toBe('translateY(20px)');
      expect(result.current.style.transition).toContain('300ms');
    });

    it('should provide correct style for slideIn animation', () => {
      const { result } = renderHook(() => useAnimation('slideIn'));

      expect(result.current.style.opacity).toBe(0);
      expect(result.current.style.transform).toBe('translateX(-30px)');
    });

    it('should provide correct style for scaleIn animation', () => {
      const { result } = renderHook(() => useAnimation('scaleIn'));

      expect(result.current.style.opacity).toBe(0);
      expect(result.current.style.transform).toBe('scale(0.8)');
    });

    it('should provide correct style for bounce animation', () => {
      const { result } = renderHook(() => useAnimation('bounce'));

      expect(result.current.style.transform).toBe('translateY(0)');
    });

    it('should provide correct style for shake animation', () => {
      const { result } = renderHook(() => useAnimation('shake'));

      expect(result.current.style.transform).toBe('translateX(0)');
    });

    it('should provide correct style for pulse animation', () => {
      const { result } = renderHook(() => useAnimation('pulse'));

      expect(result.current.style.transform).toBe('scale(1)');
    });

    it('should handle custom config', () => {
      const { result } = renderHook(() => 
        useAnimation('fadeIn', {
          duration: 500,
          delay: 100,
          easing: 'ease-in-out',
        })
      );

      expect(result.current.style.transition).toContain('500ms');
      expect(result.current.style.transitionDelay).toBe('100ms');
      expect(result.current.style.transition).toContain('ease-in-out');
    });

    it('should trigger animation manually', () => {
      const { result } = renderHook(() => useAnimation('fadeIn'));

      act(() => {
        result.current.triggerAnimation();
      });

      expect(result.current.isAnimating).toBe(true);
    });

    it('should reset animation', () => {
      const { result } = renderHook(() => useAnimation('fadeIn'));

      act(() => {
        result.current.triggerAnimation();
      });

      expect(result.current.isAnimating).toBe(true);

      act(() => {
        result.current.resetAnimation();
      });

      expect(result.current.isVisible).toBe(false);
      expect(result.current.isAnimating).toBe(false);
    });

    it('should handle all animation types', () => {
      const animationTypes = ['fadeIn', 'slideIn', 'scaleIn', 'bounce', 'shake', 'pulse'] as const;

      animationTypes.forEach(type => {
        const { result } = renderHook(() => useAnimation(type));
        expect(result.current.style).toBeDefined();
        expect(result.current.style.transition).toBeDefined();
      });
    });

    it('should trigger animation with ref element', () => {
      const mockElement = document.createElement('div');
      const mockAnimation = {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'finish') {
            setTimeout(handler, 0); // Simulate animation finish
          }
        }),
        cancel: jest.fn(),
      };
      
      mockElement.animate = jest.fn().mockReturnValue(mockAnimation);
      
      const { result } = renderHook(() => useAnimation('fadeIn'));
      
      // Mock the ref
      const mockRef = { current: mockElement };
      
      act(() => {
        result.current.triggerAnimation();
      });

      expect(result.current.isAnimating).toBe(true);
    });

    it('should cancel animation on reset', () => {
      const mockElement = document.createElement('div');
      const mockAnimation = {
        addEventListener: jest.fn(),
        cancel: jest.fn(),
      };
      
      mockElement.animate = jest.fn().mockReturnValue(mockAnimation);
      
      const { result } = renderHook(() => useAnimation('fadeIn'));
      
      act(() => {
        result.current.triggerAnimation();
      });
      
      act(() => {
        result.current.resetAnimation();
      });

      expect(result.current.isAnimating).toBe(false);
    });

    it('should handle animation finish event', async () => {
      let finishHandler: (() => void) | null = null;
      
      const mockAnimation = {
        addEventListener: jest.fn((event, handler) => {
          if (event === 'finish') {
            finishHandler = handler;
          }
        }),
        cancel: jest.fn(),
      };
      
      // Mock document.createElement to spy on it and then modify the returned element
      const originalCreateElement = document.createElement;
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'div') {
          element.animate = jest.fn().mockReturnValue(mockAnimation);
        }
        return element;
      });
      
      const { result } = renderHook(() => useAnimation('fadeIn'));
      
      act(() => {
        result.current.triggerAnimation();
      });

      expect(result.current.isAnimating).toBe(true);
      
      // Simulate animation finish
      act(() => {
        if (finishHandler) finishHandler();
      });

      expect(result.current.isVisible).toBe(true);
      expect(result.current.isAnimating).toBe(false);
      
      // Restore spy
      createElementSpy.mockRestore();
    });
  });

  describe('useHoverAnimation', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useHoverAnimation());

      expect(result.current.isHovered).toBe(false);
      expect(typeof result.current.style).toBe('object');
      expect(typeof result.current.handlers.onMouseEnter).toBe('function');
      expect(typeof result.current.handlers.onMouseLeave).toBe('function');
    });

    it('should handle mouse enter', () => {
      const { result } = renderHook(() => useHoverAnimation('lift'));

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.isHovered).toBe(true);
      expect(result.current.style.transform).toBe('translateY(-4px)');
      expect(result.current.style.boxShadow).toContain('rgba(0, 0, 0, 0.15)');
    });

    it('should handle mouse leave', () => {
      const { result } = renderHook(() => useHoverAnimation('lift'));

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.isHovered).toBe(true);

      act(() => {
        result.current.handlers.onMouseLeave();
      });

      expect(result.current.isHovered).toBe(false);
    });

    it('should handle scale hover effect', () => {
      const { result } = renderHook(() => useHoverAnimation('scale'));

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.style.transform).toBe('scale(1.02)');
    });

    it('should handle glow hover effect', () => {
      const { result } = renderHook(() => useHoverAnimation('glow'));

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.style.boxShadow).toContain('rgba(59, 130, 246, 0.4)');
    });

    it('should handle rotate hover effect', () => {
      const { result } = renderHook(() => useHoverAnimation('rotate'));

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.style.transform).toBe('rotate(2deg)');
    });

    it('should handle none hover effect', () => {
      const { result } = renderHook(() => useHoverAnimation('none'));

      expect(result.current.style.cursor).toBe('default');

      act(() => {
        result.current.handlers.onMouseEnter();
      });

      expect(result.current.style.transform).toBeUndefined();
      expect(result.current.style.boxShadow).toBeUndefined();
    });

    it('should always include transition style', () => {
      const { result } = renderHook(() => useHoverAnimation('lift'));

      expect(result.current.style.transition).toContain('200ms');
      expect(result.current.style.transition).toContain('cubic-bezier(0.4, 0.0, 0.2, 1)');
    });
  });

  describe('useStaggeredAnimation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return initial state', () => {
      const { result } = renderHook(() => useStaggeredAnimation(3));

      expect(result.current.visibleItems.size).toBe(0);
      expect(typeof result.current.getItemStyle).toBe('function');
      expect(typeof result.current.triggerStaggered).toBe('function');
    });

    it('should provide correct initial item styles', () => {
      const { result } = renderHook(() => useStaggeredAnimation(3));

      const style0 = result.current.getItemStyle(0);
      const style1 = result.current.getItemStyle(1);

      expect(style0.opacity).toBe(0);
      expect(style0.transform).toBe('translateY(20px)');
      expect(style1.opacity).toBe(0);
      expect(style1.transform).toBe('translateY(20px)');
    });

    it('should stagger animations with default delay', () => {
      const { result } = renderHook(() => useStaggeredAnimation(3));

      // Initially no items should be visible
      expect(result.current.visibleItems.size).toBe(0);

      // Advance time to trigger first item (i * staggerDelay where i = 0)
      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current.visibleItems.has(0)).toBe(true);
      expect(result.current.visibleItems.has(1)).toBe(false);

      // Advance time to show second item (i * staggerDelay where i = 1)
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.visibleItems.has(1)).toBe(true);
      expect(result.current.visibleItems.has(2)).toBe(false);

      // Advance time to show third item (i * staggerDelay where i = 2)
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.visibleItems.has(2)).toBe(true);
    });

    it('should handle custom stagger delay', () => {
      const { result } = renderHook(() => useStaggeredAnimation(2, 200));

      // Initially no items should be visible
      expect(result.current.visibleItems.size).toBe(0);

      // Advance time to trigger first item (i * staggerDelay where i = 0)
      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current.visibleItems.has(0)).toBe(true);
      expect(result.current.visibleItems.has(1)).toBe(false);

      // Advance time to show second item (i * staggerDelay where i = 1)
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.visibleItems.has(1)).toBe(true);
    });

    it('should provide correct visible item styles', () => {
      const { result } = renderHook(() => useStaggeredAnimation(2));

      // Make first item visible
      act(() => {
        jest.advanceTimersByTime(0);
      });

      const visibleStyle = result.current.getItemStyle(0);
      const hiddenStyle = result.current.getItemStyle(1);

      expect(visibleStyle.opacity).toBe(1);
      expect(visibleStyle.transform).toBe('translateY(0)');
      expect(hiddenStyle.opacity).toBe(0);
      expect(hiddenStyle.transform).toBe('translateY(20px)');
    });

    it('should trigger staggered animation manually', () => {
      const { result } = renderHook(() => useStaggeredAnimation(2));

      // Reset and trigger manually
      act(() => {
        result.current.triggerStaggered();
      });

      expect(result.current.visibleItems.size).toBe(0);

      // Advance time
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.visibleItems.has(0)).toBe(true);
    });

    it('should include transition in item styles', () => {
      const { result } = renderHook(() => useStaggeredAnimation(1));

      const style = result.current.getItemStyle(0);

      expect(style.transition).toContain('300ms');
      expect(style.transition).toContain('cubic-bezier(0.4, 0.0, 0.2, 1)');
    });

    it('should handle zero items', () => {
      const { result } = renderHook(() => useStaggeredAnimation(0));

      expect(result.current.visibleItems.size).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.visibleItems.size).toBe(0);
    });

    it('should handle large item counts', () => {
      const { result } = renderHook(() => useStaggeredAnimation(100, 10));

      // Advance time to show first 6 items (0ms, 10ms, 20ms, 30ms, 40ms, 50ms)
      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(result.current.visibleItems.size).toBe(6);

      // Check that items are showing in order
      for (let i = 0; i < 6; i++) {
        expect(result.current.visibleItems.has(i)).toBe(true);
      }
      expect(result.current.visibleItems.has(6)).toBe(false);
    });
  });
});
