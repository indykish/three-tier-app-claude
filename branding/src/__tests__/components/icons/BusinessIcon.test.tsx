import React from 'react';
import { render, screen } from '@testing-library/react';
import { BusinessIcon } from '@/components/icons/BusinessIcon';

describe('BusinessIcon', () => {
  it('should render SVG with default props', () => {
    render(<BusinessIcon color="#333333" />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should apply custom color', () => {
    render(<BusinessIcon color="#ff0000" />);
    
    const path = screen.getByTestId('business-icon').querySelector('path');
    expect(path).toHaveAttribute('fill', '#ff0000');
  });

  it('should apply custom size', () => {
    render(<BusinessIcon color="#333333" size={32} />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('should apply custom className', () => {
    render(<BusinessIcon color="#333333" className="custom-icon" />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveClass('custom-icon');
  });

  it('should have proper path content', () => {
    render(<BusinessIcon color="#333333" />);
    
    const path = screen.getByTestId('business-icon').querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', '#333333');
  });

  it('should handle both color and className', () => {
    render(<BusinessIcon color="#00ff00" className="test-class" />);
    
    const svg = screen.getByTestId('business-icon');
    const path = svg.querySelector('path');
    
    expect(path).toHaveAttribute('fill', '#00ff00');
    expect(svg).toHaveClass('test-class');
  });

  it('should render with large size', () => {
    render(<BusinessIcon color="#333333" size={48} />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should have proper SVG structure', () => {
    render(<BusinessIcon color="#333333" />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should render with default className', () => {
    render(<BusinessIcon color="#333333" />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveClass('mr-2');
  });

  it('should override default className when custom className is provided', () => {
    render(<BusinessIcon color="#333333" className="custom-class" />);
    
    const svg = screen.getByTestId('business-icon');
    expect(svg).toHaveClass('custom-class');
    expect(svg).not.toHaveClass('mr-2');
  });
});
