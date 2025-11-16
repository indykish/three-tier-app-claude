import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypographyForm } from '@/pages/Branding/TypographyForm';
import { render, mockBrandingSettings, mockFunctions } from '../../utils/test-utils';

jest.mock('@/components/common', () => ({
  SectionCard: ({ title, icon, children }: any) => (
    <div data-testid="section-card">
      <div data-testid="section-title">{title}</div>
      <div data-testid="section-icon">{icon}</div>
      <div data-testid="section-content">{children}</div>
    </div>
  ),
  FontPicker: ({ value, onChange }: any) => (
    <div>
      <input
        data-testid="font-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

describe('TypographyForm', () => {
  const defaultProps = {
    settings: mockBrandingSettings,
    onFontChange: mockFunctions.onFontChange,
    primaryColor: '#ff0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section card with correct title and icon', () => {
    render(<TypographyForm {...defaultProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Typography');
    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
  });

  it('renders typography icon with correct color', () => {
    render(<TypographyForm {...defaultProps} />);

    // Check that the SVG icon is rendered
    const iconContainer = screen.getByTestId('section-icon');
    const svgElement = iconContainer.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    // Check that the path has the correct fill color
    const pathElement = svgElement?.querySelector('path');
    expect(pathElement).toHaveAttribute('fill', '#ff0000');
  });

  it('renders font picker with correct props', () => {
    render(<TypographyForm {...defaultProps} />);

    expect(screen.getByTestId('font-input')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.font_family)).toBeInTheDocument();
  });

  it.skip('calls onFontChange when font is changed', async () => {
    const user = userEvent.setup();
    render(<TypographyForm {...defaultProps} />);

    const fontInput = screen.getByTestId('font-input');
    await user.type(fontInput, 'Roboto, sans-serif');

    expect(mockFunctions.onFontChange).toHaveBeenCalledWith('Roboto, sans-serif');
  });

  it('displays helpful description text', () => {
    render(<TypographyForm {...defaultProps} />);

    expect(screen.getByText('This font will be used for all text throughout your application')).toBeInTheDocument();
  });

  it('renders with proper component structure', () => {
    render(<TypographyForm {...defaultProps} />);

    expect(screen.getByTestId('section-card')).toBeInTheDocument();
    expect(screen.getByTestId('font-input')).toBeInTheDocument();
  });

  it.skip('handles font family changes correctly', async () => {
    const user = userEvent.setup();
    render(<TypographyForm {...defaultProps} />);

    const fontInput = screen.getByTestId('font-input');
    await user.clear(fontInput);
    await user.type(fontInput, 'Helvetica');
    expect(mockFunctions.onFontChange).toHaveBeenCalledWith('Helvetica');

    await user.clear(fontInput);
    await user.type(fontInput, 'Georgia, serif');
    expect(mockFunctions.onFontChange).toHaveBeenCalledWith('Georgia, serif');
  });

  it('uses custom primary color for icon', () => {
    const customProps = {
      ...defaultProps,
      primaryColor: '#123456',
    };

    render(<TypographyForm {...customProps} />);

    const iconContainer = screen.getByTestId('section-icon');
    const pathElement = iconContainer.querySelector('path');
    expect(pathElement).toHaveAttribute('fill', '#123456');
  });

  it('renders typography icon with correct viewBox and dimensions', () => {
    render(<TypographyForm {...defaultProps} />);

    const iconContainer = screen.getByTestId('section-icon');
    const svgElement = iconContainer.querySelector('svg');
    
    expect(svgElement).toHaveAttribute('width', '24');
    expect(svgElement).toHaveAttribute('height', '24');
    expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svgElement).toHaveAttribute('fill', 'none');
  });
});