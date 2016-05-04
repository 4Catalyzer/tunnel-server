import { log, warn } from './log';
import Network from './network';


const networkRegistry = {};
const MONITOR_TIMEOUT = 5000;

/**
 * get the list of currently open networks
 * @return {[type]} [description]
 */
export function getNetworks() {
  return Object.keys(networkRegistry);
}

/**
 * get the network specified by `networkId`
 * @return {[type]} [description]
 */
export function getNetwork(networkId) {
  return networkRegistry[networkId];
}

export function unregisterNetwork(networkId) {
  log(`unregistering network ${networkId}`);
  const network = networkRegistry[networkId];
  if (!network) {
    warn(`network ${networkId} not found`);
    return;
  }
  network.unregister();
  delete networkRegistry[networkId];
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
