import express from 'express';
import api from './api.js';

const app = express();

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', true);
}

// Route the api
app.use('/api', api);

// Route the frontend later...

// Generic error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ type: 'error', message: 'Internal Server Error' });
});

export default app;
