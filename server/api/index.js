import { Router } from 'express';
import tunnel from './tunnel';

export default function (authenticate) {
  const api = new Router();

  api.use('/networks/:networkId/tunnel',
    (req, res, next) => {
      if (!authenticate || authenticate(req.headers)) {
        next();
      } else {
        res.status(401).send('invalid token');
      }
    },
    (req, res, next) => {
      req.networkId = req.params.networkId;
      next();
    },
    tunnel());

  api.get('/_tunnel',
    (req, res) => res.json({
      api_version: '1.0',
    })
  );

  return api;
}
