/* eslint new-cap: 0 */
import assert from 'assert';
import net from 'net';
import wts from 'node-reverse-wstunnel';

let _serverPort;
let _maxRange;
let _minRange;

/**
 * open a reverse tunnel server at the specified port
 */
export function open(serverPort, minRange, maxRange) {
  assert(serverPort && minRange && maxRange);
  _serverPort = serverPort;
  _maxRange = maxRange;
  _minRange = minRange;

  const reverseServer = new wts.server_reverse();
  reverseServer.start(serverPort);
}

/**
 * get the port of the tunnel server
 */
export function getServerPort() {
  return _serverPort;
}

/**
 * get an available port for opening a new tunnel
 */
export function getAvailablePort(cb, retries) {
  retries = retries || 40;
  const port = Math.floor(Math.random() * (_maxRange - _minRange) + _minRange);

  const tester = net.createServer();

  tester.once('error', err => {
    if (err.code !== 'EADDRINUSE') return cb(err);
    if (retries <= 0) return cb(new Error('too many attempts'));
    getAvailablePort(cb, retries--);
  });

  tester.once('listening', () => {
    tester.once('close', () => cb(null, port));
    tester.close();
  });

  tester.listen(port);
}
