import { log } from './log';
import reverseServer from './reverse-server';

/**
 * Handles all the open connections to a specific netwrork
 */
export default class Network {

  constructor(ws) {
    this._ws = ws;
    this._tunnels = {};
  }

  /**
   * unregister all the open tunnels for the network
   */
  unregister() {
    this._ws.terminate();
    // terminate all the open tunnels
    for (const k of Object.keys(this._tunnels)) {
      this._tunnels[k].close();
    }
    this._tunnels = {};
  }

  getTunnelPort(netloc) {
    return this._tunnels[netloc].address().port;
  }

  /**
   * opens a new tunnel. If the tunnel is already open, it doesn't do anything.
   * The first argument fo the callback will be the tunnel location
   */
  openTunnel(netloc, cb) {
    if (this._tunnels[netloc]) {
      const tunnelPort = this.getTunnelPort(netloc);
      return cb(tunnelPort);
    }

    log('opening new tunnel', netloc);

    reverseServer(this._ws, netloc, (tcpServer) => {
      this._tunnels[netloc] = tcpServer;
      const tunnelPort = this.getTunnelPort(netloc);
      log(`new tunnel for ${netloc} opened on port ${tunnelPort}`);
      return cb(tunnelPort);
    });
  }

}
