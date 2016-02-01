import { Duplex } from 'stream';

import { decode, encode, encodeWithNetloc } from './decoder';

/**
 * a websocket stream with a payload composed by a connection identifier
 * and a target netloc
 */
export default class WsStream extends Duplex {
  constructor(wsConn, id, netloc) {
    super();
    this._sig = 'ws';
    this._open = true;
    this.wsConn = wsConn;
    this.identifier = id;
    this.netloc = netloc;
    this.encode = encodeWithNetloc;

    this._onMessage = (data) => {
      const { identifier, chunk } = decode(data);
      // drop the segment if the identifiers don't match
      if (identifier === this.identifier && this._open) {
        if (!chunk.length) {
          // if the chunk is empty, push null to mark the end of
          // the communication
          this.push(null);
        } else {
          this.push(chunk);
        }
      }
    };

    this._onClose = () => {
      this._open = false;
      this.emit('close');
    };

    this._onError = (error) => {
      this.emit('error', error);
    };

    wsConn.on('message', this._onMessage);
    wsConn.on('error', this._onError);
    wsConn.on('close', this._onClose);
  }

  end() {
    super.end();
    this.wsConn.removeListener('message', this._onMessage);
    this.wsConn.removeListener('error', this._onError);
    this.wsConn.removeListener('close', this._onClose);
  }

  // node stream overrides
  // push is called when there is data, _read does nothing
  _read() {}

  // if callback is not called, then stream write will be blocked
  _write(chunk, encoding, callback) {
    // the first time _write is called, `encodeWithNetloc` will be used.
    // Subsequent _write will use `encode`, ignoring the netloc argument
    chunk = this.encode(chunk, this.identifier, this.netloc);
    this.encode = encode;

    if (this._open) {
      this.wsConn.send(chunk, { mask: true, binary: true }, callback);
    }
  }

}
