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

module.exports = {
  augmentativeIterate,
  augmentativeForEach,
  augmentativeToArray,
  filterIterable,
  mapIterable,
  takeWhileIterable,
};
