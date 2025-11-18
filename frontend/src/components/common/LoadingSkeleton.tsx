import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { shimmer, durations, easings } from '@/utils/animations';

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'dashboard' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  animation?: 'pulse' | 'wave' | false;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'aria-label'?: string;
}

const AnimatedSkeleton = styled(Skeleton)(({ theme }) => ({
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s ease-in-out infinite`,
  borderRadius: theme.spacing(1),
}));

const SkeletonCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  animation: `fadeInSkeleton ${durations.medium} ${easings.smooth}`,
  
  '@keyframes fadeInSkeleton': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
}));

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  lines = 3,
  width = '100%',
  height,
  animate = true,
  animation,
  className,
  style,
  'data-testid': dataTestId = 'loading-skeleton',
  'aria-label': ariaLabel,
  ...props
}) => {
  const SkeletonComponent = animate ? AnimatedSkeleton : Skeleton;
  
  // Handle MUI Skeleton variants
  const muiVariant = variant === 'text' ? 'text' :
                    variant === 'circular' ? 'circular' :
                    variant === 'rounded' ? 'rounded' :
                    variant === 'rectangular' ? 'rectangular' :
                    'text';

  // Handle MUI Skeleton variants directly
  if (['text', 'circular', 'rectangular', 'rounded'].includes(variant)) {
    return (
      <SkeletonComponent
        variant={muiVariant}
        width={width}
        height={height}
        animation={animation}
        className={className}
        style={style}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }

  switch (variant) {
    case 'card':
      return (
        <SkeletonCard data-testid={dataTestId} className={className} style={style}>
          <Box display="flex" alignItems="center" gap={2}>
            <SkeletonComponent variant="circular" width={40} height={40} />
            <Box flex={1}>
              <SkeletonComponent width="60%" height={24} />
              <SkeletonComponent width="40%" height={16} />
            </Box>
          </Box>
          <SkeletonComponent width="100%" height={120} />
          <Box display="flex" gap={1}>
            <SkeletonComponent width={80} height={32} />
            <SkeletonComponent width={80} height={32} />
          </Box>
        </SkeletonCard>
      );

    case 'avatar':
      return (
        <SkeletonComponent 
          variant="circular" 
          width={width} 
          height={height || width}
          data-testid={dataTestId}
          className={className}
          style={style}
          aria-label={ariaLabel}
        />
      );

    case 'button':
      return (
        <SkeletonComponent 
          variant="rounded" 
          width={width} 
          height={height || 36}
          sx={{ borderRadius: 2 }}
          data-testid={dataTestId}
          className={className}
          style={style}
          aria-label={ariaLabel}
        />
      );

    case 'dashboard':
      return (
        <Box sx={{ padding: 3 }} data-testid={dataTestId} className={className} style={style}>
          {/* Header skeleton */}
          <Box mb={4}>
            <SkeletonComponent width="40%" height={32} sx={{ mb: 1 }} />
            <SkeletonComponent width="60%" height={20} />
          </Box>
          
          {/* Cards grid skeleton */}
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} variant="card" />
            ))}
          </Box>
        </Box>
      );

    default:
      return (
        <Box data-testid={dataTestId} className={className} style={style}>
          {[...Array(lines)].map((_, index) => (
            <SkeletonComponent
              key={index}
              width={index === lines - 1 ? '60%' : width}
              height={height || 20}
              sx={{ 
                mb: index < lines - 1 ? 1 : 0,
                animationDelay: `${index * 100}ms`,
              }}
            />
          ))}
        </Box>
      );
  }
};
