import { useState, useCallback, startTransition } from 'react';
import { BrandingSettings, DEFAULT_BRANDING } from '@/types/branding';
import { BrandingStorage } from '@/services/brandingStorage';
import { adjustColor } from '@/utils/colorUtils';

export enum BrandingOperationStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface BrandingOperationResult {
  status: BrandingOperationStatus;
  error?: string;
  saveSettings: (settings: BrandingSettings) => Promise<void>;
  loadSettings: () => Promise<BrandingSettings | null>;
  resetSettings: () => Promise<void>;
  updateColor: (colorType: string, value: string, settings: BrandingSettings) => BrandingSettings;
  updateFont: (fontFamily: string, settings: BrandingSettings) => BrandingSettings;
  exportSettings: (settings: BrandingSettings) => string;
  importSettings: (jsonString: string) => BrandingSettings;
}

/**
 * Comprehensive hook for branding operations with optimistic updates
 * Includes save, load, reset, and utility functions
 */
export function useBrandingOperations(): BrandingOperationResult {
  const [status, setStatus] = useState<BrandingOperationStatus>(BrandingOperationStatus.IDLE);
  const [error, setError] = useState<string>();

  // Save settings with optimistic updates
  const saveSettings = useCallback(async (settings: BrandingSettings): Promise<void> => {
    try {
      startTransition(() => {
        setStatus(BrandingOperationStatus.SAVING);
        setError(undefined);
      });

      // Simulate network delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      BrandingStorage.save(settings);
      
      startTransition(() => {
        setStatus(BrandingOperationStatus.SUCCESS);
      });

      // Reset status after success
      setTimeout(() => {
        startTransition(() => {
          setStatus(BrandingOperationStatus.IDLE);
        });
      }, 2000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      startTransition(() => {
        setStatus(BrandingOperationStatus.ERROR);
        setError(message);
      });
    }
  }, []);

  // Load settings
  const loadSettings = useCallback(async (): Promise<BrandingSettings | null> => {
    try {
      startTransition(() => {
        setStatus(BrandingOperationStatus.LOADING);
        setError(undefined);
      });

      const settings = BrandingStorage.load();
      
      startTransition(() => {
        setStatus(BrandingOperationStatus.SUCCESS);
      });

      setTimeout(() => {
        startTransition(() => {
          setStatus(BrandingOperationStatus.IDLE);
        });
      }, 1000);

      return settings;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      startTransition(() => {
        setStatus(BrandingOperationStatus.ERROR);
        setError(message);
      });
      return null;
    }
  }, []);

  // Reset settings
  const resetSettings = useCallback(async (): Promise<void> => {
    try {
      startTransition(() => {
        setStatus(BrandingOperationStatus.SAVING);
        setError(undefined);
      });

      BrandingStorage.clear();
      
      startTransition(() => {
        setStatus(BrandingOperationStatus.SUCCESS);
      });

      setTimeout(() => {
        startTransition(() => {
          setStatus(BrandingOperationStatus.IDLE);
        });
      }, 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      startTransition(() => {
        setStatus(BrandingOperationStatus.ERROR);
        setError(message);
      });
    }
  }, []);

  // Update color with automatic hover color generation
  const updateColor = useCallback((
    colorType: string, 
    value: string, 
    settings: BrandingSettings
  ): BrandingSettings => {
    return {
      ...settings,
      theme: {
        ...settings.theme,
        [colorType]: value,
        ...(colorType === 'theme_color' && {
          button: {
            ...settings.theme.button,
            primary_color: value,
            hover_color: adjustColor(value, -20),
          }
        }),
      },
    };
  }, []);

  // Update font family
  const updateFont = useCallback((
    fontFamily: string, 
    settings: BrandingSettings
  ): BrandingSettings => {
    return {
      ...settings,
      theme: {
        ...settings.theme,
        font_family: fontFamily,
      },
    };
  }, []);

  // Export settings as JSON
  const exportSettings = useCallback((settings: BrandingSettings): string => {
    try {
      return JSON.stringify(settings, null, 2);
    } catch (err) {
      throw new Error('Failed to export settings');
    }
  }, []);

  // Import settings from JSON
  const importSettings = useCallback((jsonString: string): BrandingSettings => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate the structure
      if (!parsed.theme || !parsed.capabilities) {
        throw new Error('Invalid settings format');
      }

      // Merge with defaults to ensure all required fields exist
      return {
        ...DEFAULT_BRANDING,
        ...parsed,
        theme: {
          ...DEFAULT_BRANDING.theme,
          ...parsed.theme,
          button: {
            ...DEFAULT_BRANDING.theme.button,
            ...parsed.theme.button,
          },
          logos: {
            ...DEFAULT_BRANDING.theme.logos,
            ...parsed.theme.logos,
          },
        },
        capabilities: {
          ...DEFAULT_BRANDING.capabilities,
          ...parsed.capabilities,
        },
      };
    } catch (err) {
      throw new Error('Failed to parse settings JSON');
    }
  }, []);

  return {
    status,
    error,
    saveSettings,
    loadSettings,
    resetSettings,
    updateColor,
    updateFont,
    exportSettings,
    importSettings,
  };
}
