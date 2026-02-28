import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
const PORT = parseInt(process.env.PORT || '3009');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'report-service' }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne.' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => console.log(`✅ User Service démarré sur le port ${PORT}`));
  } catch (err) {
    console.error('❌ Impossible de démarrer:', err);
    process.exit(1);
  }
}

start();
export default app;
