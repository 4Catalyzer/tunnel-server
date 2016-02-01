'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.encode = encode;
exports.encodeWithNetloc = encodeWithNetloc;
exports.decode = decode;
function pad(str, padChar, length) {
  var padLength = length - str.length;
  return str + padChar.repeat(padLength);
}

var ID_LENGTH = 4;
var NETLOC_LENGTH = 21;
var ENCODING = 'utf8';

/**
 * encode the buffer with an identifier
 */

function encode(buffer, id) {
  var idBuffer = new Buffer(ID_LENGTH);
  idBuffer.writeUInt32BE(id, 0);
  var bufferLength = buffer.length + ID_LENGTH;
  return Buffer.concat([idBuffer, buffer], bufferLength);
}

/**
 * encode the buffer with an identifier and a netloc
 */

function encodeWithNetloc(buffer, id, netloc) {
  var idBuffer = new Buffer(ID_LENGTH);
  idBuffer.writeUInt32BE(id, 0);
  var paddedNetloc = pad(netloc, ' ', NETLOC_LENGTH);
  var netlocBuffer = new Buffer(paddedNetloc, ENCODING);

  var bufferLength = buffer.length + NETLOC_LENGTH + ID_LENGTH;
  return Buffer.concat([idBuffer, netlocBuffer, buffer], bufferLength);
}

/**
 * decode an buffer encoded with the `encode` method and return
 * the original chunk and the identifier
 */

function decode(buffer) {
  return {
    identifier: buffer.readUInt32BE(),
    chunk: buffer.slice(ID_LENGTH, buffer.length)
  };
}