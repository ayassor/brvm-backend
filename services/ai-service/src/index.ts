import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = parseInt(process.env.PORT || '3008');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ai-service' }));

app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: 'Erreur interne.' });
});

app.listen(PORT, () => console.log(`✅ AI Service démarré sur le port ${PORT}`));

export default app;
