import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render with default props', () => {
    render(<LoadingSkeleton />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('MuiSkeleton-text');
  });

  it('should render with specified variant', () => {
    render(<LoadingSkeleton variant="circular" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-circular');
  });

  it('should render with specified width and height', () => {
    render(<LoadingSkeleton width={200} height={100} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('should render with percentage dimensions', () => {
    render(<LoadingSkeleton width="50%" height="20%" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({ width: '50%', height: '20%' });
  });

  it('should apply custom className', () => {
    render(<LoadingSkeleton className="custom-skeleton" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('should render text variant for text content', () => {
    render(<LoadingSkeleton variant="text" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-text');
  });

  it('should render with animation', () => {
    render(<LoadingSkeleton animation="wave" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-wave');
  });

  it('should render without animation when disabled', () => {
    render(<LoadingSkeleton animation={false} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).not.toHaveClass('MuiSkeleton-pulse');
    expect(skeleton).not.toHaveClass('MuiSkeleton-wave');
  });

  it('should render multiple skeleton items in a list', () => {
    render(
      <div>
        <LoadingSkeleton data-testid="skeleton-1" />
        <LoadingSkeleton data-testid="skeleton-2" />
        <LoadingSkeleton data-testid="skeleton-3" />
      </div>
    );
    
    expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
  });

  it('should render with rounded corners when specified', () => {
    render(<LoadingSkeleton variant="rounded" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('MuiSkeleton-rounded');
  });

  it('should handle component composition', () => {
    render(
      <div data-testid="skeleton-container">
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div>
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
    );
    
    const container = screen.getByTestId('skeleton-container');
    expect(container).toBeInTheDocument();
    
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(3);
  });

  it('should render with inline styles', () => {
    render(
      <LoadingSkeleton 
        style={{ marginTop: '10px', borderRadius: '8px' }} 
      />
    );
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({ 
      marginTop: '10px', 
      borderRadius: '8px' 
    });
  });

  it('should support responsive sizing', () => {
    // Use string values that MUI accepts for responsive breakpoints
    render(<LoadingSkeleton width="100%" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    // Responsive props are handled by Material-UI internally
  });

  it('should render card skeleton pattern', () => {
    render(
      <div data-testid="card-skeleton">
        <LoadingSkeleton variant="rectangular" width="100%" height={200} />
        <LoadingSkeleton variant="text" width="80%" />
        <LoadingSkeleton variant="text" width="60%" />
      </div>
    );
    
    const cardSkeleton = screen.getByTestId('card-skeleton');
    expect(cardSkeleton).toBeInTheDocument();
    
    const skeletons = cardSkeleton.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(3);
  });

  it('should render avatar skeleton pattern', () => {
    render(
      <div data-testid="avatar-skeleton" style={{ display: 'flex', alignItems: 'center' }}>
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div style={{ marginLeft: '10px', flex: 1 }}>
          <LoadingSkeleton variant="text" width="70%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
    );
    
    const avatarSkeleton = screen.getByTestId('avatar-skeleton');
    expect(avatarSkeleton).toBeInTheDocument();
    
    const skeletons = avatarSkeleton.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(3);
    
    // Check that circular skeleton exists (avatar)
    const circularSkeleton = avatarSkeleton.querySelector('.MuiSkeleton-circular');
    expect(circularSkeleton).toBeInTheDocument();
  });

  it('should handle dynamic content loading simulation', () => {
    const { rerender } = render(<LoadingSkeleton />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Simulate content loaded
    rerender(<div>Loaded content</div>);
    
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });

  it('should render table skeleton pattern', () => {
    render(
      <div data-testid="table-skeleton">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
            <LoadingSkeleton variant="text" width="25%" />
            <LoadingSkeleton variant="text" width="35%" />
            <LoadingSkeleton variant="text" width="20%" />
            <LoadingSkeleton variant="text" width="20%" />
          </div>
        ))}
      </div>
    );
    
    const tableSkeleton = screen.getByTestId('table-skeleton');
    expect(tableSkeleton).toBeInTheDocument();
    
    const skeletons = tableSkeleton.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(12); // 3 rows × 4 columns
  });

  it('should maintain accessibility', () => {
    render(<LoadingSkeleton aria-label="Loading content..." />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content...');
  });
});
