const {
  augmentativeToArrayAsync,
  augmentativeForEachAsync,
  filterAsyncIterable,
  mapAsyncIterable,
  takeWhileAsyncIterable,
} = require('./lib/augmentative-async-iterable');
const {
  augmentativeToArray,
  augmentativeForEach,
  filterIterable,
  mapIterable,
  takeWhileIterable,
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
  takeWhileIterable,
  resolver,
  resolverAsync,
};
