'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _libLog = require('../lib/log');

var _libNetworkRegistry = require('../lib/network-registry');

var _tunnel = require('./tunnel');

var _tunnel2 = _interopRequireDefault(_tunnel);

exports['default'] = function (authenticate) {
  var api = new _express.Router();

  var networks = new _express.Router();
  networks.use(function (req, res, next) {
    if (!authenticate || authenticate(req.headers)) {
      next();
    } else {
      (0, _libLog.log)('authentication failed, invalid token');
      res.status(401).send('invalid token');
    }
  });
  networks.get('/', function (req, res) {
    return res.json((0, _libNetworkRegistry.getNetworks)());
  });
  networks.use('/:networkId/tunnel', function (req, res, next) {
    req.networkId = req.params.networkId;
    next();
  }, (0, _tunnel2['default'])());

  api.use('/networks', networks);
  api.get('/_tunnel', function (req, res) {
    return res.json({
      api_version: '1.0'
    });
  });

  return api;
};

module.exports = exports['default'];