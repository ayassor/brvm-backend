import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';

const app = express();
const PORT = parseInt(process.env.PORT || '3007');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'credit-service' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connectée');
    app.listen(PORT, () => console.log(`✅ Credit Service démarré sur le port ${PORT}`));
  } catch (err) {
    console.error('❌', err);
    process.exit(1);
  }
}

start();
export default app;
