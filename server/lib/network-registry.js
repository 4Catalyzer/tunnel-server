import Network from './network';
import { log, warn } from './log';


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

/**
 * socket handler for express
 */
export function websocket(ws) {
  const serverHost = ws.upgradeReq.headers.host.replace(/:.*$/, '');
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

    networkRegistry[networkId] = new Network(ws, serverHost);
    log(`network Registered "${networkId}"`);

    ws.monitor(5000, () => unregisterNetwork(networkId));
  });

  log('New socket connection opened');
}
