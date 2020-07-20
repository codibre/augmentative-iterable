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
exports.augmentativeIterate = augmentativeIterate;

function augmentativeForEach(
  action,
) {
  const it = augmentativeIterate.call(this);
  let next;
  while (!(next = it.next()).done) {
    action(next.value);
  }
}
exports.augmentativeForEach = augmentativeForEach;

exports.augmentativeToArray = function augmentativeToArray() {
  const result = [];

  augmentativeForEach.call(this, result.push.bind(result));

  return result;
};

exports.augmentIterable = getAugmentIterable(
  Symbol.iterator,
  augmentativeIterate,
);
