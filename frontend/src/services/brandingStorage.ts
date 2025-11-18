import { BrandingSettings, DEFAULT_BRANDING } from '@/types/branding';

const STORAGE_KEY = 'branding_settings';

export class BrandingStorage {
  static save(settings: BrandingSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log('Branding settings saved to localStorage');
    } catch (error) {
      console.error('Failed to save branding settings:', error);
    }
  }

  static load(): BrandingSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored) as BrandingSettings;
        console.log('Branding settings loaded from localStorage');
        return settings;
      }
    } catch (error) {
      console.error('Failed to load branding settings:', error);
    }
    return null;
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Branding settings cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear branding settings:', error);
    }
  }

  static exists(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  static getOrDefault(): BrandingSettings {
    return this.load() || DEFAULT_BRANDING;
  }
}

// Utility function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
};
