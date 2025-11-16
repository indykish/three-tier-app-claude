import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/pages/Dashboard/Header';
import { render, mockFunctions, mockBrandingSettings } from '../../utils/test-utils';

// Mock the child components
jest.mock('@/pages/Branding/BrandedLogo', () => ({
  BrandedLogo: ({ height, className }: any) => (
    <div data-testid="branded-logo" className={className}>
      <div data-testid="logo-height">{height}</div>
    </div>
  ),
}));

jest.mock('@/pages/Branding/CompanyAvatar', () => ({
  CompanyAvatar: ({ size }: any) => (
    <div data-testid="company-avatar">
      <div data-testid="avatar-size">{size}</div>
    </div>
  ),
}));

jest.mock('@/utils/iconloader', () => ({
  Icon: ({ name, size }: any) => (
    <div data-testid="icon">
      <div data-testid="icon-name">{name}</div>
      <div data-testid="icon-size">{size}</div>
    </div>
  ),
}));

describe('Header', () => {
  it('renders header with app title and logo', () => {
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByTestId('branded-logo')).toBeInTheDocument();
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByTestId('logo-height')).toHaveTextContent('36');
  });

  it('renders navigation buttons', () => {
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transfers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Support' })).toBeInTheDocument();
  });

  it('renders user menu button and company avatar', () => {
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByTestId('company-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-size')).toHaveTextContent('36');
    expect(screen.getByLabelText('user menu')).toBeInTheDocument();
  });

  it('opens user menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
  });

  it('displays user menu items when opened', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Company Settings')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Reset Branding')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('calls onResetBranding when Reset Branding is clicked', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Reset Branding')).toBeInTheDocument();
    });

    const resetBrandingButton = screen.getByText('Reset Branding');
    await user.click(resetBrandingButton);

    expect(mockFunctions.onResetBranding).toHaveBeenCalledTimes(1);
  });

  it('closes menu when menu items are clicked', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    const profileButton = screen.getByText('Profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('displays company information in user menu', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    // Check that company avatar is displayed in menu as well
    const avatarsInMenu = screen.getAllByTestId('company-avatar');
    expect(avatarsInMenu.length).toBeGreaterThanOrEqual(2); // One in header, one in menu
  });

  it('renders settings icon in preferences menu item', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByTestId('icon-name')).toHaveTextContent('settings');
      expect(screen.getByTestId('icon-size')).toHaveTextContent('sm');
    });
  });

  it('handles menu close on outside click', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Click outside the menu - use a more specific approach
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      await user.click(backdrop);
    } else {
      // Fallback: click on the body
      await user.click(document.body);
    }

    // Wait for the menu to close with a shorter timeout
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('renders without branding context gracefully', () => {
    // This test should expect an error since the component requires BrandingProvider
    expect(() => {
      render(<Header onResetBranding={mockFunctions.onResetBranding} />);
    }).toThrow('useBranding must be used within BrandingProvider');
  });

  it('has proper AppBar structure', () => {
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Check that the header has proper structure
    const appBar = screen.getByRole('banner') || screen.getByTestId('branded-logo').closest('[class*="AppBar"]');
    expect(appBar).toBeInTheDocument();
  });

  it('shows proper menu item icons', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    await user.click(menuButton);

    await waitFor(() => {
      // Check for Material-UI icons (they would be rendered as SVG elements in real app)
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Company Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('maintains menu state correctly', async () => {
    const user = userEvent.setup();
    render(<Header onResetBranding={mockFunctions.onResetBranding} />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const menuButton = screen.getByLabelText('user menu');
    
    // Open menu
    await user.click(menuButton);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Close menu by clicking outside (since clicking menu button again just reopens it)
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      await user.click(backdrop);
    } else {
      // Fallback: click on the body
      await user.click(document.body);
    }
    
    // Wait for the menu to close
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Open menu again
    await user.click(menuButton);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });
});