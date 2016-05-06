'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _stream = require('stream');

var _decoder = require('./decoder');

/**
 * a websocket stream with a payload composed by a connection identifier
 * and a target netloc
 */

var WsStream = (function (_Duplex) {
  _inherits(WsStream, _Duplex);

  function WsStream(wsConn, id, netloc) {
    var _this = this;

    _classCallCheck(this, WsStream);

    _get(Object.getPrototypeOf(WsStream.prototype), 'constructor', this).call(this);
    this._sig = 'ws';
    this._open = true;
    this.wsConn = wsConn;
    this.identifier = id;
    this.netloc = netloc;
    this.encode = _decoder.encodeWithNetloc;

    this._onMessage = function (data) {
      var _decode = (0, _decoder.decode)(data);

      var identifier = _decode.identifier;
      var chunk = _decode.chunk;

      // drop the segment if the identifiers don't match
      if (identifier === _this.identifier && _this._open) {
        if (!chunk.length) {
          // if the chunk is empty, push null to mark the end of
          // the communication
          _this.push(null);
        } else {
          _this.push(chunk);
        }
      }
    };

    this._onClose = function () {
      _this._open = false;
      _this.emit('close');
    };

    this._onError = function (error) {
      _this.emit('error', error);
    };

    wsConn.on('message', this._onMessage);
    wsConn.on('error', this._onError);
    wsConn.on('close', this._onClose);
  }

  _createClass(WsStream, [{
    key: 'end',
    value: function end() {
      _get(Object.getPrototypeOf(WsStream.prototype), 'end', this).call(this);
      // send an empty buffer to signify the end of the connection
      var emptyBuffer = new Buffer(0);
      this._write(emptyBuffer);
      this.wsConn.removeListener('message', this._onMessage);
      this.wsConn.removeListener('error', this._onError);
      this.wsConn.removeListener('close', this._onClose);
    }

    // node stream overrides
    // push is called when there is data, _read does nothing
  }, {
    key: '_read',
    value: function _read() {}

    // if callback is not called, then stream write will be blocked
  }, {
    key: '_write',
    value: function _write(chunk, encoding, callback) {
      // the first time _write is called, `encodeWithNetloc` will be used.
      // Subsequent _write will use `encode`, ignoring the netloc argument
      chunk = this.encode(chunk, this.identifier, this.netloc);
      this.encode = _decoder.encode;

      if (this._open) {
        this.wsConn.send(chunk, { mask: true, binary: true }, callback);
      }
    }
  }]);

  return WsStream;
})(_stream.Duplex);

exports['default'] = WsStream;
module.exports = exports['default'];