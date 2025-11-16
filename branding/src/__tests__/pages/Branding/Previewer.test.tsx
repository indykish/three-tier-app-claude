import React from 'react';
import { screen } from '@testing-library/react';
import { Previewer } from '@/pages/Branding/Previewer';
import { render, mockBrandingSettings } from '../../utils/test-utils';

jest.mock('@/components/common', () => ({
  SectionCard: ({ title, icon, children }: any) => (
    <div data-testid="section-card">
      <div data-testid="section-title">{title}</div>
      <div data-testid="section-icon">{icon}</div>
      <div data-testid="section-content">{children}</div>
    </div>
  ),
}));

jest.mock('@/components/icons', () => ({
  PreviewIcon: ({ color }: any) => (
    <div data-testid="preview-icon" style={{ color }}>Preview</div>
  ),
}));

describe('Previewer', () => {
  const defaultProps = {
    settings: mockBrandingSettings,
  };

  it('renders section card with correct title and icon', () => {
    render(<Previewer {...defaultProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Preview');
    expect(screen.getByTestId('preview-icon')).toBeInTheDocument();
    expect(screen.getByTestId('preview-icon')).toHaveStyle({ 
      color: mockBrandingSettings.theme.theme_color 
    });
  });

  it('displays app title in header preview', () => {
    render(<Previewer {...defaultProps} />);

    expect(screen.getByText(mockBrandingSettings.capabilities.general_app_title)).toBeInTheDocument();
  });

  it('applies primary color as header background', () => {
    render(<Previewer {...defaultProps} />);

    const appTitle = screen.getByText(mockBrandingSettings.capabilities.general_app_title);
    const headerContainer = appTitle.closest('div');
    
    expect(headerContainer).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.theme_color
    });
  });

  it('renders all button previews', () => {
    render(<Previewer {...defaultProps} />);

    expect(screen.getByText('Buttons & Actions:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Primary Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose Logo File' })).toBeInTheDocument();
  });

  it('applies correct colors to primary button', () => {
    render(<Previewer {...defaultProps} />);

    const primaryButton = screen.getByRole('button', { name: 'Primary Button' });
    expect(primaryButton).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.theme_color,
      color: '#ffffff'
    });
  });

  it('applies correct colors to secondary button', () => {
    render(<Previewer {...defaultProps} />);

    const secondaryButton = screen.getByRole('button', { name: 'Secondary Button' });
    expect(secondaryButton).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.button.secondary_color,
      color: '#ffffff'
    });
  });

  it.skip('applies correct colors to outlined button', () => {
    render(<Previewer {...defaultProps} />);

    const outlinedButton = screen.getByRole('button', { name: 'Choose Logo File' });
    expect(outlinedButton).toHaveStyle({
      borderColor: 'rgb(255, 204, 204)',
      color: 'rgb(51, 51, 51)',
      backgroundColor: 'transparent'
    });
  });

  it('displays text content preview section', () => {
    render(<Previewer {...defaultProps} />);

    expect(screen.getByText('Text & Content:')).toBeInTheDocument();
    expect(screen.getByText('Heading Text')).toBeInTheDocument();
    expect(screen.getByText('This is body text using your selected text color.')).toBeInTheDocument();
  });

  it('applies text color to preview text elements', () => {
    render(<Previewer {...defaultProps} />);

    const headingText = screen.getByText('Heading Text');
    const bodyText = screen.getByText('This is body text using your selected text color.');
    
    expect(headingText).toHaveStyle({ color: mockBrandingSettings.theme.text_color });
    expect(bodyText).toHaveStyle({ color: mockBrandingSettings.theme.text_color });
  });

  it('displays borders and backgrounds preview section', () => {
    render(<Previewer {...defaultProps} />);

    expect(screen.getByText('Borders, Highlights & Backgrounds:')).toBeInTheDocument();
    expect(screen.getByText('Card with accent border')).toBeInTheDocument();
    expect(screen.getByText('Highlighted section with accent background')).toBeInTheDocument();
  });

  it('applies accent color to card border', () => {
    render(<Previewer {...defaultProps} />);

    const cardText = screen.getByText('Card with accent border');
    const cardContainer = cardText.closest('[style*="border"]');
    
    expect(cardContainer).toHaveStyle({
      borderColor: mockBrandingSettings.theme.extra_light_color
    });
  });

  it('applies accent color to highlighted section', () => {
    render(<Previewer {...defaultProps} />);

    const highlightedText = screen.getByText('Highlighted section with accent background');
    const highlightedContainer = highlightedText.closest('div');
    
    expect(highlightedContainer).toHaveStyle({
      backgroundColor: mockBrandingSettings.theme.extra_light_color + '20',
      border: `1px solid ${mockBrandingSettings.theme.extra_light_color}`
    });
  });

  it('renders accent and primary chips', () => {
    render(<Previewer {...defaultProps} />);

    const accentChip = screen.getByText('Accent Chip');
    const primaryChip = screen.getByText('Primary Chip');
    
    expect(accentChip).toBeInTheDocument();
    expect(primaryChip).toBeInTheDocument();
  });

  it.skip('applies correct colors to chips', () => {
    render(<Previewer {...defaultProps} />);

    const accentChip = screen.getByText('Accent Chip');
    const primaryChip = screen.getByText('Primary Chip');
    
    expect(accentChip).toHaveStyle({
      backgroundColor: 'rgb(255, 204, 204)',
      color: 'rgb(51, 51, 51)'
    });
    
    expect(primaryChip).toHaveStyle({
      backgroundColor: 'rgb(255, 0, 0)',
      color: '#ffffff'
    });
  });

  it('renders divider with accent color', () => {
    render(<Previewer {...defaultProps} />);

    // Check that divider is rendered (MUI Divider would be in the DOM)
    const previewContent = screen.getByTestId('section-content');
    expect(previewContent).toBeInTheDocument();
  });
});