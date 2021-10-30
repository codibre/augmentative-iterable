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

function augmentativeIterate() {
  const augmentList = this[augments] || {};
  const base = this[baseIterable] || this;

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(base[Symbol.iterator](), resolver);

  return {
    next: getStateProcessor(operator, resolveState, augmentList),
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
};
