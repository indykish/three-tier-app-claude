/**
 * Color utility functions for the branding system
 */

/**
 * Adjusts the brightness of a hex color
 * @param color - Hex color string (e.g., "#ff0000")
 * @param percent - Percentage to adjust (-100 to 100)
 * @returns Adjusted hex color string
 */
export const adjustColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

/**
 * Determines if a color is dark or light
 * @param color - Hex color string
 * @returns true if color is dark, false if light
 */
export const isColorDark = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness <= 128;
};

/**
 * Gets the appropriate text color (black or white) for a given background color
 * @param backgroundColor - Hex color string
 * @returns "#ffffff" for dark backgrounds, "#000000" for light backgrounds
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  return isColorDark(backgroundColor) ? '#ffffff' : '#000000';
};

/**
 * Converts RGB to Hex
 * @param r - Red value (0-255)
 * @param g - Green value (0-255) 
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Converts Hex to RGB
 * @param hex - Hex color string
 * @returns RGB object with r, g, b properties
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
