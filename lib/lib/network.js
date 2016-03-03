'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _log = require('./log');

var _reverseServer = require('./reverse-server');

var _reverseServer2 = _interopRequireDefault(_reverseServer);

/**
 * Handles all the open connections to a specific netwrork
 */

var Network = (function () {
  function Network(ws) {
    _classCallCheck(this, Network);

    this._ws = ws;
    this._tunnels = {};
  }

  /**
   * unregister all the open tunnels for the network
   */

  _createClass(Network, [{
    key: 'unregister',
    value: function unregister() {
      this._ws.terminate();
      // terminate all the open tunnels
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(this._tunnels)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var k = _step.value;

          this._tunnels[k].close();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._tunnels = {};
    }
  }, {
    key: 'getTunnelPort',
    value: function getTunnelPort(netloc) {
      return this._tunnels[netloc].address().port;
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
        var tunnelPort = this.getTunnelPort(netloc);
        return cb(tunnelPort);
      }

      (0, _log.log)('opening new tunnel', netloc);

      (0, _reverseServer2['default'])(this._ws, netloc, function (tcpServer) {
        _this._tunnels[netloc] = tcpServer;
        var tunnelPort = _this.getTunnelPort(netloc);
        (0, _log.log)('new tunnel for ' + netloc + ' opened on port ' + tunnelPort);
        return cb(tunnelPort);
      });
    }
  }]);

  return Network;
})();

exports['default'] = Network;
module.exports = exports['default'];