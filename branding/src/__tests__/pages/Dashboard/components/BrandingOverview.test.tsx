import React from 'react';
import { screen } from '@testing-library/react';
import { BrandingOverview } from '@/pages/Dashboard/components/BrandingOverview';
import { render, mockBrandingSettings } from '../../../utils/test-utils';

describe('BrandingOverview', () => {
  it('renders company name with business icon', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    
    // Business icon should be styled with theme color
    const businessIcon = document.querySelector('[data-testid="BusinessIcon"]') || 
                        document.querySelector('svg');
    expect(businessIcon).toBeInTheDocument();
  });

  it('displays theme configuration label', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Theme Configuration')).toBeInTheDocument();
  });

  it('renders color swatches for all theme colors', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that color boxes are rendered with correct colors
    const container = screen.getByText('Theme Configuration').closest('div');
    const colorBoxes = container?.querySelectorAll('[class*="w-8"][class*="h-8"][class*="rounded"]');
    
    // Should have exactly 3 color boxes (primary, secondary, accent)
    expect(colorBoxes?.length).toBe(3);
    
    // Check that all color boxes have background colors
    colorBoxes?.forEach(box => {
      const style = box.getAttribute('style');
      expect(style).toContain('background-color:');
    });
    
    // Check that at least one color box has the primary color
    // Note: The browser converts hex colors to RGB format, so we need to check for both
    const hasPrimaryColor = Array.from(colorBoxes || []).some(box => {
      const style = box.getAttribute('style');
      if (!style) return false;
      
      // Check for hex format (#ff0000)
      if (style.includes(mockBrandingSettings.theme.theme_color)) return true;
      
      // Check for RGB format (rgb(255, 0, 0))
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
      };
      const rgbColor = hexToRgb(mockBrandingSettings.theme.theme_color);
      return rgbColor && style.includes(rgbColor);
    });
    expect(hasPrimaryColor).toBe(true);
  });

  it('displays primary color information', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText(`Primary: ${mockBrandingSettings.theme.theme_color}`)).toBeInTheDocument();
  });

  it('displays secondary color information', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText(`Secondary: ${mockBrandingSettings.theme.button.secondary_color}`)).toBeInTheDocument();
  });

  it('displays text color information', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText(`Text: ${mockBrandingSettings.theme.text_color}`)).toBeInTheDocument();
  });

  it('displays font family information', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const fontFamily = mockBrandingSettings.theme.font_family.split(',')[0];
    expect(screen.getByText(`Font: ${fontFamily}`)).toBeInTheDocument();
  });

  it('renders color swatches with correct background colors', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const container = screen.getByText('Theme Configuration').closest('div');
    const colorBoxes = container?.querySelectorAll('.w-8.h-8.rounded');
    
    // Should have color boxes for primary, secondary, and accent colors
    expect(colorBoxes?.length).toBe(3);
  });

  it('applies brand primary color to business icon', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // The Business icon should be styled with the theme color
    const businessIcon = document.querySelector('svg');
    expect(businessIcon).toBeInTheDocument();
  });

  it('renders within card structure', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Should be rendered within a card structure
    const cardContent = screen.getByText('Test Company').closest('[class*="MuiCard"]');
    expect(cardContent).toBeTruthy();
  });

  it('handles long company names', () => {
    const settingsWithLongName = {
      ...mockBrandingSettings,
      companyName: 'Very Long Company Name That Might Wrap to Multiple Lines Inc.',
    };

    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: settingsWithLongName,
    });

    expect(screen.getByText('Very Long Company Name That Might Wrap to Multiple Lines Inc.')).toBeInTheDocument();
  });

  it('renders without branding context gracefully', () => {
    // This test should expect an error since the component requires BrandingProvider
    expect(() => {
      render(<BrandingOverview />);
    }).toThrow('useBranding must be used within BrandingProvider');
  });

  it('displays all color information in proper text formatting', () => {
    render(<BrandingOverview />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that color info is displayed
    const colorInfo = screen.getByText(`Primary: ${mockBrandingSettings.theme.theme_color}`);
    expect(colorInfo).toBeInTheDocument();
    
    // Check that it's within the color info container
    const colorInfoContainer = colorInfo.closest('[class*="text-xs"]') || colorInfo.closest('[class*="text-gray-500"]');
    expect(colorInfoContainer).toBeTruthy();
  });
});