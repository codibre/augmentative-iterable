'use strict';
const {
  getArrayOperator,
  getItOperator,
  getStateProcessor,
  processActionResult,
  getAugmentIterable,
  resolver,
} = require('./augments-utils');
const {
  baseIterable,
  augments,
  YIELD,
  IGNORE,
  STOP,
  FLAT,
} = require('./augments-types');

function resolveState(augmentList, wrapper) {
  wrapper.state = YIELD;
  let ai = augmentList.next;
  while (ai) {
    const actionResult = ai.action(wrapper.result);
    wrapper.type = ai.type;
    processActionResult(actionResult, wrapper);
    if (wrapper.state !== YIELD) {
      return wrapper;
    }
    ai = ai.next;
  }
};

function getIterableParameters(self) {
  const base = self[baseIterable] || self;

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(base[Symbol.iterator](), resolver);

  return { operator, base };
}

function augmentativeIterate() {
  const augmentList = this[augments] || {};
  const { operator, base } = getIterableParameters(this);

  return {
    next: getStateProcessor(operator, resolveState, augmentList, getIterableParameters),
    return: base.return ? base.return.bind(base) : undefined,
    throw: base.throw ? base.throw.bind(base) : undefined,
  };
}

function augmentativeForEach(
  action,
) {
  const it = augmentativeIterate.call(this);
  let next;
  while (!(next = it.next()).done) {
    action(next.value);
  }
  if (it.return) {
    it.return();
  }
}

function augmentativeToArray() {
  const result = [];

  augmentativeForEach.call(this, result.push.bind(result));

  return result;
}

const filterIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  IGNORE,
);

const mapIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  YIELD,
);

const takeWhileIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  STOP,
);

const flatMapIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
  FLAT,
);

const addFilter = getAugmentIterable(Symbol.iterator, augmentativeIterate, IGNORE);
const addMap = getAugmentIterable(Symbol.iterator, augmentativeIterate, YIELD);
const addTakeWhile = getAugmentIterable(Symbol.iterator, augmentativeIterate, STOP);

module.exports = {
  addFilter,
  addMap,
  addTakeWhile,
  augmentativeIterate,
  augmentativeForEach,
  augmentativeToArray,
  filterIterable,
  mapIterable,
  takeWhileIterable,
  flatMapIterable,
};
