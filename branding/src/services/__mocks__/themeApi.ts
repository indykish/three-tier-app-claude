import { BrandingSettings } from '@/types/branding';

interface ThemeResponse extends BrandingSettings {
  id: number;
  name: string;
}

export class ThemeAPI {
  static async getAll(): Promise<ThemeResponse[]> {
    return [];
  }

  static async getById(id: number): Promise<ThemeResponse> {
    throw new Error(`Theme ${id} not found`);
  }

  static async create(name: string, settings: BrandingSettings): Promise<ThemeResponse> {
    return {
      id: 1,
      name,
      ...settings,
    };
  }

  static async update(id: number, name: string, settings: BrandingSettings): Promise<ThemeResponse> {
    return {
      id,
      name,
      ...settings,
    };
  }

  static async delete(id: number): Promise<void> {
    // Mock deletion
  }
}
