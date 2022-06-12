'use strict';
const {
  STOP,
  IGNORE,
} = require('./augments-types');

const offsetSymbol = Symbol('offset');
const baseIterable = Symbol('BaseIterableSymbol');
const augments = Symbol('AugmentSymbol');
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

function getSkippedAugmentIterable(
  iteratorType,
  augmentativeIterate,
) {
  return function (it, offset = 0) {
    const augmentList = it[augments];
    let baseOffset;

    if (!augmentList || !augmentList.last) {
      baseOffset = it[offsetSymbol];
    }

    return {
      [iteratorType]: augmentativeIterate,
      [baseIterable]: it,
      [offsetSymbol]: (baseOffset || 0) + Math.max(offset, 0),
    };
  };
}

function getAugmentIterable(
  iteratorType,
  augmentativeIterate,
  type,
) {
  return function (it, action,) {
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

function getIterableParameters(self, next, iteratorSymbol, augmentativeIterate) {
  let augmentList;
  let base;
  const offset = self[offsetSymbol] || 0;
  if (!next) {
    augmentList = self[augments] || {};
    base = self[baseIterable] || self;
  } else {
    base = {
      [iteratorSymbol]: augmentativeIterate.bind(self),
    };
    augmentList = { next, last: next };
  }

  return { augmentList, base, offset };
}

module.exports = {
  processActionResult,
  getAugmentIterable,
  getSkippedAugmentIterable,
  isPromiseLike,
  itClone,
  resolver,
  resolverAsync,
  end,
  getIterableParameters,
};
