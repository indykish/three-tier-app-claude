import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/v1/themes - Get all themes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, name, json_data FROM themes ORDER BY id');

    // Transform the database rows to the format expected by the React app
    const themes = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      ...row.json_data
    }));

    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// GET /api/v1/themes/:id - Get a single theme
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, name, json_data FROM themes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const row = result.rows[0];
    const theme = {
      id: row.id,
      name: row.name,
      ...row.json_data
    };

    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// POST /api/v1/themes - Create a new theme
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, ...themeData } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    const result = await query(
      'INSERT INTO themes (name, json_data) VALUES ($1, $2) RETURNING id, name, json_data',
      [name, themeData]
    );

    const row = result.rows[0];
    const theme = {
      id: row.id,
      name: row.name,
      ...row.json_data
    };

    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
});

// PUT /api/v1/themes/:id - Update a theme
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, ...themeData } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Theme name is required' });
    }

    const result = await query(
      'UPDATE themes SET name = $1, json_data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, json_data',
      [name, themeData, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    const row = result.rows[0];
    const theme = {
      id: row.id,
      name: row.name,
      ...row.json_data
    };

    res.json(theme);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// DELETE /api/v1/themes/:id - Delete a theme
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM themes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json({ message: 'Theme deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
});

export default router;
