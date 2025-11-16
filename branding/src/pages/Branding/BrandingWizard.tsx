import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { BrandingSettings, DEFAULT_BRANDING } from '@/types/branding';
import { BrandingStorage, fileToBase64 } from '@/services/brandingStorage';
import { adjustColor } from '@/utils/colorUtils';
import { CompanyInformationForm } from './CompanyInformationForm';
import { LogoUploadForm } from './LogoUploadForm';
import { BrandColorsForm } from './BrandColorsForm';
import { TypographyForm } from './TypographyForm';
import { Previewer } from './Previewer';

interface BrandingWizardProps {
  onComplete: (settings: BrandingSettings) => void;
}

export const BrandingWizard: React.FC<BrandingWizardProps> = ({ onComplete }) => {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleColorChange = (colorType: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorType]: value,
        ...(colorType === 'theme_color' && {
          button: {
            ...prev.theme.button,
            primary_color: value,
            hover_color: adjustColor(value, -20), // Darker shade
          }
        }),
      },
    }));
  };

  const handleSecondaryColorChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        button: {
          ...prev.theme.button,
          secondary_color: value,
        }
      }
    }));
  };

  const handleFontChange = (font: string) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        font_family: font,
      }
    }));
  };

  const handleCompanyChange = (field: string, value: string) => {
    if (field === 'companyName') {
      setSettings(prev => ({
        ...prev,
        companyName: value,
        capabilities: {
          ...prev.capabilities,
          general_app_title: value || 'My Bank',
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
    setError('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');

    try {
      let logoBase64 = '';
      if (logoFile) {
        logoBase64 = await fileToBase64(logoFile);
      }

      const finalSettings: BrandingSettings = {
        ...settings,
        theme: {
          ...settings.theme,
          logos: {
            ...settings.theme.logos,
            websiteLogo: logoBase64,
            websiteLogoHeight: '40',
          },
        },
      };

      await BrandingStorage.save(finalSettings);
      onComplete(finalSettings);
    } catch (err) {
      setError('Failed to save branding settings. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8">
      <Box className="max-w-4xl mx-auto px-4">
        <Card>
          <CardContent className="p-8">
            <Box className="text-center mb-8">
              <Typography variant="h4" className="mb-2 font-bold">
                🎨 Branding Setup Wizard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Configure your company branding and theme colors
              </Typography>
            </Box>

            {isLoading && <LinearProgress className="mb-4" role="progressbar" />}

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Company Information */}
              <Grid item xs={12} md={6}>
                <CompanyInformationForm
                  settings={settings}
                  onChange={handleCompanyChange}
                  primaryColor={settings.theme.theme_color}
                />
              </Grid>

              {/* Logo Upload */}
              <Grid item xs={12} md={6}>
                <LogoUploadForm
                  logoFile={logoFile}
                  onLogoChange={handleLogoUpload}
                  primaryColor={settings.theme.theme_color}
                  textColor={settings.theme.text_color}
                  accentColor={settings.theme.extra_light_color}
                  onError={handleError}
                />
              </Grid>

              {/* Color Scheme */}
              <Grid item xs={12}>
                <BrandColorsForm
                  settings={settings}
                  onColorChange={handleColorChange}
                  onSecondaryColorChange={handleSecondaryColorChange}
                  primaryColor={settings.theme.theme_color}
                />
              </Grid>

              {/* Typography */}
              <Grid item xs={12} md={6}>
                <TypographyForm
                  settings={settings}
                  onFontChange={handleFontChange}
                  primaryColor={settings.theme.theme_color}
                />
              </Grid>

              {/* Preview */}
              <Grid item xs={12}>
                <Previewer settings={settings} />
              </Grid>
            </Grid>

            {/* Save Button */}
            <Box className="text-center mt-6">
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={!settings.companyName || isLoading}
                startIcon={<Save />}
                className="px-8 py-3"
                color="primary"
              >
                {isLoading ? 'Saving...' : 'Save Branding & Continue'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
