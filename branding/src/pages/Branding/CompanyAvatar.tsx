import React from 'react';
import { Avatar } from '@mui/material';
import { useBranding } from '@/context/BrandingProvider';

interface CompanyAvatarProps {
  size?: number;
  className?: string;
}

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({ 
  size = 40, 
  className = '' 
}) => {
  const { settings, colors } = useBranding();
  
  const companyInitials = settings.companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar
      className={className}
      sx={{
        width: size,
        height: size,
        backgroundColor: colors.primary,
        color: 'white',
        fontWeight: 'bold',
        fontSize: size * 0.4,
      }}
    >
      {companyInitials}
    </Avatar>
  );
};
