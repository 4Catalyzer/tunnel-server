import assert from 'assert';
import net from 'net';

import { log } from './log';
import WsStream from './WsStream';

const minPortRange = Number(process.env.TS_MIN_PORT_RANGE) || 10000;
const maxPortRange = Number(process.env.TS_MAX_PORT_RANGE) || 20000;
let _identifier = 0;

function getAvailablePort(cb, retries) {
  retries = retries || 40;

  log(`finding an open port between ${minPortRange} and ${maxPortRange}`);
  const port = Math.floor(Math.random() * (maxPortRange - minPortRange)
    + minPortRange);
  log(`testing if ${port} is open`);

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

/**
 * Start a new reverse server tunnel at a random port pointing to the
 * target netloc
 */
export default function start(wsConnection, netloc, cb) {
  getAvailablePort((err, tunnelPort) => {
    assert(!err);
    const tcpServer = net.createServer();

    tcpServer.listen(tunnelPort, () => cb(tcpServer));
    tcpServer.on('connection', tcpConn => {
      const wsStream = new WsStream(wsConnection, _identifier++, netloc);
      tcpConn.pipe(wsStream).pipe(tcpConn);
    });
  });
}
