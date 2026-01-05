import { Router } from "express";
import { getConversations, getConversationById, createConversation, deleteConversation, addMessageToConversation } from "../controllers/conversations.js";

const router = Router();

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/', createConversation);
router.post('/:id', addMessageToConversation);
router.delete('/:id', deleteConversation);

export default router;

