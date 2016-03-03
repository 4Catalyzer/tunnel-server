'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNetwork = getNetwork;
exports.unregisterNetwork = unregisterNetwork;
exports.registerNetwork = registerNetwork;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _network = require('./network');

var _network2 = _interopRequireDefault(_network);

var _log = require('./log');

var networkRegistry = {};
var MONITOR_TIMEOUT = 5000;

/**
 * get the network specified by `networkId`
 * @return {[type]} [description]
 */

function getNetwork(networkId) {
  return networkRegistry[networkId];
}

function unregisterNetwork(networkId) {
  (0, _log.log)('unregistering network ' + networkId);
  var network = networkRegistry[networkId];
  if (!network) {
    (0, _log.warn)('network ' + networkId + ' not found');
    return;
  }
  network.unregister();
  networkRegistry[networkId] = undefined;
}

/**
 * socket handler for express
 */

function registerNetwork(ws, networkId) {
  (0, _log.log)('Registering network "' + networkId + '"');

  if (networkRegistry[networkId]) {
    (0, _log.warn)('Network ' + networkId + ' was already registered');
    ws.terminate();
    return;
  }

  networkRegistry[networkId] = new _network2['default'](ws);
  (0, _log.log)('network Registered "' + networkId + '"');

  ws.monitor(MONITOR_TIMEOUT, function () {
    return unregisterNetwork(networkId);
  });
}