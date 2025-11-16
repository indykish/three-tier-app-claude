import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontPicker } from '@/components/common/FontPicker';
import { mockFunctions } from '../../utils/test-utils';

describe('FontPicker', () => {
  const defaultProps = {
    label: 'Font Family',
    value: 'Roboto, Arial, sans-serif',
    onChange: mockFunctions.onChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label and current value', () => {
    render(<FontPicker {...defaultProps} />);
    
    expect(screen.getByText('Font Family')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Roboto, Arial, sans-serif')).toBeInTheDocument();
  });

  it('should render preview section', () => {
    render(<FontPicker {...defaultProps} />);
    
    expect(screen.getByText('Preview Heading')).toBeInTheDocument();
    expect(screen.getByText(/This is how your body text will look/)).toBeInTheDocument();
    expect(screen.getByText(/Small text and captions/)).toBeInTheDocument();
  });

  it('should apply selected font to preview', () => {
    render(<FontPicker {...defaultProps} />);
    
    const previewHeading = screen.getByText('Preview Heading');
    expect(previewHeading).toHaveStyle({ fontFamily: 'Roboto, Arial, sans-serif' });
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Should show font options - use getAllByRole to get menu items
    const menuItems = screen.getAllByRole('option');
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Check for specific font options in the menu
    const robotoOption = menuItems.find(item => item.textContent?.includes('Roboto (Default)'));
    const interOption = menuItems.find(item => item.textContent?.includes('Inter (Modern)'));
    const georgiaOption = menuItems.find(item => item.textContent?.includes('Georgia (Serif)'));
    
    expect(robotoOption).toBeTruthy();
    expect(interOption).toBeTruthy();
    expect(georgiaOption).toBeTruthy();
  });

  it('should handle font selection', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Find and click the Georgia option
    const georgiaOption = screen.getByRole('option', { name: /georgia \(serif\)/i });
    await user.click(georgiaOption);
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('Georgia, serif');
  });

  it('should show preview text for each font option', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Check that preview text is shown for each option
    const menuItems = screen.getAllByRole('option');
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Check that at least one item has preview text
    const hasPreviewText = menuItems.some(item => 
      item.textContent?.includes('The quick brown fox jumps')
    );
    expect(hasPreviewText).toBe(true);
  });

  it('should apply font family to option labels', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Find the Roboto option in the menu and check its child element has the style
    const robotoOption = screen.getByRole('option', { name: /roboto \(default\)/i });
    const robotoText = robotoOption.querySelector('p');
    expect(robotoText).toHaveStyle({ fontFamily: 'Roboto, Arial, sans-serif' });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Use arrow keys to navigate
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(mockFunctions.onChange).toHaveBeenCalled();
  });

  it('should close dropdown on escape', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Check that menu is open
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    
    await user.keyboard('{Escape}');
    
    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });

  it('should update preview when value prop changes', () => {
    const { rerender } = render(<FontPicker {...defaultProps} />);
    
    let previewHeading = screen.getByText('Preview Heading');
    expect(previewHeading).toHaveStyle({ fontFamily: 'Roboto, Arial, sans-serif' });
    
    rerender(<FontPicker {...defaultProps} value="Georgia, serif" />);
    
    previewHeading = screen.getByText('Preview Heading');
    expect(previewHeading).toHaveStyle({ fontFamily: 'Georgia, serif' });
  });

  it('should apply custom className', () => {
    render(<FontPicker {...defaultProps} className="custom-font-picker" />);
    
    const container = screen.getByText('Font Family').closest('.custom-font-picker');
    expect(container).toBeInTheDocument();
  });

  it('should handle all available font options', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Check all font options are available in the dropdown menu
    const menuItems = screen.getAllByRole('option');
    const fontLabels = menuItems.map(item => item.textContent);
    
    // Check that the text content contains the expected font names
    expect(fontLabels.some(label => label?.includes('Roboto (Default)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Inter (Modern)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Poppins (Friendly)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Montserrat (Clean)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Open Sans (Readable)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Lato (Professional)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Source Sans Pro'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Nunito (Rounded)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Georgia (Serif)'))).toBe(true);
    expect(fontLabels.some(label => label?.includes('Playfair Display (Elegant)'))).toBe(true);
  });

  it('should handle different font categories', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    // Test serif font selection
    const playfairOption = screen.getByRole('option', { name: /playfair display/i });
    await user.click(playfairOption);
    
    expect(mockFunctions.onChange).toHaveBeenCalledWith('Playfair Display, serif');
  });

  it('should maintain accessibility standards', () => {
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    // Check that the select has proper accessibility attributes
    expect(select).toHaveAttribute('aria-expanded');
    expect(select).toHaveAttribute('aria-haspopup');
    
    const label = screen.getByText('Font Family');
    expect(label).toBeInTheDocument();
  });

  it('should show proper preview styling', () => {
    render(<FontPicker {...defaultProps} />);
    
    const previewContainer = screen.getByText('Preview Heading').closest('.MuiBox-root');
    expect(previewContainer).toHaveClass('mt-3', 'p-3', 'border', 'rounded', 'bg-gray-50');
  });

  it('should handle rapid font changes', async () => {
    const user = userEvent.setup();
    render(<FontPicker {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    
    // Rapid selection changes - reset mock to start fresh
    mockFunctions.onChange.mockClear();
    
    await user.click(select);
    const interOption = screen.getByRole('option', { name: /inter \(modern\)/i });
    await user.click(interOption);
    
    await user.click(select);
    const georgiaOption = screen.getByRole('option', { name: /georgia \(serif\)/i });
    await user.click(georgiaOption);
    
    await user.click(select);
    const robotoOption = screen.getByRole('option', { name: /roboto \(default\)/i });
    await user.click(robotoOption);
    
    // Check that onChange was called at least twice (the third might not trigger if already selected)
    expect(mockFunctions.onChange).toHaveBeenCalledTimes(2);
    expect(mockFunctions.onChange).toHaveBeenCalledWith('Inter, system-ui, sans-serif');
    expect(mockFunctions.onChange).toHaveBeenCalledWith('Georgia, serif');
  });

  it('should handle empty or invalid value gracefully', () => {
    render(<FontPicker {...defaultProps} value="" />);
    
    expect(screen.getByText('Font Family')).toBeInTheDocument();
    
    // Should still render preview with fallback
    expect(screen.getByText('Preview Heading')).toBeInTheDocument();
  });
});
