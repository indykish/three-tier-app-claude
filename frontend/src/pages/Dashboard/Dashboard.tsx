import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { useBranding } from '@/context/BrandingProvider';
import {
  BrandingOverview,
  ThemeExamples,
  IconShowcase
} from './components';

export const Dashboard: React.FC = () => {
  const { settings } = useBranding();

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Welcome Section */}
      <Box className="mb-8">
        <Typography variant="h4" className="mb-2 font-bold">
          Welcome back to {settings.capabilities.general_app_title}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your branding configuration and available tools.
        </Typography>
      </Box>

      {/* Theme Examples Section - First */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12}>
          <Typography variant="h6" className="mb-3 font-semibold">
            Theme Examples
          </Typography>
          <ThemeExamples />
        </Grid>
      </Grid>

      {/* Current Branding and Available Icons - Second Row */}
      <Grid container spacing={3}>
        {/* Branding Info */}
        <Grid item xs={12} lg={6}>
          <Typography variant="h6" className="mb-3 font-semibold">
            Current Branding
          </Typography>
          <BrandingOverview />
        </Grid>

        {/* Icon Showcase Section */}
        <Grid item xs={12} lg={6}>
          <Typography variant="h6" className="mb-3 font-semibold">
            Available Icons
          </Typography>
          <IconShowcase />
        </Grid>
      </Grid>
    </Container>
  );
};