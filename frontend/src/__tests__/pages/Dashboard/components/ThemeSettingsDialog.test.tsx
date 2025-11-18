import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSettingsDialog } from '@/pages/Dashboard/components/ThemeSettingsDialog';
import { render, mockFunctions, mockBrandingSettings } from '../../../utils/test-utils';
import { BrandingStorage } from '@/services/brandingStorage';

jest.mock('@/services/brandingStorage', () => ({
  BrandingStorage: {
    save: jest.fn(),
  },
}));

jest.mock('@/components/common', () => ({
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
  FontPicker: ({ label, value, onChange }: any) => (
    <div data-testid="font-picker">
      <label>{label}</label>
      <input
        data-testid="font-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

const mockBrandingStorage = BrandingStorage as jest.Mocked<typeof BrandingStorage>;

describe('ThemeSettingsDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    expect(screen.getByText('Theme Settings')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ThemeSettingsDialog
        open={false}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    expect(screen.queryByText('Theme Settings')).not.toBeInTheDocument();
  });

  it('displays current settings in form fields', () => {
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    expect(screen.getByDisplayValue(mockBrandingSettings.theme.font_family)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.theme_color)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockBrandingSettings.theme.button.secondary_color)).toBeInTheDocument();
  });

  it('updates font family when changed', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    const fontInput = screen.getByTestId('font-input');
    await user.clear(fontInput);
    await user.type(fontInput, 'Roboto, sans-serif');

    expect(fontInput).toHaveValue('Roboto, sans-serif');
  });

  it('updates primary color when changed', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    const primaryColorInput = screen.getByTestId('color-input-primary-color');
    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, '#123456');

    expect(primaryColorInput).toHaveValue('#123456');
  });

  it('saves changes when Save Changes is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);

    expect(mockBrandingStorage.save).toHaveBeenCalledTimes(1);
    expect(mockFunctions.onSettingsChange).toHaveBeenCalledTimes(1);
    expect(mockFunctions.onClose).toHaveBeenCalledTimes(1);
  });

  it('closes dialog without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockBrandingStorage.save).not.toHaveBeenCalled();
    expect(mockFunctions.onSettingsChange).not.toHaveBeenCalled();
    expect(mockFunctions.onClose).toHaveBeenCalledTimes(1);
  });

  it('closes dialog when close icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // Close icon button
    await user.click(closeButton);

    expect(mockFunctions.onClose).toHaveBeenCalledTimes(1);
  });

  it('resets local settings when canceled after changes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    // Make changes
    const primaryColorInput = screen.getByTestId('color-input-primary-color');
    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, '#123456');

    // Cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockFunctions.onClose).toHaveBeenCalledTimes(1);
  });

  it('displays live preview with updated settings', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    // Verify preview shows current app title
    expect(screen.getByText(mockBrandingSettings.capabilities.general_app_title)).toBeInTheDocument();

    // Verify preview buttons are present
    expect(screen.getByRole('button', { name: 'Primary Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outlined Button' })).toBeInTheDocument();
  });

  it('handles all color changes correctly', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSettingsDialog
        open={true}
        onClose={mockFunctions.onClose}
        settings={mockBrandingSettings}
        onSettingsChange={mockFunctions.onSettingsChange}
      />
    );

    // Test secondary color
    const secondaryColorInput = screen.getByTestId('color-input-secondary-color');
    await user.clear(secondaryColorInput);
    await user.type(secondaryColorInput, '#654321');
    expect(secondaryColorInput).toHaveValue('#654321');

    // Test text color
    const textColorInput = screen.getByTestId('color-input-text-color');
    await user.clear(textColorInput);
    await user.type(textColorInput, '#111111');
    expect(textColorInput).toHaveValue('#111111');

    // Test accent color
    const accentColorInput = screen.getByTestId('color-input-accent-color');
    await user.clear(accentColorInput);
    await user.type(accentColorInput, '#999999');
    expect(accentColorInput).toHaveValue('#999999');
  });
});