import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandingWizard } from '@/pages/Branding/BrandingWizard';
import { render, mockFunctions, mockFile } from '../../utils/test-utils';
import { BrandingStorage } from '@/services/brandingStorage';

// Mock the BrandingStorage service
jest.mock('@/services/brandingStorage', () => ({
  BrandingStorage: {
    save: jest.fn(),
  },
  fileToBase64: jest.fn().mockResolvedValue('data:image/png;base64,mockbase64'),
}));

// Mock the child components to focus on BrandingWizard logic
jest.mock('@/pages/Branding/CompanyInformationForm', () => ({
  CompanyInformationForm: ({ settings, onChange, primaryColor }: any) => (
    <div data-testid="company-info-form">
      <input
        data-testid="company-name-input"
        value={settings.companyName}
        onChange={(e) => onChange('companyName', e.target.value)}
        placeholder="Company Name"
      />
      <div data-testid="primary-color">{primaryColor}</div>
    </div>
  ),
}));

jest.mock('@/pages/Branding/LogoUploadForm', () => ({
  LogoUploadForm: ({ logoFile, onLogoChange, onError }: any) => (
    <div data-testid="logo-upload-form">
      <input
        data-testid="logo-upload-input"
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onLogoChange(file);
        }}
      />
      <button
        data-testid="trigger-error-btn"
        onClick={() => onError('Test error')}
      >
        Trigger Error
      </button>
      {logoFile && <div data-testid="logo-file-name">{logoFile.name}</div>}
    </div>
  ),
}));

jest.mock('@/pages/Branding/BrandColorsForm', () => ({
  BrandColorsForm: ({ settings, onColorChange, onSecondaryColorChange }: any) => (
    <div data-testid="brand-colors-form">
      <input
        data-testid="primary-color-input"
        value={settings.theme.theme_color}
        onChange={(e) => onColorChange('theme_color', e.target.value)}
        placeholder="Primary Color"
      />
      <input
        data-testid="secondary-color-input"
        value={settings.theme.button.secondary_color}
        onChange={(e) => onSecondaryColorChange(e.target.value)}
        placeholder="Secondary Color"
      />
    </div>
  ),
}));

jest.mock('@/pages/Branding/TypographyForm', () => ({
  TypographyForm: ({ settings, onFontChange }: any) => (
    <div data-testid="typography-form">
      <input
        data-testid="font-input"
        value={settings.theme.font_family}
        onChange={(e) => onFontChange(e.target.value)}
        placeholder="Font Family"
      />
    </div>
  ),
}));

jest.mock('@/pages/Branding/Previewer', () => ({
  Previewer: ({ settings }: any) => (
    <div data-testid="previewer">
      <div data-testid="preview-company-name">{settings.companyName}</div>
      <div data-testid="preview-theme-color">{settings.theme.theme_color}</div>
    </div>
  ),
}));

const mockBrandingStorage = BrandingStorage as jest.Mocked<typeof BrandingStorage>;

describe('BrandingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form sections', () => {
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    expect(screen.getByText('🎨 Branding Setup Wizard')).toBeInTheDocument();
    expect(screen.getByText('Configure your company branding and theme colors')).toBeInTheDocument();
    expect(screen.getByTestId('company-info-form')).toBeInTheDocument();
    expect(screen.getByTestId('logo-upload-form')).toBeInTheDocument();
    expect(screen.getByTestId('brand-colors-form')).toBeInTheDocument();
    expect(screen.getByTestId('typography-form')).toBeInTheDocument();
    expect(screen.getByTestId('previewer')).toBeInTheDocument();
  });

  it('updates company name and reflects in preview', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const companyInput = screen.getByTestId('company-name-input');
    const previewCompanyName = screen.getByTestId('preview-company-name');

    await user.clear(companyInput);
    await user.type(companyInput, 'Acme Corp');

    expect(companyInput).toHaveValue('Acme Corp');
    expect(previewCompanyName).toHaveTextContent('Acme Corp');
  });

  it('updates theme colors and reflects in preview', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const primaryColorInput = screen.getByTestId('primary-color-input');
    const previewThemeColor = screen.getByTestId('preview-theme-color');

    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, '#ff0000');

    expect(primaryColorInput).toHaveValue('#ff0000');
    expect(previewThemeColor).toHaveTextContent('#ff0000');
  });

  it('handles logo file upload', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const logoInput = screen.getByTestId('logo-upload-input');
    
    await user.upload(logoInput, mockFile);

    expect(screen.getByTestId('logo-file-name')).toHaveTextContent('test.png');
  });

  it('handles logo upload errors', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const triggerErrorBtn = screen.getByTestId('trigger-error-btn');
    
    await user.click(triggerErrorBtn);

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('disables save button when company name is empty', () => {
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const saveButton = screen.getByRole('button', { name: /save branding & continue/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when company name is provided', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const companyInput = screen.getByTestId('company-name-input');
    const saveButton = screen.getByRole('button', { name: /save branding & continue/i });

    await user.type(companyInput, 'Test Company');

    expect(saveButton).not.toBeDisabled();
  });

  it('shows loading state during save', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    // Setup company name first
    const companyInput = screen.getByTestId('company-name-input');
    await user.type(companyInput, 'Test Company');

    // Mock a delayed save operation
    mockBrandingStorage.save.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const saveButton = screen.getByRole('button', { name: /save branding & continue/i });
    await user.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('saves settings and calls onComplete successfully', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    // Fill in company name
    const companyInput = screen.getByTestId('company-name-input');
    await user.type(companyInput, 'Test Company');

    // Upload a logo
    const logoInput = screen.getByTestId('logo-upload-input');
    await user.upload(logoInput, mockFile);

    // Change colors
    const primaryColorInput = screen.getByTestId('primary-color-input');
    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, '#ff0000');

    const saveButton = screen.getByRole('button', { name: /save branding & continue/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockBrandingStorage.save).toHaveBeenCalledTimes(1);
      expect(mockFunctions.onComplete).toHaveBeenCalledTimes(1);
    });

    const savedSettings = mockBrandingStorage.save.mock.calls[0][0];
    expect(savedSettings.companyName).toBe('Test Company');
    expect(savedSettings.theme.theme_color).toBe('#ff0000');
    expect(savedSettings.theme.logos.websiteLogo).toBe('data:image/png;base64,mockbase64');
  });

  it.skip('handles save errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Clear previous mock calls
    mockFunctions.onComplete.mockClear();
    mockBrandingStorage.save.mockClear();
    
    // Mock save failure before rendering
    mockBrandingStorage.save.mockImplementation(() => Promise.reject(new Error('Save failed')));
    
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    // Setup company name
    const companyInput = screen.getByTestId('company-name-input');
    await user.type(companyInput, 'Test Company');

    const saveButton = screen.getByRole('button', { name: /save branding & continue/i });
    await user.click(saveButton);

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to save branding settings. Please try again.')).toBeInTheDocument();
    });

    // Wait a bit more to ensure all async operations are complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check that onComplete was not called
    expect(mockFunctions.onComplete).not.toHaveBeenCalled();
    
    // Also verify that the save was attempted
    expect(mockBrandingStorage.save).toHaveBeenCalledTimes(1);
  });

  it('updates secondary colors correctly', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const secondaryColorInput = screen.getByTestId('secondary-color-input');
    
    await user.clear(secondaryColorInput);
    await user.type(secondaryColorInput, '#00ff00');

    expect(secondaryColorInput).toHaveValue('#00ff00');
  });

  it('updates font family correctly', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const fontInput = screen.getByTestId('font-input');
    
    await user.clear(fontInput);
    await user.type(fontInput, 'Roboto, sans-serif');

    expect(fontInput).toHaveValue('Roboto, sans-serif');
  });

  it('applies primary color changes to child components', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    const primaryColorInput = screen.getByTestId('primary-color-input');
    
    await user.clear(primaryColorInput);
    await user.type(primaryColorInput, '#ff0000');

    // Check that the primary color is passed to child components
    expect(screen.getByTestId('primary-color')).toHaveTextContent('#ff0000');
  });

  it('clears error when logo is successfully uploaded', async () => {
    const user = userEvent.setup();
    render(<BrandingWizard onComplete={mockFunctions.onComplete} />);

    // First trigger an error
    const triggerErrorBtn = screen.getByTestId('trigger-error-btn');
    await user.click(triggerErrorBtn);
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // Then upload a logo to clear the error
    const logoInput = screen.getByTestId('logo-upload-input');
    await user.upload(logoInput, mockFile);

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });
});