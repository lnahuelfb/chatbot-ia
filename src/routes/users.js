import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, getUserPreferences, upsertPreference } from "../controllers/users.js";

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id/preferences', getUserPreferences);
router.post('/:id/preferences', upsertPreference);

export default router;