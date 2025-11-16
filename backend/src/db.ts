import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export const initDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS themes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      json_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Themes table created or already exists');
  } catch (error) {
    console.error('Error creating themes table:', error);
    throw error;
  }
};

export default pool;
