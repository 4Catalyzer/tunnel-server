'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = registerWebsockets;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _websocketMonkeypatch = require('websocket-monkeypatch');

var _websocketMonkeypatch2 = _interopRequireDefault(_websocketMonkeypatch);

var _libLog = require('./lib/log');

var _libNetworkRegistry = require('./lib/network-registry');

var registry = _interopRequireWildcard(_libNetworkRegistry);

(0, _websocketMonkeypatch2['default'])(_ws2['default']);

var wsTunnelPath = process.env.TS_WS_PATH || '/ws';
var POLICY_VIOLATION_CODE = 1008;

function _handleConnection(websocket, authenticate, cb) {
  websocket.on('connection', function (ws) {
    if (!authenticate(ws.upgradeReq.headers)) {
      (0, _libLog.log)('authentication failed');
      ws.close(POLICY_VIOLATION_CODE, 'authentication failed');
    } else {
      cb(ws);
    }
  });
}

function registerWebsockets(server, authenticate) {
  var wssCnc = new _ws2['default'].Server({ server: server, path: wsTunnelPath });
  _handleConnection(wssCnc, authenticate, function (ws) {
    ws.onCommand('REGISTER_NETWORK', function (networkId) {
      registry.registerNetwork(ws, networkId);
    });
  });

  (0, _libLog.log)('opening WS server at ' + wsTunnelPath);
}

module.exports = exports['default'];