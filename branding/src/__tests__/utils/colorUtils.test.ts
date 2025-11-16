import {
  adjustColor,
  isColorDark,
  getContrastTextColor,
  rgbToHex,
  hexToRgb
} from '@/utils/colorUtils';

describe('colorUtils', () => {
  describe('adjustColor', () => {
    it('should lighten color with positive percentage', () => {
      const result = adjustColor('#808080', 20);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      // Should be lighter than original
      expect(parseInt(result.slice(1), 16)).toBeGreaterThan(parseInt('808080', 16));
    });

    it('should darken color with negative percentage', () => {
      const result = adjustColor('#808080', -20);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      // Should be darker than original
      expect(parseInt(result.slice(1), 16)).toBeLessThan(parseInt('808080', 16));
    });

    it('should return same color with 0 percentage', () => {
      const color = '#ff0000';
      const result = adjustColor(color, 0);
      expect(result).toBe(color);
    });

    it('should handle maximum lightening', () => {
      const result = adjustColor('#000000', 100);
      expect(result).toBe('#ffffff');
    });

    it('should handle maximum darkening', () => {
      const result = adjustColor('#ffffff', -100);
      expect(result).toBe('#000000');
    });

    it('should handle color without # prefix', () => {
      const result = adjustColor('ff0000', 0);
      expect(result).toBe('#ff0000');
    });

    it('should clamp values at boundaries', () => {
      // Test clamping to 255
      const bright = adjustColor('#fe0000', 10);
      expect(bright).toMatch(/^#ff/);
      
      // Test clamping to 0
      const dark = adjustColor('#010000', -10);
      expect(dark).toMatch(/^#00/);
    });
  });

  describe('isColorDark', () => {
    it('should return true for dark colors', () => {
      expect(isColorDark('#000000')).toBe(true);
      expect(isColorDark('#333333')).toBe(true);
      expect(isColorDark('#0000ff')).toBe(true);
      expect(isColorDark('#008000')).toBe(true);
    });

    it('should return false for light colors', () => {
      expect(isColorDark('#ffffff')).toBe(false);
      expect(isColorDark('#cccccc')).toBe(false);
      expect(isColorDark('#ffff00')).toBe(false);
      expect(isColorDark('#ff69b4')).toBe(false);
    });

    it('should handle borderline colors', () => {
      // Test around the 128 brightness threshold
      expect(isColorDark('#808080')).toBe(true); // Exactly 128, should be dark
      expect(isColorDark('#818181')).toBe(false); // Just above 128
    });

    it('should handle color without # prefix', () => {
      expect(isColorDark('000000')).toBe(true);
      expect(isColorDark('ffffff')).toBe(false);
    });
  });

  describe('getContrastTextColor', () => {
    it('should return white for dark backgrounds', () => {
      expect(getContrastTextColor('#000000')).toBe('#ffffff');
      expect(getContrastTextColor('#333333')).toBe('#ffffff');
      expect(getContrastTextColor('#0000ff')).toBe('#ffffff');
    });

    it('should return black for light backgrounds', () => {
      expect(getContrastTextColor('#ffffff')).toBe('#000000');
      expect(getContrastTextColor('#cccccc')).toBe('#000000');
      expect(getContrastTextColor('#ffff00')).toBe('#000000');
    });

    it('should be consistent with isColorDark', () => {
      const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      colors.forEach(color => {
        const isDark = isColorDark(color);
        const contrastColor = getContrastTextColor(color);
        
        if (isDark) {
          expect(contrastColor).toBe('#ffffff');
        } else {
          expect(contrastColor).toBe('#000000');
        }
      });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB values to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should handle mid-range RGB values', () => {
      expect(rgbToHex(128, 128, 128)).toBe('#808080');
      expect(rgbToHex(255, 128, 0)).toBe('#ff8000');
      expect(rgbToHex(64, 192, 32)).toBe('#40c020');
    });

    it('should pad single digit hex values with zeros', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
      expect(rgbToHex(15, 15, 15)).toBe('#0f0f0f');
    });

    it('should handle boundary values', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });
  });

  describe('hexToRgb', () => {
    it('should convert hex to RGB object', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('808080')).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('should handle lowercase and uppercase hex', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#FfAaBb')).toEqual({ r: 255, g: 170, b: 187 });
    });

    it('should return null for invalid hex strings', () => {
      expect(hexToRgb('#gggggg')).toBeNull();
      expect(hexToRgb('#ff00')).toBeNull();
      expect(hexToRgb('#ff00000')).toBeNull();
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });

    it('should be inverse of rgbToHex', () => {
      const testCases = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 128, g: 128, b: 128 },
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 0, b: 0 },
        { r: 192, g: 64, b: 128 }
      ];

      testCases.forEach(({ r, g, b }) => {
        const hex = rgbToHex(r, g, b);
        const rgb = hexToRgb(hex);
        expect(rgb).toEqual({ r, g, b });
      });
    });
  });

  describe('integration tests', () => {
    it('should work together for common use cases', () => {
      const baseColor = '#ff0000';
      
      // Lighten the color
      const lightenedColor = adjustColor(baseColor, 20);
      
      // Check if it's still red-ish
      const rgb = hexToRgb(lightenedColor);
      expect(rgb).not.toBeNull();
      expect(rgb!.r).toBeGreaterThan(rgb!.g);
      expect(rgb!.r).toBeGreaterThan(rgb!.b);
      
      // Get appropriate text color
      const textColor = getContrastTextColor(lightenedColor);
      expect(['#ffffff', '#000000']).toContain(textColor);
    });

    it('should handle color transformations correctly', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];
      
      colors.forEach(color => {
        // Convert to RGB and back
        const rgb = hexToRgb(color);
        expect(rgb).not.toBeNull();
        
        if (rgb) {
          const backToHex = rgbToHex(rgb.r, rgb.g, rgb.b);
          expect(backToHex.toLowerCase()).toBe(color.toLowerCase());
        }
        
        // Adjust and check validity
        const adjusted = adjustColor(color, 10);
        expect(adjusted).toMatch(/^#[0-9a-f]{6}$/i);
        
        // Get contrast text
        const textColor = getContrastTextColor(color);
        expect(['#ffffff', '#000000']).toContain(textColor);
      });
    });
  });
});