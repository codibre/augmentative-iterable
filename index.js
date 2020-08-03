'use strict';
const {
  augmentativeToArrayAsync,
  augmentativeForEachAsync,
  filterAsyncIterable,
  mapAsyncIterable,
  takeWhileAsyncIterable,
  mutableAsync,
} = require('./lib/augmentative-async-iterable');
const {
  augmentativeToArray,
  augmentativeForEach,
  filterIterable,
  mapIterable,
  takeWhileIterable,
  mutable,
} = require('./lib/augmentative-iterable');
const {
  resolver,
  resolverAsync,
} = require('./lib/augments-utils');
const {
  YIELD,
  IGNORE,
  STOP,
} = require('./lib/augments-types');

module.exports = {
  augmentativeForEach,
  augmentativeForEachAsync,
  augmentativeToArray,
  augmentativeToArrayAsync,
  filterAsyncIterable,
  mapAsyncIterable,
  takeWhileAsyncIterable,
  filterIterable,
  mapIterable,
  mutable,
  mutableAsync,
  takeWhileIterable,
  resolver,
  resolverAsync,
};
