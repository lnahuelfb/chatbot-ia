import { Router } from "express";
import webhookRoutes from "./webhook.js";
import { createUser } from "../controllers/users.js";

const router = Router();

router.get('/', (_req, res) => {
  res.send('El servidor está funcionando correctamente.');
});

router.post('/users', createUser)

router.use('/webhook', webhookRoutes)

export default router;