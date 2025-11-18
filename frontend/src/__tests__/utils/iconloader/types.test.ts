import { 
  ICON_SIZES, 
  DEFAULT_ICON_CONFIG, 
  IconLoadStatus,
  IconSizes,
  IconCategory,
  IconVariant 
} from '@/utils/iconloader/types';

describe('IconLoader Types', () => {
  describe('ICON_SIZES', () => {
    it('should have correct size mappings', () => {
      expect(ICON_SIZES.sm).toBe('16px');
      expect(ICON_SIZES.md).toBe('20px');
      expect(ICON_SIZES.lg).toBe('24px');
      expect(ICON_SIZES.xl).toBe('32px');
    });

    it('should contain all IconSizes keys', () => {
      const expectedKeys: IconSizes[] = ['sm', 'md', 'lg', 'xl'];
      const actualKeys = Object.keys(ICON_SIZES) as IconSizes[];
      
      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  describe('DEFAULT_ICON_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_ICON_CONFIG.baseUrl).toBe('');
      expect(DEFAULT_ICON_CONFIG.cacheTTL).toBe(5 * 60 * 1000);
      expect(DEFAULT_ICON_CONFIG.preloadIcons).toEqual([]);
      expect(DEFAULT_ICON_CONFIG.fallbackIcon).toBe('error');
      expect(DEFAULT_ICON_CONFIG.enableCache).toBe(true);
      expect(DEFAULT_ICON_CONFIG.logErrors).toBe(true);
    });

    it('should be immutable', () => {
      const originalConfig = { ...DEFAULT_ICON_CONFIG };
      DEFAULT_ICON_CONFIG.cacheTTL = 1000;
      expect(DEFAULT_ICON_CONFIG.cacheTTL).toBe(1000);
      DEFAULT_ICON_CONFIG.cacheTTL = originalConfig.cacheTTL;
    });
  });

  describe('IconLoadStatus', () => {
    it('should have correct enum values', () => {
      expect(IconLoadStatus.IDLE).toBe('idle');
      expect(IconLoadStatus.LOADING).toBe('loading');
      expect(IconLoadStatus.LOADED).toBe('loaded');
      expect(IconLoadStatus.ERROR).toBe('error');
      expect(IconLoadStatus.CACHED).toBe('cached');
    });

    it('should contain all expected status values', () => {
      const expectedValues = ['idle', 'loading', 'loaded', 'error', 'cached'];
      const actualValues = Object.values(IconLoadStatus);
      
      expectedValues.forEach(value => {
        expect(actualValues).toContain(value);
      });
    });
  });

  describe('Type definitions', () => {
    it('should define IconCategory types correctly', () => {
      const validCategories: IconCategory[] = [
        'business',
        'navigation', 
        'actions',
        'alerts',
        'content',
        'menu',
        'social',
        'file',
        'editor'
      ];

      validCategories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });

    it('should define IconVariant types correctly', () => {
      const validVariants: IconVariant[] = ['outlined', 'filled', 'rounded', 'sharp'];
      
      validVariants.forEach(variant => {
        expect(typeof variant).toBe('string');
      });
    });

    it('should define IconSizes types correctly', () => {
      const validSizes: IconSizes[] = ['sm', 'md', 'lg', 'xl'];
      
      validSizes.forEach(size => {
        expect(typeof size).toBe('string');
        expect(ICON_SIZES[size]).toBeDefined();
      });
    });
  });
});