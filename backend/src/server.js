import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { studentRouter } from './routes/students.js';
import { initializeDatabase, pool } from './database/database.js';

const app = express();
const port = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : (origin, callback) =>
    !origin || allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(null, false)
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'healthy', service: 'student-management-api' }));
app.use('/api/students', studentRouter);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: 'Validation failed', errors: error.errors });
  }
  if (error?.code === '23505') {
    return res.status(409).json({ message: 'A student with this email or student ID already exists' });
  }
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

let server;

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

const start = async () => {
  await initializeDatabase();
  server = app.listen(port, '0.0.0.0', () => {
    console.log(`Student API listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Application startup failed', error);
  process.exit(1);
});
