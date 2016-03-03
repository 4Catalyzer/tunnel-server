function pad(str, padChar, length) {
  const padLength = length - str.length;
  return str + padChar.repeat(padLength);
}

const ID_LENGTH = 4;
const NETLOC_LENGTH = 21;
const ENCODING = 'utf8';

/**
 * encode the buffer with an identifier
 */
export function encode(buffer, id) {
  const idBuffer = new Buffer(ID_LENGTH);
  idBuffer.writeUInt32BE(id, 0);
  const bufferLength = buffer.length + ID_LENGTH;
  return Buffer.concat([idBuffer, buffer], bufferLength);
}

/**
 * encode the buffer with an identifier and a netloc
 */
export function encodeWithNetloc(buffer, id, netloc) {
  const idBuffer = new Buffer(ID_LENGTH);
  idBuffer.writeUInt32BE(id, 0);
  const paddedNetloc = pad(netloc, ' ', NETLOC_LENGTH);
  const netlocBuffer = new Buffer(paddedNetloc, ENCODING);

  const bufferLength = buffer.length + NETLOC_LENGTH + ID_LENGTH;
  return Buffer.concat([idBuffer, netlocBuffer, buffer], bufferLength);
}

/**
 * decode an buffer encoded with the `encode` method and return
 * the original chunk and the identifier
 */
export function decode(buffer) {
  return {
    identifier: buffer.readUInt32BE(),
    chunk: buffer.slice(ID_LENGTH, buffer.length),
  };
}
