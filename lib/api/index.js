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

  api.get('/networks', function (req, res) {
    return res.json((0, _libNetworkRegistry.getNetworks)());
  });

  api.use('/networks/:networkId/tunnel', function (req, res, next) {
    if (!authenticate || authenticate(req.headers)) {
      next();
    } else {
      (0, _libLog.log)('authentication failed, invalid token');
      res.status(401).send('invalid token');
    }
  }, function (req, res, next) {
    req.networkId = req.params.networkId;
    next();
  }, (0, _tunnel2['default'])());

  api.get('/_tunnel', function (req, res) {
    return res.json({
      api_version: '1.0'
    });
  });

  return api;
};

module.exports = exports['default'];