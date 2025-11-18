import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrandingSettings } from '@/types/branding';
import { useFontLoader } from '@/hooks';

interface CustomThemeProviderProps {
  children: React.ReactNode;
  brandingSettings: BrandingSettings;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ 
  children, 
  brandingSettings 
}) => {
  // Use modern font loading hook
  const { status: fontStatus } = useFontLoader(brandingSettings.theme.font_family, {
    weights: ['300', '400', '500', '600', '700'],
    display: 'swap',
    preload: true,
  });

  // Debug font loading
  console.log('Font loading status:', fontStatus, 'for font:', brandingSettings.theme.font_family);

  // Force global font application via CSS injection
  useEffect(() => {
    const styleId = 'global-font-override';
    let existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Primary font application with fallbacks */
      *, *::before, *::after {
        font-family: ${brandingSettings.theme.font_family} !important;
      }
      
      /* Specifically target Material-UI components */
      .MuiTypography-root,
      .MuiButton-root,
      .MuiTextField-root,
      .MuiInputBase-root,
      .MuiFormLabel-root,
      .MuiSelect-root,
      .MuiMenuItem-root,
      .MuiDialog-root,
      .MuiCard-root,
      .MuiChip-root,
      .MuiAppBar-root {
        font-family: ${brandingSettings.theme.font_family} !important;
      }

      /* Target body and html for global application */
      html, body, #root {
        font-family: ${brandingSettings.theme.font_family} !important;
      }

      /* Force repaint to ensure font is applied */
      .MuiTypography-root {
        -webkit-font-feature-settings: normal;
        font-feature-settings: normal;
        text-rendering: optimizeLegibility;
      }
    `;
    
    document.head.appendChild(style);

    // Force a repaint to ensure fonts are applied
    setTimeout(() => {
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }, 100);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [brandingSettings.theme.font_family]);

  const theme = createTheme({
    palette: {
      primary: {
        main: brandingSettings.theme.theme_color,
        contrastText: '#ffffff',
      },
      secondary: {
        main: brandingSettings.theme.button.secondary_color,
        contrastText: '#ffffff',
      },
      text: {
        primary: brandingSettings.theme.text_color,
        secondary: brandingSettings.theme.text_color + '80', // 50% opacity
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      // Custom color for accent (used for highlights, borders, etc.)
      info: {
        main: brandingSettings.theme.extra_light_color,
        contrastText: brandingSettings.theme.text_color,
      },
    },
    typography: {
      fontFamily: brandingSettings.theme.font_family,
      allVariants: {
        fontFamily: brandingSettings.theme.font_family,
      },
      h1: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      h2: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      h3: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      h4: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      h5: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      h6: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      body1: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      body2: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      subtitle1: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      subtitle2: { 
        fontFamily: `${brandingSettings.theme.font_family} !important`, 
        color: brandingSettings.theme.text_color 
      },
      caption: { 
        fontFamily: `${brandingSettings.theme.font_family} !important` 
      },
      button: { 
        fontFamily: `${brandingSettings.theme.font_family} !important` 
      },
      overline: { 
        fontFamily: `${brandingSettings.theme.font_family} !important` 
      },
    },
    components: {
      // Override default button styles
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: `${brandingSettings.theme.font_family} !important`,
          },
          contained: {
            backgroundColor: brandingSettings.theme.theme_color,
            color: '#ffffff',
            fontFamily: `${brandingSettings.theme.font_family} !important`,
            '&:hover': {
              backgroundColor: brandingSettings.theme.button.hover_color,
            },
          },
          outlined: {
            borderColor: brandingSettings.theme.theme_color,
            color: brandingSettings.theme.text_color,
            fontFamily: `${brandingSettings.theme.font_family} !important`,
            '&:hover': {
              borderColor: brandingSettings.theme.button.hover_color,
              backgroundColor: brandingSettings.theme.theme_color + '10', // 6% opacity
            },
          },
        },
      },
      // Override text field styles  
      MuiTextField: {
        styleOverrides: {
          root: {
            fontFamily: `${brandingSettings.theme.font_family} !important`,
            '& .MuiOutlinedInput-root': {
              fontFamily: `${brandingSettings.theme.font_family} !important`,
              '& fieldset': {
                borderColor: brandingSettings.theme.extra_light_color,
              },
              '&:hover fieldset': {
                borderColor: brandingSettings.theme.theme_color,
              },
              '&.Mui-focused fieldset': {
                borderColor: brandingSettings.theme.theme_color,
              },
            },
            '& .MuiInputLabel-root': {
              color: brandingSettings.theme.text_color,
              fontFamily: `${brandingSettings.theme.font_family} !important`,
              '&.Mui-focused': {
                color: brandingSettings.theme.theme_color,
              },
            },
          },
        },
      },
      // Add Typography component override
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: `${brandingSettings.theme.font_family} !important`,
          },
        },
      },
      // Add Card component override
      MuiCard: {
        styleOverrides: {
          root: {
            fontFamily: `${brandingSettings.theme.font_family} !important`,
          },
        },
      },
      // Add AppBar component override
      MuiAppBar: {
        styleOverrides: {
          root: {
            fontFamily: `${brandingSettings.theme.font_family} !important`,
          },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
