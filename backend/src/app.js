import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
// Staff identity documents are uploaded as base64 JSON and stored as Mongo
// blobs, so the JSON body limit needs to comfortably fit the 10MB file cap.
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
