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
} = require('./lib/augmentative-async-iterable');
const {
  augmentativeToArray,
  augmentativeForEach,
  filterIterable,
  immutable,
  mapIterable,
  takeWhileIterable,
  addFilter,
  addMap,
  addTakeWhile,
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
  takeWhileAsyncIterable,
  filterIterable,
  mapIterable,
  mutableAsync,
  takeWhileIterable,
  resolver,
  resolverAsync,
};
