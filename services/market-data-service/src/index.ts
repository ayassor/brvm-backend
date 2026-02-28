import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';
import marketRouter from './routes/market';

const app = express();
const PORT = parseInt(process.env.PORT || '3003');

app.use(cors()); app.use(morgan('dev')); app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'market-data-service' }));
app.use('/market', marketRouter);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connectee');
    app.listen(PORT, () => console.log(`Market Data Service demarre sur le port ${PORT}`));
  } catch (err) { console.error('Erreur:', err); process.exit(1); }
}
start();
export default app;
