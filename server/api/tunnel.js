import { Router } from 'express';

import { getNetwork } from '../lib/network-registry';

export default function () {
  const api = new Router();

  api.put('/', (req, res) => {
    const { hostname, port } = req.body;
    if (!hostname || !port) {
      return res.status(400).send('invalid hostname or port');
    }

    const network = getNetwork(req.networkId);
    if (!network) {
      return res.status(404).send('network not found');
    }

    const tunnelServerHost = req.header('host').replace(/:.*$/, '');

    network.openTunnel(`${hostname}:${port}`,
      tunnelPort => res.send({ port: tunnelPort, hostname: tunnelServerHost }));
  });

  return api;
}
