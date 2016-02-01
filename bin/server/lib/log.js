/* eslint no-console: 0 */

/**
 * Just a placeholder before deciding which library to use
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.warn = warn;
exports.error = error;

function log() {
  console.log.apply(console, arguments);
}

function warn() {
  console.warn.apply(console, arguments);
}

function error() {
  console.error.apply(console, arguments);
}