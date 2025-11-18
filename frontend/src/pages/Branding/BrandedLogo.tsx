import React from 'react';
import { Box } from '@mui/material';
import { useBranding } from '@/context/BrandingProvider';

interface BrandedLogoProps {
  height?: number;
  className?: string;
}

export const BrandedLogo: React.FC<BrandedLogoProps> = ({ 
  height = 32,
  className = '' 
}) => {
  const { logos, colors, settings } = useBranding();

  // If custom logo is uploaded, use it
  if (logos.websiteLogo) {
    return (
      <Box className={className}>
        <img
          src={logos.websiteLogo}
          alt={`${settings.companyName} Logo`}
          style={{ height: `${height}px`, width: 'auto' }}
        />
      </Box>
    );
  }

  // Default SVG logo that adapts to brand colors
  return (
    <Box className={className}>
      <svg
        width={height * 3}
        height={height}
        viewBox="0 0 120 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${settings.companyName} Logo`}
      >
        {/* Bank building */}
        <g fill={colors.primary}>
          {/* Main building */}
          <rect x="8" y="8" width="16" height="20" rx="1" />
          
          {/* Columns */}
          <rect x="10" y="12" width="2" height="12" />
          <rect x="13" y="12" width="2" height="12" />
          <rect x="16" y="12" width="2" height="12" />
          <rect x="19" y="12" width="2" height="12" />
          
          {/* Roof/pediment */}
          <polygon points="6,8 16,4 26,8 24,8 16,6 8,8" />
          
          {/* Base */}
          <rect x="6" y="28" width="20" height="2" />
          
          {/* Door */}
          <rect x="14" y="22" width="4" height="6" fill="white" />
        </g>
        
        {/* Company name text */}
        <text 
          x="36" 
          y="22" 
          fill={colors.primary}
          fontSize="14" 
          fontFamily="Arial, sans-serif" 
          fontWeight="600"
        >
          {settings.companyName.toUpperCase() || 'BANK'}
        </text>
      </svg>
    </Box>
  );
};
