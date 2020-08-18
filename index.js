'use strict';
const {
  augmentativeToArrayAsync,
  augmentativeForEachAsync,
  filterAsyncIterable,
  mapAsyncIterable,
  takeWhileAsyncIterable,
  mutableAsync,
  addFilterAsync,
  addMapAsync,
  addTakeWhileAsync,
} = require('./lib/augmentative-async-iterable');
const {
  augmentativeToArray,
  augmentativeForEach,
  filterIterable,
  mapIterable,
  takeWhileIterable,
  mutable,
  addFilter,
  addMap,
  addTakeWhile,
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
  addFilter,
  addFilterAsync,
  addMap,
  addMapAsync,
  addTakeWhile,
  addTakeWhileAsync,
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
