import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import scoresRouter from './routes/scores.routes.js';
import charitiesRouter from './routes/charities.routes.js';
import drawsRouter from './routes/draws.routes.js';
import winnersRouter from './routes/winners.routes.js';
import adminRouter from './routes/admin.routes.js';

app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/charities', charitiesRouter);
app.use('/api/draws', drawsRouter);
app.use('/api/winners', winnersRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
