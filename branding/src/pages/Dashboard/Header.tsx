import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Person,
  Business,
  Refresh,
} from '@mui/icons-material';
import { Icon } from '@/utils/iconloader';
import { BrandedLogo } from '../Branding/BrandedLogo';
import { CompanyAvatar } from '../Branding/CompanyAvatar';
import { useBranding } from '@/context/BrandingProvider';

interface HeaderProps {
  onResetBranding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetBranding }) => {
  const { settings } = useBranding();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setUserMenuOpen(false);
  };

  const handleResetBranding = () => {
    handleMenuClose();
    onResetBranding();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar className="px-6">
        {/* Logo */}
        <Box className="flex items-center flex-grow">
          <BrandedLogo height={36} className="mr-4" />
          <Typography variant="h6" className="hidden sm:block font-semibold">
            {settings.capabilities.general_app_title}
          </Typography>
        </Box>

        {/* Navigation */}
        <Box className="hidden md:flex items-center space-x-6 mr-8">
          <Button color="inherit" className="text-white hover:bg-white/10">
            Dashboard
          </Button>
          <Button color="inherit" className="text-white hover:bg-white/10">
            Accounts
          </Button>
          <Button color="inherit" className="text-white hover:bg-white/10">
            Transfers
          </Button>
          <Button color="inherit" className="text-white hover:bg-white/10">
            Support
          </Button>
        </Box>

        {/* User Menu */}
        <Box className="flex items-center space-x-3">
          <CompanyAvatar size={36} />
          <IconButton
            size="large"
            onClick={handleMenuOpen}
            className="text-white"
            aria-label="user menu"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={userMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 220,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <MenuItem disabled>
            <Box className="flex items-center py-2">
              <CompanyAvatar size={32} className="mr-3" />
              <Box>
                <Typography variant="subtitle2" className="font-medium">
                  {settings.companyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          
          <Divider />

          {/* Menu Items */}
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>

          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Business fontSize="small" />
            </ListItemIcon>
            Company Settings
          </MenuItem>

          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Icon name="settings" size="sm" />
            </ListItemIcon>
            Preferences
          </MenuItem>

          <Divider />

          {/* Reset Branding */}
          <MenuItem onClick={handleResetBranding}>
            <ListItemIcon>
              <Refresh fontSize="small" />
            </ListItemIcon>
            Reset Branding
          </MenuItem>

          <Divider />

          {/* Logout */}
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
