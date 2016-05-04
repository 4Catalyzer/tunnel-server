import { Router } from 'express';

import { log } from '../lib/log';
import { getNetworks } from '../lib/network-registry';
import tunnel from './tunnel';

export default function (authenticate) {
  const api = new Router();

  const networks = new Router();
  networks.use((req, res, next) => {
    if (!authenticate || authenticate(req.headers)) {
      next();
    } else {
      log('authentication failed, invalid token');
      res.status(401).send('invalid token');
    }
  });
  networks.get('/', (req, res) => res.json(getNetworks()));
  networks.use('/:networkId/tunnel',
    (req, res, next) => {
      req.networkId = req.params.networkId;
      next();
    },
    tunnel()
  );

  api.use('/networks', networks);
  api.get('/_tunnel',
    (req, res) => res.json({
      api_version: '1.0',
    })
  );

  return api;
}
