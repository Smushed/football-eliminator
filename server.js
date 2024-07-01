import 'dotenv/config.js';
import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

import rosterRoutes from './routes/rosterRoutes.js';
import mySportsRoutes from './routes/mySportsRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cronHandler from './handlers/cronHandler.js';
import cacheHandler from './handlers/cacheHandler.js';
import avatarRoutes from './routes/avatarRoutes.js';

const PORT = process.env.PORT || 8081;
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

let MONGODB_URI = '';

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, './client/build')));
  MONGODB_URI = process.env.MONGO_ATLUS;
} else {
  MONGODB_URI = `mongodb://127.0.0.1/fantasyEliminator`;
}
try {
  mongoose.set('strictQuery', true);
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (err) {
  console.log(err);
}

rosterRoutes(app);
mySportsRoutes(app);
groupRoutes(app);
userRoutes(app);
avatarRoutes(app);

if (process.env.CRON_ENABLED === 'true') {
  cronHandler();
}

if (process.env.CACHE_ENABLED === 'true') {
  cacheHandler.initCache();
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
