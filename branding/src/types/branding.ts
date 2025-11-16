export interface BrandingColors {
  primary: string;
  secondary: string;
  text: string;
  primaryDark: string;
  extraLight: string;
}

export interface BrandingLogos {
  websiteLogo?: string; // base64 data URL
  favIcon?: string;
  websiteLogoHeight?: string;
}

export interface BrandingSettings {
  id?: string;
  organizationId?: string;
  companyName: string;
  companyUrl?: string;
  theme: {
    theme_color: string;        // Primary brand color - main CTA buttons, links
    primary_dark_color: string; // Darker shade for hover states
    extra_light_color: string;  // Accent color - borders, highlights, subtle backgrounds
    text_color: string;         // Main text color for all content
    font_family: string;        // Primary font family for all text
    button: {
      primary_color: string;    // Same as theme_color (for consistency)
      secondary_color: string;  // Alternative action buttons, less important CTAs
      hover_color: string;      // Hover state for buttons
      border_color: string;     // Default border color for forms/cards
    };
    logos: BrandingLogos;
  };
  capabilities: {
    general_app_title: string;
  };
}

export const DEFAULT_BRANDING: BrandingSettings = {
  companyName: '',
  theme: {
    theme_color: '#1976d2',
    primary_dark_color: '#1565c0',
    extra_light_color: '#bbdefb',
    text_color: '#000000',
    font_family: 'Roboto, Arial, sans-serif',
    button: {
      primary_color: '#1976d2',
      secondary_color: '#9c27b0',
      hover_color: '#1565c0',
      border_color: '#cccccc',
    },
    logos: {},
  },
  capabilities: {
    general_app_title: 'My Bank',
  },
};
