import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import partnerRoutes from './routes/partner';
import categoryRoutes from './routes/categories';
import itemRoutes from './routes/items';
import matchRoutes from './routes/match';
import progressRoutes from './routes/progress';
import setupRoutes from './routes/setup';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/partner', partnerRoutes);
app.use('/categories', categoryRoutes);
app.use('/categories/:categoryId/items', itemRoutes);
app.use('/setup', setupRoutes);
app.use('/match', matchRoutes);
app.use('/progress', progressRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

export default app;
