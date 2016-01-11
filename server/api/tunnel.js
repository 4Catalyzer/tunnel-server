import assert from 'assert';
import { Router } from 'express';

import { getNetwork } from '../lib/network-registry';
import { getServerPort } from '../lib/tunnel-server';

export default function () {
  const api = new Router();

  api.put('/', (req, res) => {
    const { netloc } = req.body;
    assert(netloc);

    const network = getNetwork(req.networkId);
    if (!network) {
      return res.status(404).send('network not found');
    }


    const tunnelServerHost = req.header('host').replace(/:.*$/, '');
    const tunnelServerPort = getServerPort();

    network.openTunnel(tunnelServerHost, tunnelServerPort, netloc,
      s => res.send(s));
  });

  return api;
}
