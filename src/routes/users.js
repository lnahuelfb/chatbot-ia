import { Router } from "express";
import { ensureUser, getUserById, getUserPreferences, upsertPreference } from "../controllers/users.js";
import { savePreferences } from '../services/preferenceService.js';

const router = Router();

router.post('/:id/ensure', ensureUser);
router.get('/:id', getUserById);
router.get('/:id/preferences', getUserPreferences);

router.post('/:id/preferences', async (req, res) => {
  const { userId } = req.params;
  const preferences = req.body;

  try {
    await savePreferences(userId, preferences);
    return res.status(201).send('Preferences saved successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;