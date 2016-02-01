'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNetwork = getNetwork;
exports.unregisterNetwork = unregisterNetwork;
exports.websocket = websocket;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _network = require('./network');

var _network2 = _interopRequireDefault(_network);

var _log = require('./log');

var _libTunnelServer = require('../lib/tunnel-server');

var networkRegistry = {};

/**
 * get the network specified by `networkId`
 * @return {[type]} [description]
 */

function getNetwork(networkId) {
  return networkRegistry[networkId];
}

function unregisterNetwork(networkId) {
  (0, _log.warn)('unregistering network ' + networkId);
  networkRegistry[networkId].unregister();
  networkRegistry[networkId] = undefined;
}

/**
 * socket handler for express
 */

function websocket(ws, path, protocol) {
  ws.on('message', function (data) {
    (0, _log.log)('received ' + data);
  });

  ws.onCommand('REGISTER_NETWORK', function (networkId) {
    (0, _log.log)('Registering network "' + networkId + '"');

    if (networkRegistry[networkId]) {
      (0, _log.warn)('Network ' + networkId + ' was already registered');
      ws.terminate();
      return;
    }

    var serverHost = ws.upgradeReq.headers.host.replace(/:.*$/, '');
    var serverPort = (0, _libTunnelServer.getServerPort)();
    var serverUrl = protocol + '://' + serverHost + ':' + serverPort + path;
    networkRegistry[networkId] = new _network2['default'](ws, serverUrl);
    (0, _log.log)('network Registered "' + networkId + '"');

    ws.monitor(5000, function () {
      return unregisterNetwork(networkId);
    });
  });

  (0, _log.log)('New socket connection opened');
}