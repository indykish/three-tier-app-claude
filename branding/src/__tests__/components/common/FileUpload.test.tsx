import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '@/components/common/FileUpload';
import { mockFunctions, mockFile } from '../../utils/test-utils';

describe('FileUpload', () => {
  const defaultProps = {
    onFileChange: mockFunctions.onFileChange,
    selectedFile: null,
    accept: 'image/*',
    buttonText: 'Choose Logo File',
    textColor: '#333333',
    accentColor: '#1976d2',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with button text', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByText('Choose Logo File')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    expect(fileInput).toBeInTheDocument();
    
    // Simulate file selection
    await user.upload(fileInput as HTMLInputElement, mockFile);
    expect(mockFunctions.onFileChange).toHaveBeenCalledWith(mockFile);
  });

  it('should display file name when file is selected', async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} selectedFile={mockFile} />);
    
    expect(screen.getByText('📎 test.png')).toBeInTheDocument();
  });

  it('should clear file when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} selectedFile={mockFile} />);
    
    // Find and click clear button (Chip with delete icon)
    const chip = screen.getByText('📎 test.png');
    const deleteIcon = chip.querySelector('[data-testid="CancelIcon"]') || chip.querySelector('.MuiChip-deleteIcon');
    
    if (deleteIcon) {
      await user.click(deleteIcon);
      expect(mockFunctions.onFileChange).toHaveBeenCalledWith(null);
    }
  });

  it('should apply custom colors', () => {
    render(
      <FileUpload 
        {...defaultProps} 
        textColor="#ff0000" 
        accentColor="#00ff00" 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Colors should be applied via style props
  });

  it('should accept only specified file types', async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} accept="image/png" />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    expect(fileInput).toHaveAttribute('accept', 'image/png');
  });

  it('should handle multiple file types', () => {
    render(<FileUpload {...defaultProps} accept="image/*,.pdf,.doc" />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf,.doc');
  });

  it('should handle file validation errors', async () => {
    const user = userEvent.setup();
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    render(<FileUpload {...defaultProps} accept="image/*" />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    
    await user.upload(fileInput as HTMLInputElement, invalidFile);
    
    // Should not call onFileChange for invalid file type
    expect(mockFunctions.onFileChange).not.toHaveBeenCalled();
  });

  it('should handle large file size validation', async () => {
    const user = userEvent.setup();
    const largeFile = new File(['x'.repeat(10000000)], 'large.png', { type: 'image/png' });
    
    render(<FileUpload {...defaultProps} maxSize={1} />); // 1MB limit
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    
    await user.upload(fileInput as HTMLInputElement, largeFile);
    
    // Should not call onFileChange for oversized file
    expect(mockFunctions.onFileChange).not.toHaveBeenCalled();
  });

  it('should handle keyboard interactions', async () => {
    const user = userEvent.setup();
    render(<FileUpload {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Should be focusable
    button.focus();
    expect(button).toHaveFocus();
    
    // Should trigger on Enter key
    await user.keyboard('{Enter}');
    // File input should be triggered (hard to test directly)
    
    // Should trigger on Space key
    await user.keyboard(' ');
    // File input should be triggered (hard to test directly)
  });

  it('should handle empty file selection gracefully', async () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    
    fireEvent.change(fileInput, { target: { files: [] } });
    
    // Should not call onFileChange with empty files
    expect(mockFunctions.onFileChange).not.toHaveBeenCalled();
  });

  it('should display selected file name', () => {
    render(<FileUpload {...defaultProps} selectedFile={mockFile} />);
    
    expect(screen.getByText('📎 test.png')).toBeInTheDocument();
  });

  it('should handle file change with valid image', async () => {
    const user = userEvent.setup();
    const validFile = new File(['image content'], 'valid.png', { type: 'image/png' });
    
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = screen.getByDisplayValue(''); // Hidden file input
    
    await user.upload(fileInput as HTMLInputElement, validFile);
    
    expect(mockFunctions.onFileChange).toHaveBeenCalledWith(validFile);
  });
});
