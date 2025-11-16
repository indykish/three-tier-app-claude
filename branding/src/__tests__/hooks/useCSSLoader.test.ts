import { renderHook, act } from '@testing-library/react';
import { useCSSLoader, CSSStatus } from '@/hooks/useCSSLoader';

describe('useCSSLoader', () => {
  beforeEach(() => {
    // Clear all link elements
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      link.remove();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return IDLE status when no href provided', () => {
    const { result } = renderHook(() => useCSSLoader(''));
    expect(result.current).toBe(CSSStatus.IDLE);
  });

  it('should return LOADING status initially when href provided', () => {
    const { result } = renderHook(() => useCSSLoader('https://fonts.googleapis.com/css2?family=Roboto'));
    expect(result.current).toBe(CSSStatus.LOADING);
  });

  it('should create link element when CSS not already loaded', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.head, 'appendChild');

    renderHook(() => useCSSLoader(href));

    expect(mockCreateElement).toHaveBeenCalledWith('link');
    expect(mockAppendChild).toHaveBeenCalled();
  });

  it('should set correct attributes on created link element', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    
    renderHook(() => useCSSLoader(href));

    // Check that the link element was created and added to the DOM
    const createdLink = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
    expect(createdLink).toBeTruthy();
    expect(createdLink.rel).toBe('stylesheet');
    expect(createdLink.href).toBe(href);
    expect(createdLink.getAttribute('data-status')).toBe(CSSStatus.LOADING);
  });

  it('should simulate successful load', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    
    const { result } = renderHook(() => useCSSLoader(href));
    
    // Initially should be loading
    expect(result.current).toBe(CSSStatus.LOADING);
    
    // Simulate successful load by triggering the load event
    const createdLink = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
    expect(createdLink).toBeTruthy();
    
    act(() => {
      createdLink.dispatchEvent(new Event('load'));
    });

    expect(result.current).toBe(CSSStatus.READY);
    expect(createdLink.getAttribute('data-status')).toBe(CSSStatus.READY);
  });

  it('should simulate load error', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    
    const { result } = renderHook(() => useCSSLoader(href));
    
    // Initially should be loading
    expect(result.current).toBe(CSSStatus.LOADING);
    
    // Simulate error by triggering the error event
    const createdLink = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
    expect(createdLink).toBeTruthy();
    
    act(() => {
      createdLink.dispatchEvent(new Event('error'));
    });

    expect(result.current).toBe(CSSStatus.ERROR);
    expect(createdLink.getAttribute('data-status')).toBe(CSSStatus.ERROR);
  });

  it('should use existing link element if already present', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    
    // Create and add a real link element to the DOM
    const existingLink = document.createElement('link');
    existingLink.href = href;
    existingLink.rel = 'stylesheet';
    existingLink.setAttribute('data-status', CSSStatus.READY);
    document.head.appendChild(existingLink);
    
    // Mock createElement after setting up the existing link
    // but filter out non-link calls (renderHook creates div elements)
    const mockCreateElement = jest.spyOn(document, 'createElement');

    const { result } = renderHook(() => useCSSLoader(href));

    expect(result.current).toBe(CSSStatus.READY);
    
    // Check that createElement was not called with 'link'
    const linkCalls = mockCreateElement.mock.calls.filter(call => call[0] === 'link');
    expect(linkCalls).toHaveLength(0);
    
    // Clean up
    existingLink.remove();
  });

  it('should assume READY status for existing link without status attribute', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    
    // Create and add a real link element to the DOM without status attribute
    const existingLink = document.createElement('link');
    existingLink.href = href;
    existingLink.rel = 'stylesheet';
    document.head.appendChild(existingLink);

    const { result } = renderHook(() => useCSSLoader(href));

    expect(result.current).toBe(CSSStatus.READY);
    
    // Clean up
    existingLink.remove();
  });

  it('should handle component unmount', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';

    const { unmount } = renderHook(() => useCSSLoader(href));
    
    // Check that link was created
    const createdLink = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
    expect(createdLink).toBeTruthy();
    
    // Unmount should not throw errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle href changes', () => {
    const { result, rerender } = renderHook(
      ({ href }) => useCSSLoader(href),
      { initialProps: { href: 'https://fonts.googleapis.com/css2?family=Roboto' } }
    );

    expect(result.current).toBe(CSSStatus.LOADING);

    rerender({ href: '' });
    expect(result.current).toBe(CSSStatus.IDLE);
  });

  it('should handle querySelector returning null', () => {
    const href = 'https://fonts.googleapis.com/css2?family=Roboto';
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
    const mockCreateElement = jest.spyOn(document, 'createElement');

    renderHook(() => useCSSLoader(href));

    expect(mockCreateElement).toHaveBeenCalledWith('link');
  });

  describe('CSSStatus enum', () => {
    it('should have correct values', () => {
      expect(CSSStatus.IDLE).toBe('idle');
      expect(CSSStatus.LOADING).toBe('loading');
      expect(CSSStatus.READY).toBe('ready');
      expect(CSSStatus.ERROR).toBe('error');
    });
  });
});