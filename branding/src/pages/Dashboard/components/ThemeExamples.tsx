import React from 'react';
import { Grid, Typography, Card, CardContent, Button, Chip, Box } from '@mui/material';
import { useBranding } from '@/context/BrandingProvider';

export const ThemeExamples: React.FC = () => {
  const { settings } = useBranding();

  return (
    <Grid container spacing={2}>
      {/* Buttons & Actions Examples */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Buttons & Actions
            </Typography>
            <Box className="space-y-3">
              <Box className="flex flex-wrap gap-2">
                <Button variant="contained" color="primary">
                  Primary Action
                </Button>
                <Button variant="contained" color="secondary">
                  Secondary Action
                </Button>
                <Button 
                  variant="outlined" 
                  style={{ 
                    borderColor: settings.theme.extra_light_color,
                    color: settings.theme.text_color 
                  }}
                >
                  Choose File
                </Button>
              </Box>
              <Box className="flex flex-wrap gap-2">
                <Chip 
                  label="Primary Chip" 
                  color="primary"
                />
                <Chip 
                  label="Accent Chip" 
                  style={{ 
                    backgroundColor: settings.theme.extra_light_color,
                    color: settings.theme.text_color
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Text & Content Examples */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Text & Content
            </Typography>
            <Box className="space-y-2">
              <Typography variant="h5">
                Main Heading
              </Typography>
              <Typography variant="body1">
                Body text content using your selected text color and font. This demonstrates how all content will appear.
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Secondary text and captions
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Borders & Backgrounds Examples */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Borders & Backgrounds
            </Typography>
            <Box className="space-y-3">
              <Card 
                variant="outlined"
                style={{ borderColor: settings.theme.extra_light_color }}
                className="p-3"
              >
                <Typography>
                  Card with accent border
                </Typography>
              </Card>
              
              <Box 
                className="p-3 rounded"
                style={{ 
                  backgroundColor: settings.theme.extra_light_color + '20',
                  border: `1px solid ${settings.theme.extra_light_color}`
                }}
              >
                <Typography>
                  Highlighted section
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Header Example */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-3">
              Header Branding
            </Typography>
            <Box 
              className="p-4 rounded-lg"
              style={{ backgroundColor: settings.theme.theme_color }}
            >
              <Typography 
                variant="h6" 
                style={{ color: '#ffffff' }}
                className="mb-2"
              >
                {settings.capabilities.general_app_title}
              </Typography>
              <Typography 
                variant="body2" 
                style={{ color: '#ffffff', opacity: 0.9 }}
              >
                Your branded header with primary color background
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
