import assert from 'assert';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import api from './api';
import { log } from './lib/log';
import registerWebsockets from './register-websockets';
import middleware from './middleware';

const serverPort = Number(process.env.TS_SERVER_PORT) || 8080;
const wsToken = process.env.TS_AUTH_TOKEN;
const authenticateApi =
  (process.env.TS_AUTHENTICATE_API || '').toLowerCase() === 'true';
const trustProxy = (process.env.TS_TRUST_PROXY || '').toLowerCase() === 'true';

assert(wsToken, 'specify a websocket token');

function authenticate(headers) {
  return headers.authorization === wsToken;
}

const app = express();

app.use(cors({
  exposedHeaders: ['Link'],
}));

app.use(bodyParser.json({
  limit: '100kb',
}));

if (trustProxy) {
  app.enable('trust proxy');
}

app.use(morgan('combined'));

// internal middleware
app.use(middleware());

// api router
app.use('/api', api(authenticateApi && authenticate));

const server = app.listen(serverPort);

registerWebsockets(server, authenticate);

log(`Server started on port ${server.address().port}`);

export default app;
