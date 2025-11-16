import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { easings, durations } from '@/utils/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey: string | number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade';
}

const TransitionContainer = styled(Box)<{ 
  isVisible: boolean; 
  direction: string;
}>(({ isVisible, direction }) => {
  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translateX(-30px)';
        case 'right': return 'translateX(30px)';
        case 'up': return 'translateY(-30px)';
        case 'down': return 'translateY(30px)';
        default: return 'translateY(20px)';
      }
    }
    return 'translateX(0) translateY(0)';
  };

  return {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transition: `all ${durations.slow} ${easings.smooth}`,
    willChange: 'transform, opacity',
  };
});

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  direction = 'fade',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(transitionKey);

  useEffect(() => {
    if (transitionKey !== currentKey) {
      // Fade out
      setIsVisible(false);
      
      // Change content and fade in after a delay
      setTimeout(() => {
        setCurrentKey(transitionKey);
        setIsVisible(true);
      }, 200);
    } else {
      setIsVisible(true);
    }
  }, [transitionKey, currentKey]);

  return (
    <TransitionContainer isVisible={isVisible} direction={direction}>
      {children}
    </TransitionContainer>
  );
};
