import { Router } from "express";
import webhookRoutes from "./webhook.js";
import usersRoutes from './users.js';
import conversationsRoutes from './conversations.js';

const router = Router();

router.get('/', (_req, res) => {
  res.send('El servidor está funcionando correctamente.');
});

router.use('/users', usersRoutes)
router.use('/webhook', webhookRoutes)
router.use('/conversations', conversationsRoutes)

export default router;