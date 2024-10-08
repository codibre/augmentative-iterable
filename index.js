'use strict';
const {
  augmentativeToArrayAsync,
  augmentativeForEachAsync,
  filterAsyncIterable,
  immutableAsync,
  mapAsyncIterable,
  takeWhileAsyncIterable,
  mutableAsync,
  addFilterAsync,
  addMapAsync,
  addTakeWhileAsync,
  flatMapAsyncIterable,
  skipAsyncIterable,
} = require('./lib/augmentative-async-iterable');
const {
  augmentativeToArray,
  augmentativeForEach,
  filterIterable,
  immutable,
  mapIterable,
  flatMapIterable,
  takeWhileIterable,
  addFilter,
  addMap,
  addTakeWhile,
  skipIterable,
} = require('./lib/augmentative-iterable');
const {
  itClone,
  resolver,
  resolverAsync,
} = require('./lib/augments-utils');

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
  immutable,
  immutableAsync,
  itClone,
  mapAsyncIterable,
  flatMapAsyncIterable,
  takeWhileAsyncIterable,
  filterIterable,
  mapIterable,
  flatMapIterable,
  mutableAsync,
  takeWhileIterable,
  resolver,
  resolverAsync,
  skipIterable,
  skipAsyncIterable,
};
