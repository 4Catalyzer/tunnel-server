'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _express = require('express');

var _libNetworkRegistry = require('../lib/network-registry');

var _libTunnelServer = require('../lib/tunnel-server');

exports['default'] = function () {
  var api = new _express.Router();

  api.put('/', function (req, res) {
    var _req$body = req.body;
    var hostname = _req$body.hostname;
    var port = _req$body.port;

    if (!hostname || !port) {
      return res.status(400).send('invalid hostname or port');
    }

    var network = (0, _libNetworkRegistry.getNetwork)(req.networkId);
    if (!network) {
      return res.status(404).send('network not found');
    }

    var tunnelServerHost = req.header('host').replace(/:.*$/, '');
    var tunnelServerPort = (0, _libTunnelServer.getServerPort)();

    network.openTunnel(tunnelServerPort, hostname + ':' + port, function (tunnelPort) {
      return res.send({ port: tunnelPort, hostname: tunnelServerHost });
    });
  });

  return api;
};

module.exports = exports['default'];