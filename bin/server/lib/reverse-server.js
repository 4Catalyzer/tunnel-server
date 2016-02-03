'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = start;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _log = require('./log');

var _WsStream = require('./WsStream');

var _WsStream2 = _interopRequireDefault(_WsStream);

var minPortRange = Number(process.env.TS_MIN_PORT_RANGE) || 10000;
var maxPortRange = Number(process.env.TS_MAX_PORT_RANGE) || 20000;
var _identifier = 0;

function getAvailablePort(cb, retries) {
  retries = retries || 40;

  (0, _log.log)('finding an open port between ' + minPortRange + ' and ' + maxPortRange);
  var port = Math.floor(Math.random() * (maxPortRange - minPortRange) + minPortRange);
  (0, _log.log)('testing if ' + port + ' is open');

  var tester = _net2['default'].createServer();

  tester.once('error', function (err) {
    if (err.code !== 'EADDRINUSE') return cb(err);
    if (retries <= 0) return cb(new Error('too many attempts'));
    getAvailablePort(cb, retries--);
  });

  tester.once('listening', function () {
    tester.once('close', function () {
      return cb(null, port);
    });
    tester.close();
  });

  tester.listen(port);
}

/**
 * Start a new reverse server tunnel at a random port pointing to the
 * target netloc
 */

function start(wsConnection, netloc, cb) {
  getAvailablePort(function (err, tunnelPort) {
    (0, _assert2['default'])(!err);
    var tcpServer = _net2['default'].createServer();

    tcpServer.listen(tunnelPort, function () {
      return cb(tcpServer);
    });
    tcpServer.on('connection', function (tcpConn) {
      var wsStream = new _WsStream2['default'](wsConnection, _identifier++, netloc);
      tcpConn.pipe(wsStream).pipe(tcpConn);
    });
  });
}

module.exports = exports['default'];