import WebSocket from 'ws';
import wsmp from 'websocket-monkeypatch';

import { log } from './lib/log';
import * as registry from './lib/network-registry';

wsmp(WebSocket);

const wsTunnelPath = process.env.TS_WS_PATH || '/ws';
const POLICY_VIOLATION_CODE = 1008;

function _handleConnection(websocket, authenticate, cb) {
  websocket.on('connection', ws => {
    if (!authenticate(ws.upgradeReq.headers)) {
      log('authentication failed');
      ws.close(POLICY_VIOLATION_CODE, 'authentication failed');
    } else {
      cb(ws);
    }
  });
}

export default function registerWebsockets(server, authenticate) {
  const wssCnc = new WebSocket.Server({ server, path: wsTunnelPath });
  _handleConnection(wssCnc, authenticate, ws => {
    ws.onCommand('REGISTER_NETWORK', networkId => {
      registry.registerNetwork(ws, networkId);
    });
  });

  log(`opening WS server at ${wsTunnelPath}`);
}
