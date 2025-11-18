import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrandingSettings } from '@/types/branding';

interface BrandingContextValue {
  settings: BrandingSettings;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    primaryDark: string;
    extraLight: string;
  };
  logos: {
    websiteLogo?: string;
    websiteLogoHeight?: string;
    favIcon?: string;
  };
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}

interface BrandingProviderProps {
  settings: BrandingSettings;
  children: React.ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ settings, children }) => {
  
  // Extract colors with fallbacks
  const colors = useMemo(() => ({
    primary: settings.theme?.theme_color || '#1976d2',
    secondary: settings.theme?.button?.secondary_color || '#9c27b0', 
    text: settings.theme?.text_color || '#000000',
    primaryDark: settings.theme?.primary_dark_color || '#1565c0',
    extraLight: settings.theme?.extra_light_color || '#bbdefb'
  }), [settings]);

  // Extract logos
  const logos = useMemo(() => ({
    websiteLogo: settings.theme?.logos?.websiteLogo,
    websiteLogoHeight: settings.theme?.logos?.websiteLogoHeight,
    favIcon: settings.theme?.logos?.favIcon
  }), [settings]);

  // Create MUI theme
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        light: colors.extraLight
      },
      secondary: {
        main: colors.secondary
      },
      text: {
        primary: colors.text
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500
          },
          contained: {
            backgroundColor: settings.theme?.button?.primary_color || colors.primary,
            '&:hover': {
              backgroundColor: settings.theme?.button?.hover_color || colors.primaryDark
            }
          },
          outlined: {
            borderColor: settings.theme?.button?.border_color || colors.primary,
            color: colors.primary,
            '&:hover': {
              backgroundColor: `${colors.primary}08`,
              borderColor: colors.primaryDark
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.primary
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          }
        }
      }
    }
  }), [colors, settings]);

  const contextValue = useMemo(() => ({
    settings,
    colors,
    logos
  }), [settings, colors, logos]);

  return (
    <BrandingContext.Provider value={contextValue}>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </BrandingContext.Provider>
  );
};
