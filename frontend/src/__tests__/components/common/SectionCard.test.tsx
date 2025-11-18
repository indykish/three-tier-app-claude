import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionCard } from '@/components/common/SectionCard';

describe('SectionCard', () => {
  it('should render with title and children', () => {
    render(
      <SectionCard title="Test Section">
        <div>Test content</div>
      </SectionCard>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">icon</span>;
    
    render(
      <SectionCard title="Test Section" icon={<TestIcon />}>
        <div>Content</div>
      </SectionCard>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <SectionCard title="Test" className="custom-card">
        <div>Content</div>
      </SectionCard>
    );
    
    const card = screen.getByText('Test').closest('.custom-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without icon', () => {
    render(
      <SectionCard title="Test Section">
        <div>Content</div>
      </SectionCard>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<SectionCard title="Empty Section">{null}</SectionCard>);
    
    expect(screen.getByText('Empty Section')).toBeInTheDocument();
  });

  it('should handle long titles', () => {
    const longTitle = 'This is a very long section title that should be handled properly';
    render(
      <SectionCard title={longTitle}>
        <div>Content</div>
      </SectionCard>
    );
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <SectionCard title="Multi Content">
        <div>First content</div>
        <div>Second content</div>
        <span>Third content</span>
      </SectionCard>
    );
    
    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.getByText('Second content')).toBeInTheDocument();
    expect(screen.getByText('Third content')).toBeInTheDocument();
  });

  it('should have proper Material-UI Card structure', () => {
    render(
      <SectionCard title="Test">
        <div>Content</div>
      </SectionCard>
    );
    
    // Should have MUI Card classes
    const title = screen.getByText('Test');
    expect(title.closest('.MuiCard-root')).toBeInTheDocument();
    expect(title.closest('.MuiCardContent-root')).toBeInTheDocument();
  });

  it('should render complex content', () => {
    render(
      <SectionCard title="Complex Section">
        <div>
          <p>Paragraph content</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
          <button>Button</button>
        </div>
      </SectionCard>
    );
    
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle special characters in title', () => {
    const specialTitle = 'Section with "quotes" & symbols: @#$%';
    render(
      <SectionCard title={specialTitle}>
        <div>Content</div>
      </SectionCard>
    );
    
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });
});
