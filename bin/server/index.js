'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _websocketMonkeypatch = require('websocket-monkeypatch');

var _websocketMonkeypatch2 = _interopRequireDefault(_websocketMonkeypatch);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _libLog = require('./lib/log');

var _libNetworkRegistry = require('./lib/network-registry');

var _libTunnelServer = require('./lib/tunnel-server');

var tunnelServer = _interopRequireWildcard(_libTunnelServer);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

(0, _websocketMonkeypatch2['default'])(_ws2['default']);

var serverPort = Number(process.env.TS_SERVER_PORT) || 8080;
var tunnelPort = Number(process.env.TS_TUNNEL_PORT) || 8081;
var minPortRange = Number(process.env.TS_MIN_PORT_RANGE) || 10000;
var maxPortRange = Number(process.env.TS_MAX_PORT_RANGE) || 20000;
var wsToken = process.env.TS_AUTH_TOKEN;
var cncWebsocketPath = process.env.TS_CNC_WS_PATH || '/ws';
var tunnelWebsocketProtocol = process.env.TS_TUNNEL_WS_PROTOCOL || 'ws';
var tunnelWebsocketPath = process.env.TS_TUNNEL_WS_PATH || '';

(0, _assert2['default'])(wsToken, 'specify a websocket token');

function authenticate(headers) {
  return headers.authorization === wsToken;
}

var app = (0, _express2['default'])();

app.use((0, _cors2['default'])({
  exposedHeaders: ['Link']
}));

app.use(_bodyParser2['default'].json({
  limit: '100kb'
}));

app.use((0, _morgan2['default'])('combined'));

// internal middleware
app.use((0, _middleware2['default'])());

// api router
app.use('/api', (0, _api2['default'])(authenticate));

var server = app.listen(serverPort);

var wss = new _ws2['default'].Server({ server: server, path: cncWebsocketPath });
wss.on('connection', function (ws) {
  if (!authenticate(ws.upgradeReq.headers)) {
    ws.close(1008, 'authentication failed');
  } else {
    (0, _libNetworkRegistry.websocket)(ws, tunnelWebsocketPath, tunnelWebsocketProtocol);
  }
});

(0, _libLog.log)('Server started on port ' + server.address().port);

(0, _libLog.log)('TS_CNC_WS_PATH: ' + cncWebsocketPath);
(0, _libLog.log)('TS_TUNNEL_WS_PROTOCOL: ' + tunnelWebsocketProtocol);
(0, _libLog.log)('TS_TUNNEL_WS_PATH: ' + tunnelWebsocketPath);

tunnelServer.open(tunnelPort, minPortRange, maxPortRange, function (req) {
  return authenticate(req.headers);
});

exports['default'] = app;
module.exports = exports['default'];