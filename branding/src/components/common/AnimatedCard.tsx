import React, { useState } from 'react';
import { Card, CardProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { transitions, hoverEffects, easings, durations } from '@/utils/animations';

interface AnimatedCardProps extends CardProps {
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'brighten' | 'none';
  glowColor?: string;
  delay?: number;
  children: React.ReactNode;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => !['hoverEffect', 'glowColor', 'delay'].includes(prop as string),
})<AnimatedCardProps>(({ hoverEffect = 'lift', glowColor, delay = 0 }) => ({
  ...transitions.all,
  ...transitions.shadow,
  animationDelay: `${delay}ms`,
  cursor: hoverEffect !== 'none' ? 'pointer' : 'default',
  
  '&:hover': hoverEffect !== 'none' ? {
    ...(hoverEffect === 'lift' && hoverEffects.lift),
    ...(hoverEffect === 'scale' && hoverEffects.scale),
    ...(hoverEffect === 'glow' && glowColor && hoverEffects.glow(glowColor)),
    ...(hoverEffect === 'brighten' && hoverEffects.brighten),
  } : {},

  // Add a subtle entrance animation
  '@keyframes cardEnter': {
    from: {
      opacity: 0,
      transform: 'translateY(20px) scale(0.95)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
    },
  },
  
  animation: `cardEnter ${durations.medium} ${easings.smooth} forwards`,
  
  // Add ripple effect on click
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    transform: 'scale(0)',
    transition: `transform ${durations.fast} ${easings.snappy}`,
    pointerEvents: 'none',
    zIndex: 1,
  },
  
  '&:active::before': {
    transform: 'scale(1)',
  },
}));

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hoverEffect = 'lift',
  glowColor,
  delay = 0,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledCard
      {...props}
      hoverEffect={hoverEffect}
      glowColor={glowColor}
      delay={delay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        ...props.sx,
        // Add dynamic shadow based on hover
        boxShadow: isHovered && hoverEffect !== 'none' 
          ? '0 12px 40px rgba(0, 0, 0, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </StyledCard>
  );
};
