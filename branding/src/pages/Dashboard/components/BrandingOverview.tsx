import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Business } from '@mui/icons-material';
import { useBranding } from '@/context/BrandingProvider';

export const BrandingOverview: React.FC = () => {
  const { settings } = useBranding();

  return (
    <Card>
      <CardContent>
        <Box className="flex items-center mb-3">
          <Business style={{ color: settings.theme.theme_color }} className="mr-2" />
          <Typography variant="h6">{settings.companyName}</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" className="mb-3">
          Theme Configuration
        </Typography>
        
        <Box className="flex flex-wrap gap-2 mb-3">
          <Box 
            className="w-8 h-8 rounded"
            style={{ backgroundColor: settings.theme.theme_color }}
            title="Primary Color"
          />
          <Box 
            className="w-8 h-8 rounded"
            style={{ backgroundColor: settings.theme.button.secondary_color }}
            title="Secondary Color"
          />
          <Box 
            className="w-8 h-8 rounded"
            style={{ backgroundColor: settings.theme.extra_light_color }}
            title="Accent Color"
          />
        </Box>
        
        <Box className="text-xs text-gray-500 space-y-1">
          <div>Primary: {settings.theme.theme_color}</div>
          <div>Secondary: {settings.theme.button.secondary_color}</div>
          <div>Text: {settings.theme.text_color}</div>
          <div>Font: {settings.theme.font_family.split(',')[0]}</div>
        </Box>
      </CardContent>
    </Card>
  );
};
