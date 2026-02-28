import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';
import './models/Subscription';

const app = express();
const PORT = parseInt(process.env.PORT || '3006');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'subscription-service' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne.' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => console.log(`✅ Subscription Service démarré sur le port ${PORT}`));
  } catch (err) {
    console.error('❌ Impossible de démarrer:', err);
    process.exit(1);
  }
}

start();
export default app;
