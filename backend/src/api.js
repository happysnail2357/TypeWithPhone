import express from 'express';
import registerRoutes from './features/register/register.routes.js';

const router = express.Router();
router.use(express.json());

router.use('/register', registerRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({ type: 'error', message: `The API "${req.path}" does not exist` });
});

export default router;
