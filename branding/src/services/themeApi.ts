import { BrandingSettings } from '@/types/branding';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ThemeResponse extends BrandingSettings {
  id: number;
  name: string;
}

export class ThemeAPI {
  static async getAll(): Promise<ThemeResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/themes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch themes: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: number): Promise<ThemeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/themes/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch theme: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(name: string, settings: BrandingSettings): Promise<ThemeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        ...settings,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create theme: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: number, name: string, settings: BrandingSettings): Promise<ThemeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/themes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        ...settings,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update theme: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/themes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete theme: ${response.statusText}`);
    }
  }

  // Get the first available theme (for initial load)
  static async getFirst(): Promise<ThemeResponse | null> {
    const themes = await this.getAll();
    return themes.length > 0 ? themes[0] : null;
  }
}
