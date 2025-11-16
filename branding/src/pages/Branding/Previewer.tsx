import React from 'react';
import { Box, Button, Typography, Card, Chip, Divider } from '@mui/material';
import { SectionCard } from '@/components/common';
import { PreviewIcon } from '@/components/icons';
import { BrandingSettings } from '@/types/branding';

interface PreviewerProps {
  settings: BrandingSettings;
}

export const Previewer: React.FC<PreviewerProps> = ({ settings }) => {
  return (
    <SectionCard
      title="Preview"
      icon={<PreviewIcon color={settings.theme.theme_color} />}
    >
      {/* Header Preview */}
      <Box 
        className="p-4 rounded-lg mb-4"
        style={{ backgroundColor: settings.theme.theme_color }}
      >
        <Typography 
          variant="h6" 
          style={{ color: '#ffffff' }}
        >
          {settings.capabilities.general_app_title}
        </Typography>
      </Box>
      
      {/* Buttons Preview */}
      <Box className="mb-4">
        <Typography variant="body2" className="mb-2 text-gray-600">
          Buttons & Actions:
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <Button 
            variant="contained"
            style={{ 
              backgroundColor: settings.theme.theme_color,
              color: '#ffffff'
            }}
          >
            Primary Button
          </Button>
          <Button 
            variant="contained"
            style={{ 
              backgroundColor: settings.theme.button.secondary_color,
              color: '#ffffff'
            }}
          >
            Secondary Button
          </Button>
          <Button 
            variant="outlined"
            style={{ 
              borderColor: settings.theme.extra_light_color,
              color: settings.theme.text_color,
              backgroundColor: 'transparent'
            }}
          >
            Choose Logo File
          </Button>
        </Box>
      </Box>

      {/* Text & Content Preview */}
      <Box className="mb-4">
        <Typography variant="body2" className="mb-2 text-gray-600">
          Text & Content:
        </Typography>
        <Typography 
          variant="h6" 
          style={{ color: settings.theme.text_color }}
          className="mb-1"
        >
          Heading Text
        </Typography>
        <Typography 
          variant="body1" 
          style={{ color: settings.theme.text_color }}
          className="mb-2"
        >
          This is body text using your selected text color.
        </Typography>
      </Box>

      {/* Borders, Highlights & Backgrounds Preview */}
      <Box className="mb-4">
        <Typography variant="body2" className="mb-2 text-gray-600">
          Borders, Highlights & Backgrounds:
        </Typography>
        <Box className="space-y-2">
          <Card 
            variant="outlined" 
            className="p-3"
            style={{ borderColor: settings.theme.extra_light_color }}
          >
            <Typography style={{ color: settings.theme.text_color }}>
              Card with accent border
            </Typography>
          </Card>
          
          <Box 
            className="p-3 rounded"
            style={{ 
              backgroundColor: settings.theme.extra_light_color + '20', // 12% opacity
              border: `1px solid ${settings.theme.extra_light_color}`
            }}
          >
            <Typography style={{ color: settings.theme.text_color }}>
              Highlighted section with accent background
            </Typography>
          </Box>

          <Box className="flex gap-2">
            <Chip 
              label="Accent Chip" 
              style={{ 
                backgroundColor: settings.theme.extra_light_color,
                color: settings.theme.text_color
              }}
            />
            <Chip 
              label="Primary Chip" 
              style={{ 
                backgroundColor: settings.theme.theme_color,
                color: '#ffffff'
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider style={{ borderColor: settings.theme.extra_light_color }} />
    </SectionCard>
  );
};
