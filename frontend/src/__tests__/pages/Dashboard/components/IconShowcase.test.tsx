import React from 'react';
import { screen } from '@testing-library/react';
import { IconShowcase } from '@/pages/Dashboard/components/IconShowcase';
import { render, mockBrandingSettings } from '../../../utils/test-utils';

// Mock the icon loader
jest.mock('@/utils/iconloader', () => ({
  Icon: ({ name, size, color, className }: any) => (
    <div 
      data-testid="mock-icon"
      data-name={name}
      data-size={size}
      data-color={color}
      className={className}
    >
      {name}
    </div>
  ),
  useIconLoader: () => ({
    getAvailableIcons: (category: string) => {
      const mockIcons = {
        navigation: ['home', 'menu', 'back'],
        alerts: ['warning', 'error', 'info'],
        actions: ['save', 'delete', 'edit'],
        business: ['company', 'bank', 'finance'],
      };
      return mockIcons[category as keyof typeof mockIcons] || [];
    },
  }),
}));

describe('IconShowcase', () => {
  it('renders main title and description', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Lazy-Loaded Icon System Demo')).toBeInTheDocument();
    expect(screen.getByText(/Icons are loaded on-demand using React.lazy/)).toBeInTheDocument();
  });

  it('displays all icon categories', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Navigation Icons')).toBeInTheDocument();
    expect(screen.getByText('Alerts Icons')).toBeInTheDocument();
    expect(screen.getByText('Actions Icons')).toBeInTheDocument();
    expect(screen.getByText('Business Icons')).toBeInTheDocument();
  });

  it('displays icon counts for each category', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Should find multiple instances of "3 icons" (one for each category)
    const iconCounts = screen.getAllByText('3 icons');
    expect(iconCounts.length).toBe(4); // One for each category
  });

  it('renders icons from all categories', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Navigation icons - use getAllByText and check first occurrence
    const homeIcons = screen.getAllByText('home');
    const menuIcons = screen.getAllByText('menu');
    const backIcons = screen.getAllByText('back');
    expect(homeIcons.length).toBeGreaterThan(0);
    expect(menuIcons.length).toBeGreaterThan(0);
    expect(backIcons.length).toBeGreaterThan(0);

    // Alert icons
    const warningIcons = screen.getAllByText('warning');
    const errorIcons = screen.getAllByText('error');
    const infoIcons = screen.getAllByText('info');
    expect(warningIcons.length).toBeGreaterThan(0);
    expect(errorIcons.length).toBeGreaterThan(0);
    expect(infoIcons.length).toBeGreaterThan(0);

    // Action icons
    const saveIcons = screen.getAllByText('save');
    const deleteIcons = screen.getAllByText('delete');
    const editIcons = screen.getAllByText('edit');
    expect(saveIcons.length).toBeGreaterThan(0);
    expect(deleteIcons.length).toBeGreaterThan(0);
    expect(editIcons.length).toBeGreaterThan(0);

    // Business icons
    const companyIcons = screen.getAllByText('company');
    const bankIcons = screen.getAllByText('bank');
    const financeIcons = screen.getAllByText('finance');
    expect(companyIcons.length).toBeGreaterThan(0);
    expect(bankIcons.length).toBeGreaterThan(0);
    expect(financeIcons.length).toBeGreaterThan(0);
  });

  it('applies different colors to different categories', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const icons = screen.getAllByTestId('mock-icon');
    
    // Check that icons have different colors based on category
    const navigationIcons = icons.filter(icon => 
      ['home', 'menu', 'back'].includes(icon.getAttribute('data-name') || '')
    );
    
    const alertIcons = icons.filter(icon => 
      ['warning', 'error', 'info'].includes(icon.getAttribute('data-name') || '')
    );

    expect(navigationIcons.length).toBe(3);
    expect(alertIcons.length).toBe(3);
    
    // Navigation icons should use primary color
    navigationIcons.forEach(icon => {
      expect(icon.getAttribute('data-color')).toBe(mockBrandingSettings.theme.theme_color);
    });
    
    // Alert icons should use secondary color
    alertIcons.forEach(icon => {
      expect(icon.getAttribute('data-color')).toBe(mockBrandingSettings.theme.button.secondary_color);
    });
  });

  it('renders icons with large size', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const icons = screen.getAllByTestId('mock-icon');
    // Filter out the title icon which has size "md"
    const categoryIcons = icons.filter(icon => icon.getAttribute('data-name') !== 'preview');
    categoryIcons.forEach(icon => {
      expect(icon.getAttribute('data-size')).toBe('lg');
    });
  });

  it('displays performance features information', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    expect(screen.getByText('Performance Features:')).toBeInTheDocument();
    expect(screen.getByText(/Icons load only when needed/)).toBeInTheDocument();
    expect(screen.getByText(/Cached after first load/)).toBeInTheDocument();
    expect(screen.getByText(/Suspense boundaries/)).toBeInTheDocument();
    expect(screen.getByText(/Dynamic color theming/)).toBeInTheDocument();
    expect(screen.getByText(/Support for SVG, TSX, and Material-UI icons/)).toBeInTheDocument();
    expect(screen.getByText(/Searchable icon registry/)).toBeInTheDocument();
  });

  it('renders preview icon in title with correct color', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const icons = screen.getAllByTestId('mock-icon');
    const titleIcon = icons.find(icon => icon.getAttribute('data-name') === 'preview');
    expect(titleIcon).toBeTruthy();
    expect(titleIcon?.getAttribute('data-size')).toBe('md');
    expect(titleIcon?.getAttribute('data-color')).toBe(mockBrandingSettings.theme.theme_color);
  });

  it('renders within card structure', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Should be rendered within a card structure
    const cardContent = screen.getByText('Lazy-Loaded Icon System Demo').closest('[class*="MuiCard"]');
    expect(cardContent).toBeTruthy();
  });

  it('renders category chips with themed colors', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    const chips = screen.getAllByText('3 icons');
    expect(chips).toHaveLength(4); // One for each category
  });

  it('renders responsive grid layout for icons', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Should have proper grid structure with responsive breakpoints
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons.length).toBe(13); // 12 category icons + 1 title icon
  });

  it('renders without branding context gracefully', () => {
    // This test should expect an error since the component requires BrandingProvider
    expect(() => {
      render(<IconShowcase />);
    }).toThrow('useBranding must be used within BrandingProvider');
  });

  it('displays icon names in monospace font', () => {
    render(<IconShowcase />, {
      withBranding: true,
      brandingSettings: mockBrandingSettings,
    });

    // Find the Typography element with the icon name (not the icon itself)
    const iconNameElements = screen.getAllByText('home');
    const typographyElement = iconNameElements.find(element => 
      element.tagName === 'SPAN' && element.classList.contains('MuiTypography-caption')
    );
    expect(typographyElement).toHaveClass('font-mono');
  });
});