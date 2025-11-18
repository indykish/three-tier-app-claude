import React, { useState, useRef } from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { transitions, easings, durations } from '@/utils/animations';

interface AnimatedButtonProps extends ButtonProps {
  rippleColor?: string;
  loading?: boolean;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'rippleColor',
})<AnimatedButtonProps>(({ rippleColor }) => ({
  position: 'relative',
  overflow: 'hidden',
  ...transitions.all,
  transform: 'translateY(0)',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
    transition: `transform ${durations.fast} ${easings.sharp}`,
  },
  
  // Custom ripple effect
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: rippleColor || 'rgba(255, 255, 255, 0.5)',
    transform: 'translate(-50%, -50%)',
    transition: `width ${durations.medium} ${easings.smooth}, height ${durations.medium} ${easings.smooth}`,
  },
  
  '&:active::before': {
    width: '300px',
    height: '300px',
  },
}));

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  rippleColor,
  onClick,
  loading = false,
  disabled,
  variant = 'contained',
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    setIsClicked(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset animation after duration
    timeoutRef.current = setTimeout(() => {
      setIsClicked(false);
    }, 250);
    
    if (onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(event as any);
      }
    }
  };

  return (
    <StyledButton
      {...props}
      variant={variant}
      rippleColor={rippleColor}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      sx={{
        ...props.sx,
        '&::before': {
          width: isClicked ? '300px' : 0,
          height: isClicked ? '300px' : 0,
        },
      }}
    >
      {loading ? (
        <CircularProgress size={20} role="progressbar" />
      ) : (
        children
      )}
    </StyledButton>
  );
};
