'use strict';

const offsetSymbol = Symbol('offset');
const baseIterable = Symbol('BaseIterableSymbol');
const augments = Symbol('AugmentSymbol');
const end = {
  done: true,
};
const isPromiseLike = (p) => p && typeof p.then === 'function';

const resolverAsync = (
  promise,
  callback,
) => isPromiseLike(promise) ? promise.then(callback) : callback(promise);

function itClone(it) {
  let iteratorType;
  if (it[Symbol.asyncIterator]) iteratorType = Symbol.asyncIterator;
  else if (it[Symbol.iterator]) iteratorType = Symbol.iterator;
  else throw new Error('it is not an iterable nor an async iterable');

  return {
    [iteratorType]: it[augments] ? it[iteratorType] : it[iteratorType].bind(it),
    [augments]: it[augments],
    [baseIterable]: it[baseIterable],
  };
}

const getSkippedAugmentIterable = (
  iteratorType,
  augmentativeIterate,
) => function (it, offset = 0) {
  const augmentList = it[augments];
  let baseOffset;

  if (!augmentList || !augmentList.last) baseOffset = it[offsetSymbol];

  return {
    [iteratorType]: augmentativeIterate,
    [baseIterable]: it,
    [offsetSymbol]: (baseOffset || 0) + Math.max(offset, 0),
  };
};

const getAugmentIterable = (
  iteratorType,
  augmentativeIterate,
  type,
) => function (it, action,) {
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

const resolver = (value, callback) => callback(value);

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
  getAugmentIterable,
  getSkippedAugmentIterable,
  isPromiseLike,
  itClone,
  resolver,
  resolverAsync,
  end,
  getIterableParameters,
};
