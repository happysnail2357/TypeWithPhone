import express from 'express';

const router = express.Router();
router.use(express.json());

// 404 handler
router.use((req, res) => {
  res.status(404).json({ error: `The API "${req.path}" does not exist` });
});

export default router;
