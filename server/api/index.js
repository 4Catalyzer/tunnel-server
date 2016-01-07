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

  return api;
}
