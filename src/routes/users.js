import { Router } from "express";
import { ensureUser, getUserById, getUserPreferences, upsertPreference } from "../controllers/users.js";

const router = Router();

router.post('/:id/ensure', ensureUser)
router.get('/:id', getUserById)
router.get('/:id/preferences', getUserPreferences)
router.post('/:id/preferences', upsertPreference)

export default router;