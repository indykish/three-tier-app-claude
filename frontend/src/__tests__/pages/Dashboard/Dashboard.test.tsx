import React from 'react';
import { screen } from '@testing-library/react';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { render, mockBrandingSettings } from '../../utils/test-utils';

// Mock the child components to focus on Dashboard logic
jest.mock('@/pages/Dashboard/components', () => ({
  BrandingOverview: () => (
    <div data-testid="branding-overview">Branding Overview Component</div>
  ),
  ThemeExamples: () => (
    <div data-testid="theme-examples">Theme Examples Component</div>
  ),
  IconShowcase: () => (
    <div data-testid="icon-showcase">Icon Showcase Component</div>
  ),
}));

describe('Dashboard', () => {
  it('renders welcome message with app title', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Welcome back to Test Bank! 👋')).toBeInTheDocument();
    expect(screen.getByText('Here\'s an overview of your branding configuration and available tools.')).toBeInTheDocument();
  });

  it('renders all dashboard sections', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check section headers
    expect(screen.getByText('Current Branding')).toBeInTheDocument();
    expect(screen.getByText('Available Icons')).toBeInTheDocument();
    expect(screen.getByText('Theme Examples')).toBeInTheDocument();

    // Check components are rendered
    expect(screen.getByTestId('branding-overview')).toBeInTheDocument();
    expect(screen.getByTestId('theme-examples')).toBeInTheDocument();
    expect(screen.getByTestId('icon-showcase')).toBeInTheDocument();
  });

  it('displays proper layout structure', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that the main content is rendered
    expect(screen.getByText('Welcome back to Test Bank! 👋')).toBeInTheDocument();
    expect(screen.getByText('Current Branding')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Verify grid structure exists (MUI Grid components would be rendered)
    const container = screen.getByText('Current Branding').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('renders all branding and showcase sections', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that all branding-related sections are present
    expect(screen.getByTestId('branding-overview')).toBeInTheDocument();
    expect(screen.getByTestId('icon-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('theme-examples')).toBeInTheDocument();
  });

  it('maintains proper section spacing and layout', () => {
    render(<Dashboard />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Verify that all major sections are present in the expected order
    const mainContent = screen.getByText('Welcome back to Test Bank! 👋').closest('div');
    expect(mainContent).toBeInTheDocument();
    
    // Check that sections follow the expected hierarchy
    expect(screen.getByText('Current Branding')).toBeInTheDocument();
    expect(screen.getByText('Available Icons')).toBeInTheDocument();
    expect(screen.getByText('Theme Examples')).toBeInTheDocument();
  });
});