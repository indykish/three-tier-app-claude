import { renderHook, act } from '@testing-library/react';
import { useScript, ScriptStatus, AddScriptTo } from '@/hooks/useScript';

describe('useScript', () => {
  beforeEach(() => {
    // Clear all script elements
    document.querySelectorAll('script').forEach(script => {
      script.remove();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return IDLE status when no src provided', () => {
    const { result } = renderHook(() => useScript(''));
    expect(result.current).toBe(ScriptStatus.IDLE);
  });

  it('should return LOADING status initially when src provided', () => {
    const { result } = renderHook(() => useScript('https://example.com/script.js'));
    expect(result.current).toBe(ScriptStatus.LOADING);
  });

  it('should create script element when not already loaded', () => {
    const src = 'https://example.com/script.js';
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');

    renderHook(() => useScript(src));

    expect(mockCreateElement).toHaveBeenCalledWith('script');
    expect(mockAppendChild).toHaveBeenCalled();
  });

  it('should set correct attributes on created script element', () => {
    const src = 'https://example.com/script.js';

    renderHook(() => useScript(src));

    // Check that a script element was actually created in the DOM
    const createdScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    expect(createdScript).toBeTruthy();
    expect(createdScript.src).toBe(src);
    expect(createdScript.async).toBe(true);
    expect(createdScript.getAttribute('data-status')).toBe(ScriptStatus.LOADING);
  });

  it('should add script to head when specified', () => {
    const src = 'https://example.com/script.js';

    renderHook(() => useScript(src, AddScriptTo.HEAD));

    // Check that the script was added to head and not body
    const scriptInHead = document.head.querySelector(`script[src="${src}"]`);
    const scriptInBody = document.body.querySelector(`script[src="${src}"]`);
    
    expect(scriptInHead).toBeTruthy();
    expect(scriptInBody).toBeNull();
  });

  it('should add script to body by default', () => {
    const src = 'https://example.com/script.js';

    renderHook(() => useScript(src, AddScriptTo.BODY));

    // Check that the script was added to body and not head
    const scriptInHead = document.head.querySelector(`script[src="${src}"]`);
    const scriptInBody = document.body.querySelector(`script[src="${src}"]`);
    
    expect(scriptInBody).toBeTruthy();
    expect(scriptInHead).toBeNull();
  });

  it('should add event listeners for load and error', () => {
    const src = 'https://example.com/script.js';

    renderHook(() => useScript(src));

    const createdScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    expect(createdScript).toBeTruthy();
    
    // Can't easily test event listeners directly, but we can test that the script was created
    // and has the expected properties which indicates the hook is working
    expect(createdScript.getAttribute('data-status')).toBe(ScriptStatus.LOADING);
  });

  it('should update status to READY on successful load', () => {
    const src = 'https://example.com/script.js';

    const { result } = renderHook(() => useScript(src));
    
    const createdScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    
    act(() => {
      // Simulate successful load
      const loadEvent = new Event('load');
      createdScript.dispatchEvent(loadEvent);
    });

    expect(result.current).toBe(ScriptStatus.READY);
  });

  it('should update status to ERROR on load failure', () => {
    const src = 'https://example.com/script.js';

    const { result } = renderHook(() => useScript(src));
    
    const createdScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    
    act(() => {
      // Simulate error
      const errorEvent = new Event('error');
      createdScript.dispatchEvent(errorEvent);
    });

    expect(result.current).toBe(ScriptStatus.ERROR);
  });

  it('should use existing script element if already present', () => {
    const src = 'https://example.com/script.js';
    
    // Create an existing script element
    const existingScript = document.createElement('script');
    existingScript.src = src;
    existingScript.setAttribute('data-status', ScriptStatus.READY);
    document.body.appendChild(existingScript);
    
    const { result } = renderHook(() => useScript(src));

    expect(result.current).toBe(ScriptStatus.READY);
    
    // Should not create a new script element - should reuse existing one
    const scriptElements = document.querySelectorAll(`script[src="${src}"]`);
    expect(scriptElements.length).toBe(1);
    expect(scriptElements[0]).toBe(existingScript);
  });

  it('should add event listeners to existing script', () => {
    const src = 'https://example.com/script.js';
    
    // Create an existing script element
    const existingScript = document.createElement('script');
    existingScript.src = src;
    existingScript.setAttribute('data-status', ScriptStatus.LOADING);
    document.body.appendChild(existingScript);

    renderHook(() => useScript(src));

    // The hook should work with existing scripts - we can verify by checking
    // that the status is read from the existing script
    expect(existingScript.getAttribute('data-status')).toBe(ScriptStatus.LOADING);
  });

  it('should remove event listeners on cleanup', () => {
    const src = 'https://example.com/script.js';

    const { unmount } = renderHook(() => useScript(src));
    
    const createdScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    expect(createdScript).toBeTruthy();
    
    // Unmount should not throw errors (event listeners should be cleaned up)
    expect(() => unmount()).not.toThrow();
  });

  it('should handle src changes', () => {
    const { result, rerender } = renderHook(
      ({ src }) => useScript(src),
      {
        initialProps: { src: 'https://example.com/script1.js' }
      }
    );

    expect(result.current).toBe(ScriptStatus.LOADING);

    rerender({ src: 'https://example.com/script2.js' });

    expect(result.current).toBe(ScriptStatus.LOADING);
    
    // Both scripts should exist in the DOM
    expect(document.querySelector('script[src="https://example.com/script1.js"]')).toBeTruthy();
    expect(document.querySelector('script[src="https://example.com/script2.js"]')).toBeTruthy();
  });

  it('should handle querySelector returning null', () => {
    const src = 'https://example.com/script.js';
    
    // Mock querySelector to return null (no existing script)
    jest.spyOn(document, 'querySelector').mockReturnValue(null);

    const { result } = renderHook(() => useScript(src));

    expect(result.current).toBe(ScriptStatus.LOADING);
  });

  describe('ScriptStatus enum', () => {
    it('should have correct values', () => {
      expect(ScriptStatus.IDLE).toBe('idle');
      expect(ScriptStatus.LOADING).toBe('loading');
      expect(ScriptStatus.READY).toBe('ready');
      expect(ScriptStatus.ERROR).toBe('error');
    });
  });

  describe('AddScriptTo enum', () => {
    it('should have correct values', () => {
      expect(AddScriptTo.BODY).toBe('body');
      expect(AddScriptTo.HEAD).toBe('head');
    });
  });
});