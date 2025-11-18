import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip } from '@mui/material';
import { Icon, useIconLoader } from '@/utils/iconloader';
import { useBranding } from '@/context/BrandingProvider';

export const IconShowcase: React.FC = () => {
  const { settings } = useBranding();
  const { getAvailableIcons } = useIconLoader();

  // Get available icons by category
  const navigationIcons = getAvailableIcons('navigation');
  const alertIcons = getAvailableIcons('alerts');
  const actionIcons = getAvailableIcons('actions');
  const businessIcons = getAvailableIcons('business');

  const iconCategories = [
    { name: 'Navigation', icons: navigationIcons, color: settings.theme.theme_color },
    { name: 'Alerts', icons: alertIcons, color: settings.theme.button.secondary_color },
    { name: 'Actions', icons: actionIcons, color: settings.theme.primary_dark_color },
    { name: 'Business', icons: businessIcons, color: settings.theme.extra_light_color },
  ];

  return (
    <Grid item xs={12}>
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="mb-4 font-semibold flex items-center">
            <Icon name="preview" size="md" className="mr-2" color={settings.theme.theme_color} />
            Lazy-Loaded Icon System Demo
          </Typography>
          
          <Typography variant="body2" color="text.secondary" className="mb-4">
            Icons are loaded on-demand using React.lazy() and Suspense for optimal performance. 
            Each icon is themed with your brand colors.
          </Typography>

          {iconCategories.map((category) => (
            <Box key={category.name} className="mb-6">
              <Box className="flex items-center mb-3">
                <Typography variant="subtitle1" className="font-medium mr-2">
                  {category.name} Icons
                </Typography>
                <Chip 
                  label={`${category.icons.length} icons`} 
                  size="small" 
                  style={{ 
                    backgroundColor: category.color + '20',
                    color: category.color 
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                {category.icons.map((iconName) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={iconName}>
                    <Box 
                      className="p-3 rounded border border-gray-200 hover:shadow-md transition-shadow"
                      sx={{ 
                        borderColor: category.color + '30',
                        '&:hover': { borderColor: category.color }
                      }}
                    >
                      <Box className="flex flex-col items-center text-center">
                        <Icon 
                          name={iconName} 
                          size="lg" 
                          color={category.color}
                          className="mb-2"
                        />
                        <Typography variant="caption" className="font-mono">
                          {iconName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {/* Performance Info */}
          <Box className="mt-6 p-4 bg-gray-50 rounded">
            <Typography variant="subtitle2" className="mb-2 font-medium">
              Performance Features:
            </Typography>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Icons load only when needed (lazy loading)</li>
              <li>• Cached after first load for instant re-use</li>
              <li>• Suspense boundaries for smooth loading states</li>
              <li>• Dynamic color theming based on brand settings</li>
              <li>• Support for SVG, TSX, and Material-UI icons</li>
              <li>• Searchable icon registry with keywords</li>
            </ul>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};
