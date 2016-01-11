import assert from 'assert';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import wsmp from 'websocket-monkeypatch';
import WebSocket from 'ws';

import api from './api';
import { log } from './lib/log';
import { websocket } from './lib/network-registry';
import * as tunnelServer from './lib/tunnel-server';
import middleware from './middleware';

wsmp(WebSocket);

const serverPort = process.env.TS_SERVER_PORT || 8080;
const tunnelPort = process.env.TS_TUNNEL_PORT || 8081;
const minPortRange = process.env.TS_MIN_PORT_RANGE || 10000;
const maxPortRange = process.env.TS_MAX_PORT_RANGE || 20000;
const wsToken = process.env.TS_AUTH_TOKEN;

assert(wsToken);

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

// internal middleware
app.use(middleware());

// api router
app.use('/api', api(authenticate));

const server = app.listen(serverPort);

const wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', ws => {
  if (!authenticate(ws.upgradeReq.headers)) {
    ws.close(1008, 'authentication failed');
  } else {
    websocket(ws);
  }
});

log(`Server started on port ${server.address().port}`);

tunnelServer.open(tunnelPort, minPortRange, maxPortRange,
  req => authenticate(req.headers));

export default app;
