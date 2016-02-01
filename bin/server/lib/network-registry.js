'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

function createServerUrl(request, path, protocol, useReqHeaders) {
  var serverPort = (0, _libTunnelServer.getServerPort)();

  var _request$headers$host$split = request.headers.host.split(':');

  var _request$headers$host$split2 = _slicedToArray(_request$headers$host$split, 2);

  var reqHost = _request$headers$host$split2[0];
  var reqPort = _request$headers$host$split2[1];

  if (useReqHeaders) {
    if ((request.headers['X-Forwarded-Proto'] || request.protocol) === 'http') {
      protocol = 'ws';
    } else {
      protocol = 'wss';
    }
    serverPort = Number(reqPort);
  }
  var serverUrl = protocol + '://' + reqHost + ':' + serverPort + path;
  return serverUrl;
}

/**
 * socket handler for express
 */

function websocket(ws, path, protocol, useReqHeaders) {
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

    var serverUrl = createServerUrl(ws.upgradeReq, path, protocol, useReqHeaders);

    networkRegistry[networkId] = new _network2['default'](ws, serverUrl);
    (0, _log.log)('network Registered "' + networkId + '"');

    ws.monitor(5000, function () {
      return unregisterNetwork(networkId);
    });
  });

  (0, _log.log)('New socket connection opened');
}