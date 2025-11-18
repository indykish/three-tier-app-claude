import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyInformationForm } from '@/pages/Branding/CompanyInformationForm';
import { render, mockBrandingSettings, mockFunctions } from '../../utils/test-utils';

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
  BusinessIcon: ({ color }: any) => (
    <div data-testid="business-icon" style={{ color }}>Business</div>
  ),
}));

describe('CompanyInformationForm', () => {
  const defaultProps = {
    settings: mockBrandingSettings,
    onChange: mockFunctions.onChange,
    primaryColor: '#ff0000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section card with correct title and icon', () => {
    render(<CompanyInformationForm {...defaultProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Company Information');
    expect(screen.getByTestId('business-icon')).toBeInTheDocument();
    expect(screen.getByTestId('business-icon')).toHaveStyle({ color: '#ff0000' });
  });

  it.skip('renders company name field with current value', () => {
    render(<CompanyInformationForm {...defaultProps} />);

    const companyNameField = screen.getByLabelText('Company Name');
    expect(companyNameField).toBeInTheDocument();
    expect(companyNameField).toHaveValue(mockBrandingSettings.companyName);
    expect(companyNameField).toBeRequired();
  });

  it('renders company website field with current value', () => {
    render(<CompanyInformationForm {...defaultProps} />);

    const companyUrlField = screen.getByLabelText('Company Website (optional)');
    expect(companyUrlField).toBeInTheDocument();
    expect(companyUrlField).toHaveValue(mockBrandingSettings.companyUrl);
    expect(companyUrlField).toHaveAttribute('placeholder', 'https://example.com');
  });

  it.skip('calls onChange when company name is changed', async () => {
    const user = userEvent.setup();
    render(<CompanyInformationForm {...defaultProps} />);

    const companyNameField = screen.getByLabelText('Company Name');
    await user.clear(companyNameField);
    await user.type(companyNameField, 'New Company Name');

    expect(mockFunctions.onChange).toHaveBeenCalledWith('companyName', 'New Company Name');
  });

  it.skip('calls onChange when company URL is changed', async () => {
    const user = userEvent.setup();
    render(<CompanyInformationForm {...defaultProps} />);

    const companyUrlField = screen.getByLabelText('Company Website (optional)');
    await user.clear(companyUrlField);
    await user.type(companyUrlField, 'https://newcompany.com');

    expect(mockFunctions.onChange).toHaveBeenCalledWith('companyUrl', 'https://newcompany.com');
  });

  it('handles empty company URL gracefully', () => {
    const settingsWithoutUrl = {
      ...mockBrandingSettings,
      companyUrl: undefined,
    };

    render(<CompanyInformationForm {...defaultProps} settings={settingsWithoutUrl} />);

    const companyUrlField = screen.getByLabelText('Company Website (optional)');
    expect(companyUrlField).toHaveValue('');
  });

  it.skip('renders form fields with proper spacing', () => {
    render(<CompanyInformationForm {...defaultProps} />);

    const companyNameField = screen.getByLabelText('Company Name');
    const companyUrlField = screen.getByLabelText('Company Website (optional)');

    expect(companyNameField).toBeInTheDocument();
    expect(companyUrlField).toBeInTheDocument();
  });

  it.skip('triggers onChange on every character typed', async () => {
    const user = userEvent.setup();
    render(<CompanyInformationForm {...defaultProps} />);

    const companyNameField = screen.getByLabelText('Company Name');
    await user.clear(companyNameField);
    await user.type(companyNameField, 'ABC');

    // Should be called for each character
    expect(mockFunctions.onChange).toHaveBeenCalledTimes(3);
    expect(mockFunctions.onChange).toHaveBeenCalledWith('companyName', 'A');
    expect(mockFunctions.onChange).toHaveBeenCalledWith('companyName', 'AB');
    expect(mockFunctions.onChange).toHaveBeenCalledWith('companyName', 'ABC');
  });
});