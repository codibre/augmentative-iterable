'use strict';
const {
  getAddAugment,
  getArrayOperator,
  getItOperator,
  getMutable,
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
} = require('./augments-types');

function resolveState(a, item) {
  const length = a.length;
  let state = YIELD;
  let result = item;
  for (let i = 0; i < length && state === YIELD; i++) {
    const {
      type,
      action,
    } = a[i];
    const actionResult = action(result);
    ({
      state,
      result,
    } = processActionResult(type, actionResult, state, result));
  }

  return {
    state,
    result,
  };
};

function augmentativeIterate() {
  const a = this[augments] || [];
  const base = this[baseIterable] || this;

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(base[Symbol.iterator](), resolver);

  return {
    next: getStateProcessor(operator, resolveState, a),
    return: base.return ? base.return.bind(base) : undefined,
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

const mutable = getMutable(Symbol.iterator, augmentativeIterate);

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

const addFilter = getAddAugment(Symbol.iterator, augmentativeIterate, IGNORE);
const addMap = getAddAugment(Symbol.iterator, augmentativeIterate, YIELD);
const addTakeWhile = getAddAugment(Symbol.iterator, augmentativeIterate, STOP);

module.exports = {
  addFilter,
  addMap,
  addTakeWhile,
  augmentativeIterate,
  augmentativeForEach,
  augmentativeToArray,
  filterIterable,
  mapIterable,
  mutable,
  takeWhileIterable,
};
