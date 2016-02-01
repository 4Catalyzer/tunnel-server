import assert from 'assert';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import wsmp from 'websocket-monkeypatch';
import WebSocket from 'ws';

import api from './api';
import { log } from './lib/log';
import { websocket } from './lib/network-registry';
import * as tunnelServer from './lib/tunnel-server';
import middleware from './middleware';

wsmp(WebSocket);

const serverPort = Number(process.env.TS_SERVER_PORT) || 8080;
const tunnelPort = Number(process.env.TS_TUNNEL_PORT) || 8081;
const minPortRange = Number(process.env.TS_MIN_PORT_RANGE) || 10000;
const maxPortRange = Number(process.env.TS_MAX_PORT_RANGE) || 20000;
const wsToken = process.env.TS_AUTH_TOKEN;
const cncWebsocketPath = process.env.TS_CNC_WS_PATH || '/ws';
const tunnelWebsocketProtocol = process.env.TS_TUNNEL_WS_PROTOCOL || 'ws';
const tunnelWebsocketPath = process.env.TS_TUNNEL_WS_PATH || '';

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

app.use(morgan('combined'));

// internal middleware
app.use(middleware());

// api router
app.use('/api', api(authenticate));

const server = app.listen(serverPort);

const wss = new WebSocket.Server({ server, path: cncWebsocketPath });
wss.on('connection', ws => {
  if (!authenticate(ws.upgradeReq.headers)) {
    ws.close(1008, 'authentication failed');
  } else {
    websocket(ws, tunnelWebsocketPath, tunnelWebsocketProtocol);
  }
});

log(`Server started on port ${server.address().port}`);

log(`TS_CNC_WS_PATH: ${cncWebsocketPath}`);
log(`TS_TUNNEL_WS_PROTOCOL: ${tunnelWebsocketProtocol}`);
log(`TS_TUNNEL_WS_PATH: ${tunnelWebsocketPath}`);


tunnelServer.open(tunnelPort, minPortRange, maxPortRange,
  req => authenticate(req.headers));

export default app;
