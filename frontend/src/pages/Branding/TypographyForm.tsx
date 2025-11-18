import React from 'react';
import { Typography } from '@mui/material';
import { SectionCard, FontPicker } from '@/components/common';
import { BrandingSettings } from '@/types/branding';

interface TypographyFormProps {
  settings: BrandingSettings;
  onFontChange: (font: string) => void;
  primaryColor: string;
}

const TypographyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-2">
    <path 
      d="M5,4V7H10.5V19H13.5V7H19V4H5Z" 
      fill={color}
    />
  </svg>
);

export const TypographyForm: React.FC<TypographyFormProps> = ({
  settings,
  onFontChange,
  primaryColor
}) => {
  return (
    <SectionCard
      title="Typography"
      icon={<TypographyIcon color={primaryColor} />}
    >
      <FontPicker
        label="Primary Font"
        value={settings.theme.font_family}
        onChange={onFontChange}
      />
      
      <Typography variant="caption" display="block" className="mt-2 text-gray-500">
        This font will be used for all text throughout your application
      </Typography>
    </SectionCard>
  );
};
