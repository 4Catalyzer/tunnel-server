'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _tunnelServer = require('./tunnel-server');

var _log = require('./log');

/**
 * Handles all the open connections to a specific netwrork
 */

var Network = (function () {
  function Network(ws, serverUrl) {
    _classCallCheck(this, Network);

    this._ws = ws;
    this._tunnels = {};
    this._serverUrl = serverUrl;
  }

  /**
   * unregister all the open tunnels for the network
   */

  _createClass(Network, [{
    key: 'unregister',
    value: function unregister() {
      this._ws.terminate();
      // TODO terminate tunnels
      this._tunnels = {};
    }

    /**
     * opens a new tunnel. If the tunnel is already open, it doesn't do anything.
     * The first argument fo the callback will be the tunnel location
     */
  }, {
    key: 'openTunnel',
    value: function openTunnel(netloc, cb) {
      var _this = this;

      if (this._tunnels[netloc]) {
        return cb(this._tunnels[netloc]);
      }

      (0, _log.log)('opening new tunnel', netloc);
      (0, _tunnelServer.getAvailablePort)(function (err, tunnelPort) {
        (0, _assert2['default'])(!err);

        var data = {
          tunnelPort: tunnelPort,
          tunnelServerUrl: _this._serverUrl,
          netloc: netloc
        };

        _this._ws.sendCommand('OPEN_TUNNEL', data, function (error) {
          (0, _assert2['default'])(!error);

          _this._tunnels[netloc] = tunnelPort;
          (0, _log.log)('new tunnel for ' + netloc + ' opened on port ' + tunnelPort);
          cb(tunnelPort);
        });
      });
    }
  }]);

  return Network;
})();

exports['default'] = Network;
module.exports = exports['default'];