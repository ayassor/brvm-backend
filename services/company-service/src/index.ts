import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './config/database';
import companiesRouter from './routes/companies';
import { newsRouter, adminNewsRouter } from './routes/news';
import adminCompaniesRouter            from './routes/adminCompanies';
import marketParticipantsRouter        from './routes/marketParticipants';

const app = express();
const PORT = parseInt(process.env.PORT || '3002');

app.use(cors()); app.use(morgan('dev')); app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'company-service' }));
app.use('/news', newsRouter);
app.use('/admin/news',      adminNewsRouter);
app.use('/admin/companies', adminCompaniesRouter);
app.use('/market-participants', marketParticipantsRouter);
app.use('/', companiesRouter);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connectee');
    app.listen(PORT, () => console.log(`Company Service demarre sur le port ${PORT}`));
  } catch (err) { console.error('Erreur:', err); process.exit(1); }
}
start();
export default app;
