import Network from './network';
import { log, warn } from './log';


const networkRegistry = {};
const MONITOR_TIMEOUT = 5000;

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
export function registerNetwork(ws, networkId) {
  log(`Registering network "${networkId}"`);

  if (networkRegistry[networkId]) {
    warn(`Network ${networkId} was already registered`);
    ws.terminate();
    return;
  }

  networkRegistry[networkId] = new Network(ws);
  log(`network Registered "${networkId}"`);

  ws.monitor(MONITOR_TIMEOUT, () => unregisterNetwork(networkId));
}
