'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _libLog = require('./lib/log');

var _registerWebsockets = require('./register-websockets');

var _registerWebsockets2 = _interopRequireDefault(_registerWebsockets);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

function run() {
  var serverPort = Number(process.env.TS_SERVER_PORT) || 8080;
  var wsToken = process.env.TS_AUTH_TOKEN;
  var authenticateApi = (process.env.TS_AUTHENTICATE_API || '').toLowerCase() === 'true';

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
  app.use('/api', (0, _api2['default'])(authenticateApi && authenticate));

  var server = app.listen(serverPort);

  (0, _registerWebsockets2['default'])(server, authenticate);

  (0, _libLog.log)('Server started on port ' + server.address().port);
  return app;
}

exports['default'] = {
  run: run
};
module.exports = exports['default'];