import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandColorsForm } from '@/pages/Branding/BrandColorsForm';
import { render, mockBrandingSettings, mockFunctions } from '../../utils/test-utils';
import { fireEvent } from '@testing-library/react';

jest.mock('@/components/common', () => ({
  SectionCard: ({ title, icon, children }: any) => (
    <div data-testid="section-card">
      <div data-testid="section-title">{title}</div>
      <div data-testid="section-icon">{icon}</div>
      <div data-testid="section-content">{children}</div>
    </div>
  ),
  ColorPicker: ({ label, value, onChange }: any) => (
    <div data-testid="color-picker">
      <label>{label}</label>
      <input
        data-testid={`color-input-${label.toLowerCase().replace(' ', '-')}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

jest.mock('@/components/icons', () => ({
  ColorLensIcon: ({ color }: any) => (
    <div data-testid="color-lens-icon" style={{ color }}>ColorLens</div>
  ),
}));

describe('BrandColorsForm', () => {
  const defaultProps = {
    settings: mockBrandingSettings,
    onColorChange: mockFunctions.onChange,
    onSecondaryColorChange: mockFunctions.onSecondaryColorChange,
    primaryColor: '#ff0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section card with correct title and icon', () => {
    render(<BrandColorsForm {...defaultProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Brand Colors');
    expect(screen.getByTestId('color-lens-icon')).toBeInTheDocument();
    expect(screen.getByTestId('color-lens-icon')).toHaveStyle({ color: '#ff0000' });
  });

  it('renders all color picker fields', () => {
    render(<BrandColorsForm {...defaultProps} />);

    expect(screen.getByText('Primary Color')).toBeInTheDocument();
    expect(screen.getByText('Secondary Color')).toBeInTheDocument();
    expect(screen.getByText('Text Color')).toBeInTheDocument();
    expect(screen.getByText('Accent Color')).toBeInTheDocument();
  });

  it('displays current color values', () => {
    render(<BrandColorsForm {...defaultProps} />);

    expect(screen.getByDisplayValue(mockBrandingSettings.theme.theme_color)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.button.secondary_color)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.text_color)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.extra_light_color)).toBeInTheDocument();
  });

  it('calls onColorChange when primary color is changed', async () => {
    render(<BrandColorsForm {...defaultProps} />);

    const primaryColorInput = screen.getByTestId('color-input-primary-color');
    fireEvent.change(primaryColorInput, { target: { value: '#123456' } });

    expect(mockFunctions.onChange).toHaveBeenCalledWith('theme_color', '#123456');
  });

  it('calls onSecondaryColorChange when secondary color is changed', async () => {
    render(<BrandColorsForm {...defaultProps} />);

    const secondaryColorInput = screen.getByTestId('color-input-secondary-color');
    fireEvent.change(secondaryColorInput, { target: { value: '#654321' } });

    expect(mockFunctions.onSecondaryColorChange).toHaveBeenCalledWith('#654321');
  });

  it('calls onColorChange when accent color is changed', async () => {
    render(<BrandColorsForm {...defaultProps} />);

    const accentColorInput = screen.getByTestId('color-input-accent-color');
    fireEvent.change(accentColorInput, { target: { value: '#999999' } });

    expect(mockFunctions.onChange).toHaveBeenCalledWith('extra_light_color', '#999999');
  });

  it('displays helpful descriptions for each color', () => {
    render(<BrandColorsForm {...defaultProps} />);

    expect(screen.getByText('Main brand color for buttons & links')).toBeInTheDocument();
    expect(screen.getByText('Alternative buttons & actions')).toBeInTheDocument();
    expect(screen.getByText('Main text & content color')).toBeInTheDocument();
    expect(screen.getByText('Borders, highlights & backgrounds')).toBeInTheDocument();
  });

  it('renders with proper grid layout', () => {
    render(<BrandColorsForm {...defaultProps} />);

    const colorPickers = screen.getAllByTestId('color-picker');
    expect(colorPickers).toHaveLength(4);
  });
});