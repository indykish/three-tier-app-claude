import React from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';

interface FontPickerProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  className?: string;
}

const FONT_OPTIONS = [
  { value: 'Roboto, Arial, sans-serif', label: 'Roboto (Default)', preview: 'The quick brown fox jumps...' },
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (Modern)', preview: 'The quick brown fox jumps...' },
  { value: 'Poppins, sans-serif', label: 'Poppins (Friendly)', preview: 'The quick brown fox jumps...' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Clean)', preview: 'The quick brown fox jumps...' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans (Readable)', preview: 'The quick brown fox jumps...' },
  { value: 'Lato, sans-serif', label: 'Lato (Professional)', preview: 'The quick brown fox jumps...' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro', preview: 'The quick brown fox jumps...' },
  { value: 'Nunito, sans-serif', label: 'Nunito (Rounded)', preview: 'The quick brown fox jumps...' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)', preview: 'The quick brown fox jumps...' },
  { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant)', preview: 'The quick brown fox jumps...' },
];

export const FontPicker: React.FC<FontPickerProps> = ({
  label,
  value,
  onChange,
  className = ""
}) => {
  return (
    <Box className={className}>
      <Typography variant="body2" className="mb-2 font-medium">
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="medium"
          aria-label={label}
        >
          {FONT_OPTIONS.map((font) => (
            <MenuItem key={font.value} value={font.value}>
              <Box>
                <Typography 
                  variant="body1" 
                  style={{ fontFamily: font.value }}
                  className="font-medium"
                >
                  {font.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  style={{ fontFamily: font.value }}
                  className="text-gray-500"
                >
                  {font.preview}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Font Preview */}
      <Box className="mt-3 p-3 border rounded bg-gray-50">
        <Typography 
          variant="h6" 
          style={{ fontFamily: value }}
          className="mb-1"
        >
          Preview Heading
        </Typography>
        <Typography 
          variant="body1" 
          style={{ fontFamily: value }}
          className="mb-1"
        >
          This is how your body text will look with the selected font.
        </Typography>
        <Typography 
          variant="caption" 
          style={{ fontFamily: value }}
          className="text-gray-600"
        >
          Small text and captions will appear like this.
        </Typography>
      </Box>
    </Box>
  );
};
