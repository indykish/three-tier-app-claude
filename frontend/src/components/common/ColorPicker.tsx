import React, { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className = "",
  helperText,
  error = false,
  disabled = false
}) => {
  const [hexInput, setHexInput] = useState(value);

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    let hexValue = event.target.value;
    
    // Remove any non-hex characters except #
    hexValue = hexValue.replace(/[^#0-9A-Fa-f]/g, '');
    
    // Ensure it starts with #
    if (!hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }
    
    // Limit to 7 characters (#FFFFFF)
    hexValue = hexValue.substring(0, 7);
    
    setHexInput(hexValue);
    
    // Call onChange for valid hex colors (including 3-character codes)
    if (/^#[0-9A-F]{3}$/i.test(hexValue)) {
      // Convert 3-char to 6-char hex
      const expanded = '#' + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3];
      onChange(expanded.toUpperCase());
    } else if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
      onChange(hexValue.toUpperCase());
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(event.target.value);
  };

  // Update hexInput when value changes from color picker
  React.useEffect(() => {
    setHexInput(value);
  }, [value]);

  const isInvalidHex = hexInput.length > 1 && !/^#[0-9A-F]{6}$/i.test(hexInput);
  const showError = error || isInvalidHex;
  const errorText = error ? helperText : (isInvalidHex ? "Enter valid hex color (e.g., #FF0000)" : "");

  return (
    <Box className={className}>
      <Typography variant="body2" className="mb-2 font-medium">
        {label}
      </Typography>
      <Box className="space-y-2">
        {/* Color Picker */}
        <Box className="relative">
          <input
            type="color"
            value={value}
            onChange={handleColorChange}
            disabled={disabled}
            data-testid="color-input"
            className="w-full h-12 rounded-xl cursor-pointer border-0 outline-none shadow-md hover:shadow-lg transition-shadow duration-200"
            style={{
              backgroundColor: value,
              background: `linear-gradient(135deg, ${value} 0%, ${value}dd 100%)`,
              boxShadow: `0 4px 12px ${value}40`,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
        </Box>
        {/* Hex Input */}
        <TextField
          size="small"
          value={hexInput}
          onChange={handleHexChange}
          placeholder="#000000"
          variant="outlined"
          fullWidth
          disabled={disabled}
          error={showError}
          helperText={errorText || helperText}
          inputProps={{
            style: { 
              fontFamily: 'monospace',
              textTransform: 'uppercase'
            },
            'aria-label': `Hex color input for ${label}`,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '36px',
              fontSize: '0.875rem',
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.75rem',
              marginTop: '2px'
            }
          }}
        />
      </Box>
    </Box>
  );
};
