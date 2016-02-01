/* eslint new-cap: 0 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.open = open;
exports.getServerPort = getServerPort;
exports.getAvailablePort = getAvailablePort;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _reverseWstunnel = require('reverse-wstunnel');

var _log = require('./log');

var _serverPort = undefined;
var _maxRange = undefined;
var _minRange = undefined;

/**
 * open a reverse tunnel server at the specified port
 */

function open(serverPort, minRange, maxRange, authenticate) {
  (0, _assert2['default'])(serverPort && minRange && maxRange);
  _serverPort = serverPort;
  _maxRange = maxRange;
  _minRange = minRange;

  var server = new _reverseWstunnel.reverseServer();
  server.authenticate = function (req) {
    if (!authenticate(req)) {
      return {
        httpStatus: 401,
        reason: 'invalid token'
      };
    }
  };
  server.start('0.0.0.0:' + serverPort, function () {
    (0, _log.log)('Tunnel server started on port ' + serverPort);
  });
}

/**
 * get the port of the tunnel server
 */

function getServerPort() {
  return _serverPort;
}

/**
 * get an available port for opening a new tunnel
 */

function getAvailablePort(cb, retries) {
  retries = retries || 40;

  (0, _log.log)('finding an open port between ' + _minRange + ' and ' + _maxRange);
  var port = Math.floor(Math.random() * (_maxRange - _minRange) + _minRange);
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