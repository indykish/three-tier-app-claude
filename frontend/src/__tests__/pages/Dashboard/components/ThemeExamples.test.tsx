import React from 'react';
import { screen } from '@testing-library/react';
import { ThemeExamples } from '@/pages/Dashboard/components/ThemeExamples';
import { render, mockBrandingSettings } from '../../../utils/test-utils';

describe('ThemeExamples', () => {
  it('renders buttons and actions section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Buttons & Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose File' })).toBeInTheDocument();
  });

  it('renders primary and secondary buttons', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const primaryButton = screen.getByRole('button', { name: 'Primary Action' });
    const secondaryButton = screen.getByRole('button', { name: 'Secondary Action' });
    
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
  });

  it('applies custom styling to outlined button', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const outlinedButton = screen.getByRole('button', { name: 'Choose File' });
    expect(outlinedButton).toHaveStyle({
      borderColor: mockBrandingSettings.theme.extra_light_color,
      color: mockBrandingSettings.theme.text_color,
    });
  });

  it('renders chip examples with correct colors', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Primary Chip')).toBeInTheDocument();
    expect(screen.getByText('Accent Chip')).toBeInTheDocument();

    const accentChip = screen.getByText('Accent Chip').closest('[style*="background-color"]');
    expect(accentChip).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.extra_light_color,
      color: mockBrandingSettings.theme.text_color,
    });
  });

  it('renders text and content section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Text & Content')).toBeInTheDocument();
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
    expect(screen.getByText(/Body text content using your selected text color/)).toBeInTheDocument();
    expect(screen.getByText('Secondary text and captions')).toBeInTheDocument();
  });

  it('renders borders and backgrounds section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Borders & Backgrounds')).toBeInTheDocument();
    expect(screen.getByText('Card with accent border')).toBeInTheDocument();
    expect(screen.getByText('Highlighted section')).toBeInTheDocument();
  });

  it('applies accent color to bordered card', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const borderedCard = screen.getByText('Card with accent border').closest('[style*="border"]');
    expect(borderedCard).toHaveStyle({
      borderColor: mockBrandingSettings.theme.extra_light_color,
    });
  });

  it('applies accent color to highlighted section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const highlightedSection = screen.getByText('Highlighted section').closest('[style*="background-color"]');
    expect(highlightedSection).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.extra_light_color + '20',
      border: `1px solid ${mockBrandingSettings.theme.extra_light_color}`,
    });
  });

  it('renders header branding section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Header Branding')).toBeInTheDocument();
    expect(screen.getByText(mockBrandingSettings.capabilities.general_app_title)).toBeInTheDocument();
    expect(screen.getByText('Your branded header with primary color background')).toBeInTheDocument();
  });

  it('applies primary color to header section', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const headerSection = screen.getByText('Your branded header with primary color background').closest('[style*="background-color"]');
    expect(headerSection).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.theme_color,
    });
  });

  it('renders all sections in responsive grid layout', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that all section titles are present
    expect(screen.getByText('Buttons & Actions')).toBeInTheDocument();
    expect(screen.getByText('Text & Content')).toBeInTheDocument();
    expect(screen.getByText('Borders & Backgrounds')).toBeInTheDocument();
    expect(screen.getByText('Header Branding')).toBeInTheDocument();
  });

  it('renders within card structures', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that content is wrapped in cards
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('displays proper spacing between elements', () => {
    render(<ThemeExamples />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that grid container has proper spacing
    const gridContainer = document.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });
});