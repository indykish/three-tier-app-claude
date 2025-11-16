import { useState, useEffect, startTransition, Suspense } from 'react';
import { CssBaseline, Box, Alert, Button } from '@mui/material';
import { BrandingProvider } from '@/context/BrandingProvider';
import { CustomThemeProvider } from '@/context/ThemeProvider';
import { IconLoaderProvider } from '@/utils/iconloader';
import { BrandingWizard } from '@/pages/Branding';
import { Header, Dashboard } from '@/pages/Dashboard';
import { BrandingStorage } from '@/services/brandingStorage';
import { ThemeAPI } from '@/services/themeApi';
import { BrandingSettings, DEFAULT_BRANDING } from '@/types/branding';

function App() {
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<number | null>(null);

  useEffect(() => {
    // Load branding settings from API
    const loadFromApi = async () => {
      try {
        console.log('Loading themes from API...');
        const theme = await ThemeAPI.getFirst();

        if (theme &&
            typeof theme === 'object' &&
            theme.companyName &&
            theme.theme &&
            theme.capabilities) {
          console.log('Theme loaded from API:', theme.name);
          setBrandingSettings(theme);
          setCurrentThemeId(theme.id);
          setShowWizard(false);
          setApiError(null);
        } else {
          console.log('No themes found in API, showing wizard');
          setShowWizard(true);
        }
      } catch (error) {
        console.warn('Failed to load themes from API, falling back to localStorage:', error);
        setApiError('Unable to connect to backend API. Using local storage.');

        // Fallback to localStorage
        try {
          const savedSettings = BrandingStorage.load();
          if (savedSettings &&
              typeof savedSettings === 'object' &&
              savedSettings.companyName &&
              savedSettings.theme &&
              savedSettings.capabilities) {
            setBrandingSettings(savedSettings);
            setShowWizard(false);
          } else {
            setShowWizard(true);
          }
        } catch (storageError) {
          console.warn('Failed to load from localStorage:', storageError);
          setShowWizard(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFromApi();
  }, []);

  const handleBrandingComplete = async (settings: BrandingSettings) => {
    startTransition(() => {
      setBrandingSettings(settings);
      setShowWizard(false);
    });

    // Also save to API if available
    try {
      if (currentThemeId) {
        await ThemeAPI.update(currentThemeId, settings.companyName || 'Custom Theme', settings);
        console.log('Theme updated in API');
      } else {
        const savedTheme = await ThemeAPI.create(settings.companyName || 'Custom Theme', settings);
        setCurrentThemeId(savedTheme.id);
        console.log('Theme saved to API');
      }
      setApiError(null);
    } catch (error) {
      console.warn('Failed to save to API, saving to localStorage:', error);
      BrandingStorage.save(settings);
    }
  };

  const handleResetBranding = () => {
    startTransition(() => {
      try {
        BrandingStorage.clear();
      } catch (error) {
        console.warn('Failed to clear branding storage:', error);
      }
      setBrandingSettings(DEFAULT_BRANDING);
      setCurrentThemeId(null);
      setShowWizard(true);
    });
  };

  if (isLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Box>
    );
  }

  return (
    <CustomThemeProvider brandingSettings={brandingSettings}>
      <BrandingProvider settings={brandingSettings}>
        <IconLoaderProvider preloadIcons={['dashboard', 'settings', 'business', 'upload']}>
          <CssBaseline />
        <Suspense fallback={
          <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </Box>
        }>
          {apiError && (
            <Alert severity="warning" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
              {apiError}
            </Alert>
          )}
          {showWizard ? (
            <BrandingWizard onComplete={handleBrandingComplete} />
          ) : (
            <Box className="min-h-screen bg-gray-50">
              <Header onResetBranding={handleResetBranding} />
              <Suspense fallback={
                <Box className="py-8 text-center">
                  <div className="animate-pulse">Loading Dashboard...</div>
                </Box>
              }>
                <Dashboard />
              </Suspense>
            </Box>
          )}
        </Suspense>
        </IconLoaderProvider>
      </BrandingProvider>
    </CustomThemeProvider>
  );
}

export default App;
