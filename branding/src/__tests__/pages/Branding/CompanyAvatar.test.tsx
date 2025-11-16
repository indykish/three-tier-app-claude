import React from 'react';
import { screen } from '@testing-library/react';
import { CompanyAvatar } from '@/pages/Branding/CompanyAvatar';
import { render, mockBrandingSettings } from '../../utils/test-utils';

describe('CompanyAvatar', () => {
  it('displays company initials', () => {
    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('TC')).toBeInTheDocument(); // "Test Company"
  });

  it('handles single word company name', () => {
    const singleWordSettings = {
      ...mockBrandingSettings,
      companyName: 'Amazon',
    };

    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: singleWordSettings,
    });

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('handles multi-word company name correctly', () => {
    const multiWordSettings = {
      ...mockBrandingSettings,
      companyName: 'International Business Machines Corporation',
    };

    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: multiWordSettings,
    });

    expect(screen.getByText('IB')).toBeInTheDocument(); // First two initials
  });

  it('uses custom size when provided', () => {
    render(<CompanyAvatar size={60} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const avatar = screen.getByText('TC').closest('div');
    expect(avatar).toHaveStyle({
      width: '60px',
      height: '60px',
    });
  });

  it('uses default size when not specified', () => {
    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const avatar = screen.getByText('TC').closest('div');
    expect(avatar).toHaveStyle({
      width: '40px',
      height: '40px',
    });
  });

  it('applies custom className', () => {
    render(<CompanyAvatar className="custom-avatar-class" />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const avatar = screen.getByText('TC').closest('div');
    expect(avatar).toHaveClass('custom-avatar-class');
  });

  it('uses brand primary color as background', () => {
    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const avatar = screen.getByText('TC').closest('div');
    expect(avatar).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.theme_color,
    });
  });

  it('handles empty company name gracefully', () => {
    const emptyNameSettings = {
      ...mockBrandingSettings,
      companyName: '',
    };

    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: emptyNameSettings,
    });

    // Should not crash, might display empty or default text
    const avatar = document.querySelector('[class*="MuiAvatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it('handles company name with special characters', () => {
    const specialCharSettings = {
      ...mockBrandingSettings,
      companyName: 'AT&T Inc.',
    };

    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: specialCharSettings,
    });

    expect(screen.getByText('AI')).toBeInTheDocument(); // "AT&T Inc." -> "AI"
  });

  it('converts initials to uppercase', () => {
    const lowercaseSettings = {
      ...mockBrandingSettings,
      companyName: 'apple computer',
    };

    render(<CompanyAvatar />, {
      withBranding: true,
      brandingSettings: lowercaseSettings,
    });

    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  // Note: Component requires BrandingProvider context, so no graceful degradation test needed

  it('scales font size with avatar size', () => {
    render(<CompanyAvatar size={80} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const avatar = screen.getByText('TC').closest('div');
    expect(avatar).toHaveStyle({
      fontSize: '32px', // size * 0.4
    });
  });
});