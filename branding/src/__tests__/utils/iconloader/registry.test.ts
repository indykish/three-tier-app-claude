import { IconRegistryManager, DEFAULT_ICON_REGISTRY, defaultIconRegistry } from '@/utils/iconloader/registry';
import { IconDefinition, IconCategory } from '@/utils/iconloader/types';

const mockIconDefinition: IconDefinition = {
  name: 'test-icon',
  category: 'actions',
  importPath: '@/components/TestIcon',
  type: 'tsx',
  keywords: ['test', 'example']
};

const mockIconDefinition2: IconDefinition = {
  name: 'another-icon',
  category: 'business',
  importPath: '@/components/AnotherIcon',
  type: 'svg'
};

describe('IconRegistryManager', () => {
  let manager: IconRegistryManager;

  beforeEach(() => {
    manager = new IconRegistryManager({});
  });

  describe('constructor', () => {
    it('should initialize with empty registry', () => {
      expect(manager.getAll()).toEqual({});
    });

    it('should initialize with provided registry', () => {
      const registry = { 'test': mockIconDefinition };
      const newManager = new IconRegistryManager(registry);
      expect(newManager.get('test')).toEqual(mockIconDefinition);
    });

    it('should initialize with default registry', () => {
      const defaultManager = new IconRegistryManager();
      const allIcons = defaultManager.getAll();
      expect(Object.keys(allIcons).length).toBeGreaterThan(0);
    });
  });

  describe('register', () => {
    it('should register a new icon', () => {
      manager.register(mockIconDefinition);
      expect(manager.get('test-icon')).toEqual(mockIconDefinition);
    });

    it('should overwrite existing icon', () => {
      manager.register(mockIconDefinition);
      const updatedIcon = { ...mockIconDefinition, keywords: ['updated'] };
      manager.register(updatedIcon);
      expect(manager.get('test-icon')).toEqual(updatedIcon);
    });
  });

  describe('registerBatch', () => {
    it('should register multiple icons', () => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
      expect(manager.get('test-icon')).toEqual(mockIconDefinition);
      expect(manager.get('another-icon')).toEqual(mockIconDefinition2);
    });

    it('should handle empty array', () => {
      manager.registerBatch([]);
      expect(Object.keys(manager.getAll())).toHaveLength(0);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      manager.register(mockIconDefinition);
    });

    it('should return icon definition if exists', () => {
      expect(manager.get('test-icon')).toEqual(mockIconDefinition);
    });

    it('should return null if icon does not exist', () => {
      expect(manager.get('non-existent')).toBeNull();
    });

    it('should resolve aliases', () => {
      manager.alias('alias-name', 'test-icon');
      expect(manager.get('alias-name')).toEqual(mockIconDefinition);
    });
  });

  describe('has', () => {
    beforeEach(() => {
      manager.register(mockIconDefinition);
    });

    it('should return true for existing icon', () => {
      expect(manager.has('test-icon')).toBe(true);
    });

    it('should return false for non-existent icon', () => {
      expect(manager.has('non-existent')).toBe(false);
    });

    it('should return true for aliased icon', () => {
      manager.alias('alias-name', 'test-icon');
      expect(manager.has('alias-name')).toBe(true);
    });
  });

  describe('getByCategory', () => {
    beforeEach(() => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
    });

    it('should return icons by category', () => {
      const actionsIcons = manager.getByCategory('actions');
      expect(actionsIcons).toHaveLength(1);
      expect(actionsIcons[0]).toEqual(mockIconDefinition);
    });

    it('should return empty array for non-existent category', () => {
      const result = manager.getByCategory('navigation');
      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
    });

    it('should search by name', () => {
      const results = manager.search('test');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockIconDefinition);
    });

    it('should search by keywords', () => {
      const results = manager.search('example');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockIconDefinition);
    });

    it('should search by category', () => {
      const results = manager.search('business');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockIconDefinition2);
    });

    it('should be case insensitive', () => {
      const results = manager.search('TEST');
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockIconDefinition);
    });

    it('should return empty array for no matches', () => {
      const results = manager.search('non-existent');
      expect(results).toEqual([]);
    });
  });

  describe('alias', () => {
    beforeEach(() => {
      manager.register(mockIconDefinition);
    });

    it('should create alias for existing icon', () => {
      manager.alias('alias-name', 'test-icon');
      expect(manager.get('alias-name')).toEqual(mockIconDefinition);
    });

    it('should throw error for non-existent target', () => {
      expect(() => {
        manager.alias('alias-name', 'non-existent');
      }).toThrow('Cannot create alias: target icon "non-existent" does not exist');
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      manager.register(mockIconDefinition);
    });

    it('should remove existing icon', () => {
      expect(manager.remove('test-icon')).toBe(true);
      expect(manager.get('test-icon')).toBeNull();
    });

    it('should return false for non-existent icon', () => {
      expect(manager.remove('non-existent')).toBe(false);
    });
  });

  describe('getCategories', () => {
    beforeEach(() => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
    });

    it('should return unique categories', () => {
      const categories = manager.getCategories();
      expect(categories).toContain('actions');
      expect(categories).toContain('business');
      expect(categories).toHaveLength(2);
    });

    it('should return empty array for empty registry', () => {
      const emptyManager = new IconRegistryManager({});
      expect(emptyManager.getCategories()).toEqual([]);
    });
  });

  describe('getIconNames', () => {
    beforeEach(() => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
    });

    it('should return all icon names when no category specified', () => {
      const names = manager.getIconNames();
      expect(names).toContain('test-icon');
      expect(names).toContain('another-icon');
      expect(names).toHaveLength(2);
    });

    it('should return icon names for specific category', () => {
      const names = manager.getIconNames('actions');
      expect(names).toContain('test-icon');
      expect(names).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('should validate correct registry', () => {
      manager.register(mockIconDefinition);
      const result = manager.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect name mismatch', () => {
      const invalidIcon = { ...mockIconDefinition, name: 'different-name' };
      manager.register(invalidIcon);
      manager['registry']['test-icon'] = invalidIcon; // Force mismatch
      
      const result = manager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Icon name mismatch: registry key "test-icon" !== definition name "different-name"');
    });

    it('should detect missing import path', () => {
      const invalidIcon = { ...mockIconDefinition, importPath: '' };
      manager.register(invalidIcon);
      
      const result = manager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Icon "test-icon" missing import path');
    });

    it('should detect invalid type', () => {
      const invalidIcon = { ...mockIconDefinition, type: 'invalid' as any };
      manager.register(invalidIcon);
      
      const result = manager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Icon "test-icon" has invalid type: invalid');
    });
  });

  describe('export', () => {
    it('should export registry as array', () => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
      const exported = manager.export();
      expect(exported).toHaveLength(2);
      expect(exported).toContainEqual(mockIconDefinition);
      expect(exported).toContainEqual(mockIconDefinition2);
    });
  });

  describe('import', () => {
    it('should import array of definitions', () => {
      manager.import([mockIconDefinition, mockIconDefinition2]);
      expect(manager.get('test-icon')).toEqual(mockIconDefinition);
      expect(manager.get('another-icon')).toEqual(mockIconDefinition2);
    });

    it('should replace existing registry', () => {
      manager.register(mockIconDefinition);
      manager.import([mockIconDefinition2]);
      expect(manager.get('test-icon')).toBeNull();
      expect(manager.get('another-icon')).toEqual(mockIconDefinition2);
    });
  });

  describe('merge', () => {
    it('should merge with another registry', () => {
      manager.register(mockIconDefinition);
      const otherRegistry = { 'another-icon': mockIconDefinition2 };
      manager.merge(otherRegistry);
      
      expect(manager.get('test-icon')).toEqual(mockIconDefinition);
      expect(manager.get('another-icon')).toEqual(mockIconDefinition2);
    });

    it('should overwrite conflicting entries', () => {
      manager.register(mockIconDefinition);
      const updatedIcon = { ...mockIconDefinition, keywords: ['updated'] };
      const otherRegistry = { 'test-icon': updatedIcon };
      manager.merge(otherRegistry);
      
      expect(manager.get('test-icon')).toEqual(updatedIcon);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      manager.registerBatch([mockIconDefinition, mockIconDefinition2]);
    });

    it('should return correct statistics', () => {
      const stats = manager.getStats();
      expect(stats.totalIcons).toBe(2);
      expect(stats.categoryCounts.actions).toBe(1);
      expect(stats.categoryCounts.business).toBe(1);
      expect(stats.typeDistribution.tsx).toBe(1);
      expect(stats.typeDistribution.svg).toBe(1);
    });

    it('should handle empty registry', () => {
      const emptyManager = new IconRegistryManager({});
      const stats = emptyManager.getStats();
      expect(stats.totalIcons).toBe(0);
      expect(stats.categoryCounts).toEqual({});
      expect(stats.typeDistribution).toEqual({});
    });
  });
});

describe('DEFAULT_ICON_REGISTRY', () => {
  it('should contain built-in icons', () => {
    expect(Object.keys(DEFAULT_ICON_REGISTRY).length).toBeGreaterThan(0);
  });

  it('should contain specific built-in icons', () => {
    expect(DEFAULT_ICON_REGISTRY.business).toBeDefined();
    expect(DEFAULT_ICON_REGISTRY.upload).toBeDefined();
    expect(DEFAULT_ICON_REGISTRY.error).toBeDefined();
  });
});

describe('defaultIconRegistry', () => {
  it('should be instance of IconRegistryManager', () => {
    expect(defaultIconRegistry).toBeInstanceOf(IconRegistryManager);
  });

  it('should have built-in icons available', () => {
    expect(defaultIconRegistry.has('business')).toBe(true);
    expect(defaultIconRegistry.has('upload')).toBe(true);
  });
});