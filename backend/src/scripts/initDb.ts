import { initDatabase, query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  // Check if there are any themes
  const existingThemes = await query('SELECT COUNT(*) FROM themes');

  if (parseInt(existingThemes.rows[0].count) > 0) {
    console.log('Themes already exist, skipping seed');
    return;
  }

  // Seed with a default theme matching BrandingSettings structure
  const defaultTheme = {
    companyName: 'Demo Company',
    companyUrl: 'https://demo.example.com',
    theme: {
      theme_color: '#1976d2',
      primary_dark_color: '#1565c0',
      extra_light_color: '#bbdefb',
      text_color: '#000000',
      font_family: 'Roboto, Arial, sans-serif',
      button: {
        primary_color: '#1976d2',
        secondary_color: '#9c27b0',
        hover_color: '#1565c0',
        border_color: '#cccccc',
      },
      logos: {},
    },
    capabilities: {
      general_app_title: 'My Bank',
    },
  };

  await query(
    'INSERT INTO themes (name, json_data) VALUES ($1, $2)',
    ['Default Theme', defaultTheme]
  );

  // Add a second sample theme
  const corporateTheme = {
    companyName: 'Corporate Inc',
    companyUrl: 'https://corporate.example.com',
    theme: {
      theme_color: '#2e7d32',
      primary_dark_color: '#1b5e20',
      extra_light_color: '#c8e6c9',
      text_color: '#212121',
      font_family: 'Open Sans, sans-serif',
      button: {
        primary_color: '#2e7d32',
        secondary_color: '#ff5722',
        hover_color: '#1b5e20',
        border_color: '#bdbdbd',
      },
      logos: {},
    },
    capabilities: {
      general_app_title: 'Corporate Portal',
    },
  };

  await query(
    'INSERT INTO themes (name, json_data) VALUES ($1, $2)',
    ['Corporate Theme', corporateTheme]
  );

  console.log('Seeded database with default themes');
};

const init = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();
    await seedData();
    console.log('Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

init();
