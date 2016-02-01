import Network from './network';
import { log, warn } from './log';
import { getServerPort } from '../lib/tunnel-server';


const networkRegistry = {};

/**
 * get the network specified by `networkId`
 * @return {[type]} [description]
 */
export function getNetwork(networkId) {
  return networkRegistry[networkId];
}

export function unregisterNetwork(networkId) {
  warn(`unregistering network ${networkId}`);
  networkRegistry[networkId].unregister();
  networkRegistry[networkId] = undefined;
}

function createServerUrl(request, path, protocol, useReqHeaders) {
  let serverPort = getServerPort();
  const [reqHost, reqPort] = request.headers.host.split(':');
  if (useReqHeaders) {
    if ((request.headers['X-Forwarded-Proto'] || request.protocol) === 'http') {
      protocol = 'ws';
    } else {
      protocol = 'wss';
    }
    serverPort = Number(reqPort);
  }
  const serverUrl = `${protocol}://${reqHost}:${serverPort}${path}`;
  return serverUrl;
}

/**
 * socket handler for express
 */
export function websocket(ws, path, protocol, useReqHeaders) {
  ws.on('message', data => {
    log(`received ${data}`);
  });

  ws.onCommand('REGISTER_NETWORK', networkId => {
    log(`Registering network "${networkId}"`);

    if (networkRegistry[networkId]) {
      warn(`Network ${networkId} was already registered`);
      ws.terminate();
      return;
    }

    const serverUrl = createServerUrl(ws.upgradeReq, path, protocol,
      useReqHeaders);

    networkRegistry[networkId] = new Network(ws, serverUrl);
    log(`network Registered "${networkId}"`);

    ws.monitor(5000, () => unregisterNetwork(networkId));
  });

  log('New socket connection opened');
}
