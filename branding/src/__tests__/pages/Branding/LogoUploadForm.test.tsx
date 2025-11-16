import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoUploadForm } from '@/pages/Branding/LogoUploadForm';
import { render, mockFile, mockFunctions } from '../../utils/test-utils';

jest.mock('@/components/common', () => ({
  SectionCard: ({ title, icon, children }: any) => (
    <div data-testid="section-card">
      <div data-testid="section-title">{title}</div>
      <div data-testid="section-icon">{icon}</div>
      <div data-testid="section-content">{children}</div>
    </div>
  ),
  FileUpload: ({ onFileChange, onError, selectedFile, textColor, accentColor }: any) => (
    <div>
      <input
        data-testid="file-input"
        type="file"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
      <div data-testid="text-color" style={{ color: textColor }}>Text Color</div>
      <div data-testid="accent-color" style={{ color: accentColor }}>Accent Color</div>
      <button onClick={() => onError('Test error')}>Trigger Error</button>
      {selectedFile && <div data-testid="selected-file">{selectedFile.name}</div>}
    </div>
  ),
}));

jest.mock('@/components/icons', () => ({
  UploadIcon: ({ color }: any) => (
    <div data-testid="upload-icon" style={{ color }}>Upload</div>
  ),
}));

describe('LogoUploadForm', () => {
  const defaultProps = {
    logoFile: null,
    onLogoChange: mockFunctions.onLogoChange,
    primaryColor: '#ff0000',
    textColor: '#333333',
    accentColor: '#cccccc',
    onError: mockFunctions.onError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section card with correct title and icon', () => {
    render(<LogoUploadForm {...defaultProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent('Company Logo');
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toHaveStyle({ color: '#ff0000' });
  });

  it('renders file upload component with correct props', () => {
    render(<LogoUploadForm {...defaultProps} />);

    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('text-color')).toHaveStyle({ color: 'rgb(51, 51, 51)' });
    expect(screen.getByTestId('accent-color')).toHaveStyle({ color: 'rgb(204, 204, 204)' });
  });

  it('displays recommendation text', () => {
    render(<LogoUploadForm {...defaultProps} />);

    expect(screen.getByText('Recommended: PNG or SVG, max 2MB')).toBeInTheDocument();
  });

  it('calls onLogoChange when file is selected', async () => {
    const user = userEvent.setup();
    render(<LogoUploadForm {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, mockFile);

    expect(mockFunctions.onLogoChange).toHaveBeenCalledWith(mockFile);
  });

  it('displays selected file name when file is uploaded', () => {
    render(<LogoUploadForm {...defaultProps} logoFile={mockFile} />);

    expect(screen.getByTestId('selected-file')).toHaveTextContent('test.png');
  });

  it('calls onError when error occurs', async () => {
    const user = userEvent.setup();
    render(<LogoUploadForm {...defaultProps} />);

    const errorButton = screen.getByText('Trigger Error');
    await user.click(errorButton);

    expect(mockFunctions.onError).toHaveBeenCalledWith('Test error');
  });

  it.skip('handles null file selection', async () => {
    const user = userEvent.setup();
    render(<LogoUploadForm {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    await user.click(fileInput);

    expect(mockFunctions.onLogoChange).toHaveBeenCalledWith(null);
  });

  it('renders without selected file', () => {
    render(<LogoUploadForm {...defaultProps} />);

    expect(screen.queryByTestId('selected-file')).not.toBeInTheDocument();
  });

  it('passes all color props correctly to FileUpload', () => {
    const customProps = {
      ...defaultProps,
      primaryColor: '#123456',
      textColor: '#abcdef',
      accentColor: '#fedcba',
    };

    render(<LogoUploadForm {...customProps} />);

    expect(screen.getByTestId('upload-icon')).toHaveStyle({ color: '#123456' });
    expect(screen.getByTestId('text-color')).toHaveStyle({ color: '#abcdef' });
    expect(screen.getByTestId('accent-color')).toHaveStyle({ color: '#fedcba' });
  });
});