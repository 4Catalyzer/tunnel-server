import { Router } from 'express';
import tunnel from './tunnel';

export default function () {
  const api = new Router();

  api.use('/networks/:networkId/tunnel',
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
