import { IconDefinition, IconRegistry, IconCategory } from './types';

// Built-in icon definitions based on our existing components
const BUILTIN_ICONS: IconDefinition[] = [
  // Business & Office
  {
    name: 'business',
    category: 'business',
    importPath: '@/components/icons/BusinessIcon',
    type: 'tsx',
    keywords: ['office', 'work', 'company', 'building']
  },
  
  // Actions & UI
  {
    name: 'upload',
    category: 'actions',
    importPath: '@/components/icons/UploadIcon',
    type: 'tsx',
    keywords: ['file', 'transfer', 'import', 'add']
  },
  
  // Content & Media
  {
    name: 'color-lens',
    category: 'content',
    importPath: '@/components/icons/ColorLensIcon',
    type: 'tsx',
    keywords: ['color', 'paint', 'design', 'theme', 'palette']
  },
  
  {
    name: 'preview',
    category: 'content',
    importPath: '@/components/icons/PreviewIcon',
    type: 'tsx',
    keywords: ['view', 'eye', 'show', 'display']
  },

  // Navigation & Menu (expandable)
  {
    name: 'dashboard',
    category: 'navigation',
    importPath: '@/assets/icons/dashboard',
    type: 'tsx',
    keywords: ['home', 'overview', 'main', 'start']
  },

  {
    name: 'settings',
    category: 'navigation',
    importPath: '@/assets/icons/settings',
    type: 'tsx',
    keywords: ['configuration', 'preferences', 'options', 'gear']
  },

  // File operations
  {
    name: 'folder',
    category: 'file',
    importPath: '@/assets/icons/folder',
    type: 'tsx',
    keywords: ['directory', 'storage', 'organize']
  },

  // Alerts & Status
  {
    name: 'error',
    category: 'alerts',
    importPath: '@/assets/icons/error',
    type: 'tsx',
    keywords: ['warning', 'danger', 'problem', 'issue']
  },

  {
    name: 'success',
    category: 'alerts',
    importPath: '@/assets/icons/success',
    type: 'tsx',
    keywords: ['check', 'done', 'complete', 'ok']
  },

  {
    name: 'info',
    category: 'alerts',
    importPath: '@/assets/icons/info',
    type: 'tsx',
    keywords: ['information', 'help', 'about']
  },

  {
    name: 'warning',
    category: 'alerts',
    importPath: '@/assets/icons/warning',
    type: 'tsx',
    keywords: ['caution', 'alert', 'attention']
  },
];

// Create registry from definitions
function createRegistry(definitions: IconDefinition[]): IconRegistry {
  const registry: IconRegistry = {};
  
  definitions.forEach(definition => {
    registry[definition.name] = definition;
  });
  
  return registry;
}

// Default icon registry
export const DEFAULT_ICON_REGISTRY = createRegistry(BUILTIN_ICONS);

// Registry management functions
export class IconRegistryManager {
  private registry: IconRegistry;
  private aliases: Record<string, string> = {};

  constructor(initialRegistry: IconRegistry = DEFAULT_ICON_REGISTRY) {
    this.registry = { ...initialRegistry };
  }

  // Register a new icon
  register(definition: IconDefinition): void {
    this.registry[definition.name] = definition;
  }

  // Register multiple icons
  registerBatch(definitions: IconDefinition[]): void {
    definitions.forEach(def => this.register(def));
  }

  // Get icon definition
  get(name: string): IconDefinition | null {
    // Check aliases first
    const actualName = this.aliases[name] || name;
    return this.registry[actualName] || null;
  }

  // Check if icon exists
  has(name: string): boolean {
    return this.get(name) !== null;
  }

  // Get all available icons
  getAll(): IconRegistry {
    return { ...this.registry };
  }

  // Get icons by category
  getByCategory(category: IconCategory): IconDefinition[] {
    return Object.values(this.registry).filter(def => def.category === category);
  }

  // Search icons by keywords
  search(query: string): IconDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    
    return Object.values(this.registry).filter(def => {
      // Search in name
      if (def.name.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      // Search in keywords
      if (def.keywords?.some(keyword => 
        keyword.toLowerCase().includes(lowercaseQuery)
      )) {
        return true;
      }
      
      // Search in category
      if (def.category.toLowerCase().includes(lowercaseQuery)) {
        return true;
      }
      
      return false;
    });
  }

  // Create alias for an icon
  alias(fromName: string, toName: string): void {
    if (!this.has(toName)) {
      throw new Error(`Cannot create alias: target icon "${toName}" does not exist`);
    }
    this.aliases[fromName] = toName;
  }

  // Remove icon
  remove(name: string): boolean {
    if (this.registry[name]) {
      delete this.registry[name];
      return true;
    }
    return false;
  }

  // Get categories
  getCategories(): IconCategory[] {
    const categories = new Set<IconCategory>();
    Object.values(this.registry).forEach(def => {
      categories.add(def.category);
    });
    return Array.from(categories);
  }

  // Get icon names by category
  getIconNames(category?: IconCategory): string[] {
    if (category) {
      return this.getByCategory(category).map(def => def.name);
    }
    return Object.keys(this.registry);
  }

  // Validate registry
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.entries(this.registry).forEach(([name, def]) => {
      if (name !== def.name) {
        errors.push(`Icon name mismatch: registry key "${name}" !== definition name "${def.name}"`);
      }
      
      if (!def.importPath) {
        errors.push(`Icon "${name}" missing import path`);
      }
      
      if (!['svg', 'tsx', 'mui'].includes(def.type)) {
        errors.push(`Icon "${name}" has invalid type: ${def.type}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export registry for persistence
  export(): IconDefinition[] {
    return Object.values(this.registry);
  }

  // Import registry from external source
  import(definitions: IconDefinition[]): void {
    this.registry = createRegistry(definitions);
  }

  // Merge with another registry
  merge(otherRegistry: IconRegistry): void {
    Object.assign(this.registry, otherRegistry);
  }

  // Get statistics
  getStats(): {
    totalIcons: number;
    categoryCounts: Record<IconCategory, number>;
    typeDistribution: Record<string, number>;
  } {
    const stats = {
      totalIcons: Object.keys(this.registry).length,
      categoryCounts: {} as Record<IconCategory, number>,
      typeDistribution: {} as Record<string, number>
    };

    Object.values(this.registry).forEach(def => {
      // Count by category
      stats.categoryCounts[def.category] = (stats.categoryCounts[def.category] || 0) + 1;
      
      // Count by type
      stats.typeDistribution[def.type] = (stats.typeDistribution[def.type] || 0) + 1;
    });

    return stats;
  }
}

// Default registry manager instance
export const defaultIconRegistry = new IconRegistryManager();
