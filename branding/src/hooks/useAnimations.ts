import { useState, useEffect, useCallback, useRef } from 'react';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface UseAnimationResult {
  isVisible: boolean;
  isAnimating: boolean;
  triggerAnimation: () => void;
  resetAnimation: () => void;
  style: React.CSSProperties;
}

/**
 * Modern animation hook with concurrent features
 * Supports entrance animations, micro-interactions, and smooth transitions
 */
export function useAnimation(
  animationType: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounce' | 'shake' | 'pulse',
  config: AnimationConfig = {}
): UseAnimationResult {
  const {
    duration = 300,
    delay = 0,
    easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    fillMode = 'forwards'
  } = config;

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animation | null>(null);

  // Get keyframes for animation type
  const getKeyframes = useCallback(() => {
    switch (animationType) {
      case 'fadeIn':
        return [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
      case 'slideIn':
        return [
          { opacity: 0, transform: 'translateX(-30px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ];
      case 'scaleIn':
        return [
          { opacity: 0, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
      case 'bounce':
        return [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-10px)' },
          { transform: 'translateY(0)' }
        ];
      case 'shake':
        return [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(0)' }
        ];
      case 'pulse':
        return [
          { transform: 'scale(1)' },
          { transform: 'scale(1.05)' },
          { transform: 'scale(1)' }
        ];
      default:
        return [
          { opacity: 0 },
          { opacity: 1 }
        ];
    }
  }, [animationType]);

  // Trigger animation
  const triggerAnimation = useCallback(() => {
    if (typeof window === 'undefined' || !('animate' in Element.prototype)) {
      setIsVisible(true);
      return;
    }

    setIsAnimating(true);

    // Use Web Animations API for better performance
    const element = document.createElement('div'); // Placeholder for actual element
    
    const keyframes = getKeyframes();
    const animationOptions: KeyframeAnimationOptions = {
      duration,
      delay,
      easing,
      fill: fillMode,
    };

    animationRef.current = element.animate(keyframes, animationOptions);

    animationRef.current.addEventListener('finish', () => {
      setIsVisible(true);
      setIsAnimating(false);
    });

    animationRef.current.addEventListener('cancel', () => {
      setIsAnimating(false);
    });

  }, [duration, delay, easing, fillMode, getKeyframes]);

  // Reset animation
  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }
    setIsVisible(false);
    setIsAnimating(false);
  }, []);

  // Auto-trigger on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAnimation();
    }, 50); // Small delay for better perception

    return () => clearTimeout(timer);
  }, [triggerAnimation]);

  // Generate CSS style for fallback
  const getInitialTransform = () => {
    switch (animationType) {
      case 'fadeIn':
        return 'translateY(20px)';
      case 'slideIn':
        return 'translateX(-30px)';
      case 'scaleIn':
        return 'scale(0.8)';
      case 'bounce':
        return 'translateY(0)';
      case 'shake':
        return 'translateX(0)';
      case 'pulse':
        return 'scale(1)';
      default:
        return 'none';
    }
  };

  const getFinalTransform = () => {
    switch (animationType) {
      case 'fadeIn':
        return 'translateY(0)';
      case 'slideIn':
        return 'translateX(0)';
      case 'scaleIn':
        return 'scale(1)';
      case 'bounce':
        return 'translateY(0)';
      case 'shake':
        return 'translateX(0)';
      case 'pulse':
        return 'scale(1)';
      default:
        return 'translateY(0) translateX(0) scale(1)';
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : (animationType === 'bounce' || animationType === 'shake' || animationType === 'pulse' ? 1 : 0),
    transform: isVisible ? getFinalTransform() : getInitialTransform(),
    transition: `all ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`,
  };

  return {
    isVisible,
    isAnimating,
    triggerAnimation,
    resetAnimation,
    style,
  };
}

/**
 * Hook for hover animations with optimized performance
 */
export function useHoverAnimation(
  hoverType: 'lift' | 'scale' | 'glow' | 'rotate' | 'none' = 'lift'
) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const getHoverStyle = useCallback((): React.CSSProperties => {
    if (!isHovered || hoverType === 'none') return {};

    switch (hoverType) {
      case 'lift':
        return {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        };
      case 'scale':
        return {
          transform: 'scale(1.02)',
        };
      case 'glow':
        return {
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
        };
      case 'rotate':
        return {
          transform: 'rotate(2deg)',
        };
      default:
        return {};
    }
  }, [isHovered, hoverType]);

  const style: React.CSSProperties = {
    transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    cursor: hoverType !== 'none' ? 'pointer' : 'default',
    ...getHoverStyle(),
  };

  return {
    isHovered,
    style,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

/**
 * Hook for staggered animations (great for lists)
 */
export function useStaggeredAnimation(
  itemCount: number,
  staggerDelay: number = 100
) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const triggerStaggered = useCallback(() => {
    setVisibleItems(new Set());
    
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]));
      }, i * staggerDelay);
    }
  }, [itemCount, staggerDelay]);

  useEffect(() => {
    triggerStaggered();
  }, [triggerStaggered]);

  const getItemStyle = useCallback((index: number): React.CSSProperties => {
    const isVisible = visibleItems.has(index);
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    };
  }, [visibleItems]);

  return {
    getItemStyle,
    triggerStaggered,
    visibleItems,
  };
}
