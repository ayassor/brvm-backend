import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';
import portfoliosRouter from './routes/portfolios';

const app = express();
const PORT = parseInt(process.env.PORT || '3004');
app.use(cors()); app.use(morgan('dev')); app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'portfolio-service' }));
app.use('/portfolios', portfoliosRouter);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connectée');
    app.listen(PORT, () => console.log(`✅ Portfolio Service démarré sur le port ${PORT}`));
  } catch (err) { console.error('❌', err); process.exit(1); }
}
start();
export default app;
