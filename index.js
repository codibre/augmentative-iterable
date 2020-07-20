const { augmentIterableAsync, augmentativeToArrayAsync, augmentativeForEachAsync } = require('./lib/augmentative-async-iterable');
const { augmentIterable, augmentativeToArray, augmentativeForEach } = require('./lib/augmentative-iterable');
const { resolver, resolverAsync } = require('./lib/augments-utils');
const { YIELD, IGNORE, STOP } = require('./lib/augments-types');

module.exports = {
  augmentIterable,
  augmentIterableAsync,
  augmentativeForEach,
  augmentativeForEachAsync,
  augmentativeToArray,
  augmentativeToArrayAsync,
  resolver,
  resolverAsync,
  YIELD, IGNORE, STOP,
};
