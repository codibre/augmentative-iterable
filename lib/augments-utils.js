'use strict';
const {
  STOP,
  IGNORE,
  augments,
  baseIterable,
  FLAT,
} = require('./augments-types');

const end = {
  done: true,
};
function isPromiseLike(p) {
  return p && typeof p.then === 'function';
}

function resolverAsync(
  promise,
  callback,
) {
  return isPromiseLike(promise) ? promise.then(callback) : callback(promise);
}

function processActionResult(
  actionResult,
  wrapper,
) {
  switch (wrapper.type) {
    case IGNORE:
      if (!actionResult) {
        wrapper.state = IGNORE;
      }
      break;
    case STOP:
      if (!actionResult) {
        wrapper.state = STOP;
      }
      break;
    case FLAT:
      wrapper.state = FLAT;
      break;
    default:
      wrapper.result = actionResult;
  }
}

function itClone(it) {
  let iteratorType;
  if (it[Symbol.asyncIterator]) {
    iteratorType = Symbol.asyncIterator;
  } else if (it[Symbol.iterator]) {
    iteratorType = Symbol.iterator;
  } else {
    throw new Error('it is not an iterable nor an async iterable');
  }
  return {
    [iteratorType]: it[augments] ? it[iteratorType] : it[iteratorType].bind(it),
    [augments]: it[augments],
    [baseIterable]: it[baseIterable],
  };
}

function getAugmentIterable(
  iteratorType,
  augmentativeIterate,
  type,
) {
  return function (it, action) {
    const augmentList = it[augments];
    const augment = {
      type,
      action,
    };
    if (augmentList && it[iteratorType]) {
      augmentList.last = augmentList.last.next = augment;
      return it;
    }

    return {
      [iteratorType]: augmentativeIterate,
      [augments]: { next: augment, last: augment },
      [baseIterable]: it,
    };
  };
}

function resolver(value, callback) {
  return callback(value);
}

module.exports = {
  processActionResult,
  getAugmentIterable,
  isPromiseLike,
  itClone,
  resolver,
  resolverAsync,
  end,
};
