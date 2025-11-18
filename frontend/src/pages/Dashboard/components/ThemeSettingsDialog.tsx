import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { BrandingSettings } from '@/types/branding';
import { BrandingStorage } from '@/services/brandingStorage';
import { ColorPicker, FontPicker } from '@/components/common';
import { adjustColor } from '@/utils/colorUtils';

interface ThemeSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: BrandingSettings;
  onSettingsChange: (settings: BrandingSettings) => void;
}

export const ThemeSettingsDialog: React.FC<ThemeSettingsDialogProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<BrandingSettings>(settings);

  const handleColorChange = (colorType: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorType]: value,
        ...(colorType === 'theme_color' && {
          button: {
            ...prev.theme.button,
            primary_color: value,
            hover_color: adjustColor(value, -20),
          }
        }),
      },
    }));
  };

  const handleSecondaryColorChange = (value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        button: {
          ...prev.theme.button,
          secondary_color: value,
        }
      }
    }));
  };

  const handleFontChange = (font: string) => {
    setLocalSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        font_family: font,
      }
    }));
  };

  const handleSave = () => {
    BrandingStorage.save(localSettings);
    onSettingsChange(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Typography variant="h6">Theme Settings</Typography>
          <IconButton onClick={handleCancel} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box className="space-y-6">
          {/* Typography Settings */}
          <Box>
            <Typography variant="h6" className="mb-3">Typography</Typography>
            <FontPicker
              label="Font Family"
              value={localSettings.theme.font_family}
              onChange={handleFontChange}
            />
          </Box>

          <Divider />

          {/* Color Settings */}
          <Box>
            <Typography variant="h6" className="mb-3">Colors</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <ColorPicker
                  label="Primary Color"
                  value={localSettings.theme.theme_color}
                  onChange={(value) => handleColorChange('theme_color', value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ColorPicker
                  label="Secondary Color"
                  value={localSettings.theme.button.secondary_color}
                  onChange={handleSecondaryColorChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ColorPicker
                  label="Text Color"
                  value={localSettings.theme.text_color}
                  onChange={(value) => handleColorChange('text_color', value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ColorPicker
                  label="Accent Color"
                  value={localSettings.theme.extra_light_color}
                  onChange={(value) => handleColorChange('extra_light_color', value)}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Live Preview */}
          <Box>
            <Typography variant="h6" className="mb-3">Preview</Typography>
            <Box 
              className="p-4 rounded-lg mb-3"
              style={{ backgroundColor: localSettings.theme.theme_color }}
            >
              <Typography 
                variant="h6" 
                style={{ 
                  color: '#ffffff',
                  fontFamily: localSettings.theme.font_family 
                }}
              >
                {localSettings.capabilities.general_app_title}
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <Button 
                variant="contained"
                style={{ 
                  backgroundColor: localSettings.theme.theme_color,
                  fontFamily: localSettings.theme.font_family 
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outlined"
                style={{ 
                  borderColor: localSettings.theme.extra_light_color,
                  color: localSettings.theme.text_color,
                  fontFamily: localSettings.theme.font_family 
                }}
              >
                Outlined Button
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
