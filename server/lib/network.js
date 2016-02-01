import assert from 'assert';
import { getAvailablePort } from './tunnel-server';
import { log } from './log';

/**
 * Handles all the open connections to a specific netwrork
 */
export default class Network {

  constructor(ws, serverUrl) {
    this._ws = ws;
    this._tunnels = {};
    this._serverUrl = serverUrl;
  }

  /**
   * unregister all the open tunnels for the network
   */
  unregister() {
    this._ws.terminate();
    // TODO terminate tunnels
    this._tunnels = {};
  }

  /**
   * opens a new tunnel. If the tunnel is already open, it doesn't do anything.
   * The first argument fo the callback will be the tunnel location
   */
  openTunnel(netloc, cb) {
    if (this._tunnels[netloc]) {
      return cb(this._tunnels[netloc]);
    }

    log('opening new tunnel', netloc);
    getAvailablePort((err, tunnelPort) => {
      assert(!err);

      const data = {
        tunnelPort,
        tunnelServerUrl: this._serverUrl,
        netloc,
      };

      this._ws.sendCommand('OPEN_TUNNEL', data, (error) => {
        assert(!error);

        this._tunnels[netloc] = tunnelPort;
        log(`new tunnel for ${netloc} opened on port ${tunnelPort}`);
        cb(tunnelPort);
      });
    });
  }

}
