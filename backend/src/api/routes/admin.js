import express from 'express';
import {readFile, writeFile} from 'fs/promises';
import authenticateToken from '../../middelwares/auth.js';
import adminOnly from '../../middelwares/adminOnly.js';

const router = express.Router();

// DASHBOARD
router.get('/dashboard', authenticateToken, adminOnly, (req, res) => {
  res.json({message: 'Admin dashboard OK'});
});

// USERS
router.get('/users', authenticateToken, adminOnly, (req, res) => {
  res.json({message: 'List users here'});
});

// ABOUT (read/write JSON file)
router.get('/about', authenticateToken, adminOnly, async (req, res) => {
  try {
    const data = await readFile(
      new URL('../../data/about.json', import.meta.url),
      'utf8'
    );
    return res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading about data:', err);
    return res.status(500).json({error: 'Could not read about data'});
  }
});

router.put('/about', authenticateToken, adminOnly, async (req, res) => {
  try {
    await writeFile(
      new URL('../../data/about.json', import.meta.url),
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    return res.json({ok: true});
  } catch (err) {
    console.error('Error writing about data:', err);
    return res.status(500).json({error: 'Could not write about data'});
  }
});

// ANNOUNCEMENTS / TIEDOTTEET
router.get('/announcements', authenticateToken, adminOnly, async (req, res) => {
  try {
    const data = await readFile(
      new URL('../../data/announcements.json', import.meta.url),
      'utf8'
    );
    return res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading announcements:', err);
    return res.status(500).json({error: 'Could not read announcements data'});
  }
});

router.put('/announcements', authenticateToken, adminOnly, async (req, res) => {
  try {
    await writeFile(
      new URL('../../data/announcements.json', import.meta.url),
      JSON.stringify(req.body, null, 2),
      'utf8'
    );
    return res.json({ok: true});
  } catch (err) {
    console.error('Error writing announcements:', err);
    return res.status(500).json({error: 'Could not write announcements data'});
  }
});

export default router;
