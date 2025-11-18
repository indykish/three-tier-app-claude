import React from 'react';
import { Grid, Typography } from '@mui/material';
import { SectionCard, ColorPicker } from '@/components/common';
import { ColorLensIcon } from '@/components/icons';
import { BrandingSettings } from '@/types/branding';

interface BrandColorsFormProps {
  settings: BrandingSettings;
  onColorChange: (colorType: string, value: string) => void;
  onSecondaryColorChange: (value: string) => void;
  primaryColor: string;
}

export const BrandColorsForm: React.FC<BrandColorsFormProps> = ({
  settings,
  onColorChange,
  onSecondaryColorChange,
  primaryColor
}) => {
  return (
    <SectionCard
      title="Brand Colors"
      icon={<ColorLensIcon color={primaryColor} />}
    >
      <Grid container spacing={3} className="items-start">
        <Grid item xs={12} sm={6} md={3}>
          <ColorPicker
            label="Primary Color"
            value={settings.theme.theme_color}
            onChange={(value) => onColorChange('theme_color', value)}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            Main brand color for buttons & links
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ColorPicker
            label="Secondary Color"
            value={settings.theme.button.secondary_color}
            onChange={onSecondaryColorChange}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            Alternative buttons & actions
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ColorPicker
            label="Text Color"
            value={settings.theme.text_color}
            onChange={(value) => onColorChange('text_color', value)}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            Main text & content color
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <ColorPicker
            label="Accent Color"
            value={settings.theme.extra_light_color}
            onChange={(value) => onColorChange('extra_light_color', value)}
          />
          <Typography variant="caption" className="text-gray-500 mt-1 block">
            Borders, highlights & backgrounds
          </Typography>
        </Grid>
      </Grid>
    </SectionCard>
  );
};
