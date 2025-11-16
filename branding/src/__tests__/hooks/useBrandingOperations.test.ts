import { renderHook, act, waitFor } from '@testing-library/react';
import { useBrandingOperations, BrandingOperationStatus } from '@/hooks/useBrandingOperations';
import { BrandingStorage } from '@/services/brandingStorage';
import { mockBrandingSettings } from '../utils/test-utils';

// Mock the storage
jest.mock('@/services/brandingStorage');
const mockBrandingStorage = BrandingStorage as jest.Mocked<typeof BrandingStorage>;

describe('useBrandingOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useBrandingOperations());

    expect(result.current.status).toBe(BrandingOperationStatus.IDLE);
    expect(result.current.error).toBeUndefined();
    expect(typeof result.current.saveSettings).toBe('function');
    expect(typeof result.current.loadSettings).toBe('function');
    expect(typeof result.current.resetSettings).toBe('function');
    expect(typeof result.current.updateColor).toBe('function');
    expect(typeof result.current.updateFont).toBe('function');
    expect(typeof result.current.exportSettings).toBe('function');
    expect(typeof result.current.importSettings).toBe('function');
  });

  describe('saveSettings', () => {
    it('should save settings successfully', async () => {
      mockBrandingStorage.save.mockImplementation(() => {});
      const { result } = renderHook(() => useBrandingOperations());

      act(() => {
        result.current.saveSettings(mockBrandingSettings);
      });

      expect(result.current.status).toBe(BrandingOperationStatus.SAVING);

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.SUCCESS);
      });

      expect(mockBrandingStorage.save).toHaveBeenCalledWith(mockBrandingSettings);

      // Should reset to idle after 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.IDLE);
      });
    });

    it('should handle save errors', async () => {
      const error = new Error('Save failed');
      mockBrandingStorage.save.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useBrandingOperations());

      act(() => {
        result.current.saveSettings(mockBrandingSettings);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.ERROR);
        expect(result.current.error).toBe('Save failed');
      });
    });
  });

  describe('loadSettings', () => {
    it('should load settings successfully', async () => {
      mockBrandingStorage.load.mockReturnValue(mockBrandingSettings);
      const { result } = renderHook(() => useBrandingOperations());

      let loadResult: any;
      await act(async () => {
        loadResult = await result.current.loadSettings();
      });

      expect(result.current.status).toBe(BrandingOperationStatus.SUCCESS);
      expect(loadResult).toEqual(mockBrandingSettings);

      // Should reset to idle
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.IDLE);
      });
    });

    it('should handle load errors', async () => {
      const error = new Error('Load failed');
      mockBrandingStorage.load.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useBrandingOperations());

      let loadResult: any;
      act(() => {
        result.current.loadSettings().then((data) => {
          loadResult = data;
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.ERROR);
        expect(result.current.error).toBe('Load failed');
        expect(loadResult).toBeNull();
      });
    });
  });

  describe('resetSettings', () => {
    it('should reset settings successfully', async () => {
      mockBrandingStorage.clear.mockImplementation(() => {});
      const { result } = renderHook(() => useBrandingOperations());

      await act(async () => {
        await result.current.resetSettings();
      });

      expect(result.current.status).toBe(BrandingOperationStatus.SUCCESS);
      expect(mockBrandingStorage.clear).toHaveBeenCalled();
    });

    it('should handle reset errors', async () => {
      const error = new Error('Reset failed');
      mockBrandingStorage.clear.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useBrandingOperations());

      act(() => {
        result.current.resetSettings();
      });

      await waitFor(() => {
        expect(result.current.status).toBe(BrandingOperationStatus.ERROR);
        expect(result.current.error).toBe('Reset failed');
      });
    });
  });

  describe('updateColor', () => {
    it('should update regular color', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const updated = result.current.updateColor('text_color', '#ff0000', mockBrandingSettings);

      expect(updated.theme.text_color).toBe('#ff0000');
      expect(updated.theme.theme_color).toBe(mockBrandingSettings.theme.theme_color); // unchanged
    });

    it('should update theme_color and generate button colors', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const updated = result.current.updateColor('theme_color', '#00ff00', mockBrandingSettings);

      expect(updated.theme.theme_color).toBe('#00ff00');
      expect(updated.theme.button.primary_color).toBe('#00ff00');
      expect(updated.theme.button.hover_color).toBeDefined();
      expect(updated.theme.button.hover_color).not.toBe('#00ff00'); // Should be darker
    });
  });

  describe('updateFont', () => {
    it('should update font family', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const updated = result.current.updateFont('Georgia, serif', mockBrandingSettings);

      expect(updated.theme.font_family).toBe('Georgia, serif');
    });
  });

  describe('exportSettings', () => {
    it('should export settings as JSON', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const exported = result.current.exportSettings(mockBrandingSettings);

      expect(typeof exported).toBe('string');
      expect(JSON.parse(exported)).toEqual(mockBrandingSettings);
    });

    it('should handle export errors', () => {
      const { result } = renderHook(() => useBrandingOperations());

      // Create circular reference
      const circular: any = { ...mockBrandingSettings };
      circular.circular = circular;

      expect(() => {
        result.current.exportSettings(circular);
      }).toThrow('Failed to export settings');
    });
  });

  describe('importSettings', () => {
    it('should import valid settings JSON', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const json = JSON.stringify(mockBrandingSettings);
      const imported = result.current.importSettings(json);

      expect(imported).toEqual(mockBrandingSettings);
    });

    it('should handle invalid JSON', () => {
      const { result } = renderHook(() => useBrandingOperations());

      expect(() => {
        result.current.importSettings('invalid json');
      }).toThrow('Failed to parse settings JSON');
    });

    it('should handle invalid settings structure', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const invalidSettings = { invalid: 'structure' };
      const json = JSON.stringify(invalidSettings);

      expect(() => {
        result.current.importSettings(json);
      }).toThrow('Failed to parse settings JSON');
    });

    it('should merge with defaults for partial settings', () => {
      const { result } = renderHook(() => useBrandingOperations());

      const partialSettings = {
        companyName: 'Test Company',
        theme: {
          theme_color: '#ff0000',
          button: {
            primary_color: '#ff0000',
          },
        },
        capabilities: {
          general_app_title: 'Test App',
        },
      };

      const json = JSON.stringify(partialSettings);
      const imported = result.current.importSettings(json);

      expect(imported.companyName).toBe('Test Company');
      expect(imported.theme.theme_color).toBe('#ff0000');
      expect(imported.theme.text_color).toBeDefined(); // Should be filled from defaults
      expect(imported.theme.button.secondary_color).toBeDefined(); // Should be filled from defaults
    });
  });
});
