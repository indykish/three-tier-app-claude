import { keyframes } from '@emotion/react';

// Smooth easing curves for premium feel
export const easings = {
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
};

// Durations for consistent timing
export const durations = {
  fast: '150ms',
  medium: '250ms',
  slow: '350ms',
  extraSlow: '500ms',
};

// Keyframe animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

// Common animation styles
export const animations = {
  fadeIn: {
    animation: `${fadeIn} ${durations.medium} ${easings.smooth}`,
  },
  slideInLeft: {
    animation: `${slideInLeft} ${durations.medium} ${easings.smooth}`,
  },
  slideInRight: {
    animation: `${slideInRight} ${durations.medium} ${easings.smooth}`,
  },
  scaleIn: {
    animation: `${scaleIn} ${durations.medium} ${easings.gentle}`,
  },
  float: {
    animation: `${float} 3s ${easings.gentle} infinite`,
  },
  pulse: {
    animation: `${pulse} 2s ${easings.gentle} infinite`,
  },
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '1000px 100%',
    animation: `${shimmer} 2s infinite`,
  },
};

// Transition styles
export const transitions = {
  all: {
    transition: `all ${durations.medium} ${easings.smooth}`,
  },
  colors: {
    transition: `background-color ${durations.medium} ${easings.smooth}, 
                 color ${durations.medium} ${easings.smooth}, 
                 border-color ${durations.medium} ${easings.smooth}`,
  },
  transform: {
    transition: `transform ${durations.fast} ${easings.snappy}`,
  },
  shadow: {
    transition: `box-shadow ${durations.medium} ${easings.smooth}`,
  },
  opacity: {
    transition: `opacity ${durations.fast} ${easings.smooth}`,
  },
};

// Hover effects
export const hoverEffects = {
  lift: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  scale: {
    transform: 'scale(1.02)',
  },
  glow: (color: string) => ({
    boxShadow: `0 0 20px ${color}40`,
  }),
  brighten: {
    filter: 'brightness(1.05)',
  },
};
