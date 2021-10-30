'use strict';
const {
  YIELD,
  STOP,
  IGNORE,
  augments,
  baseIterable,
} = require('./augments-types');

const end = {
  done: true,
};
const promiseEnd = Promise.resolve(end);
function isPromiseLike(p) {
  return p && typeof p.then === 'function';
}

function resolverAsync(
  promise,
  callback,
) {
  return isPromiseLike(promise) ? promise.then(callback) : callback(promise);
}

function getKeepGoing(
  it,
  wrapper,
  keepGoingResolver,
) {
  return () => keepGoingResolver(it.next(), (x) => !(wrapper.next = x).done);
}

function getValue(wrapper) {
  return () => wrapper.next.value;
}

function stateResultResolver(
  recursive,
) {
  return (wrapper) => () => {
    const { state, result } = wrapper;
    switch (state) {
      case YIELD:
        return {
          done: false, value: result,
        };
      case STOP:
        return end;
      default:
        return recursive();
    }
  };
}

function stepProcessor(
  resolveState,
  augmentList,
  value,
  resultResolver,
) {
  return (x) => {
    if (x) {
      const wrapper = { result: value(), next: augmentList, state: YIELD };
      const result = resolveState(augmentList, wrapper);
      return resolverAsync(result, resultResolver(wrapper));
    }
    return promiseEnd;
  };
}

function getArrayOperator(base) {
  const length = base.length;
  let i = -1;
  return [() => ++i < length, () => base[i]];
}

function getItOperator(
  it,
  keepGoingResolver,
) {
  const wrapper = {};
  return [getKeepGoing(it, wrapper, keepGoingResolver), getValue(wrapper)];
}

function getStateProcessor(
  [keepGoing, value],
  resolveState,
  augmentList,
) {
  return () => {
    const wrapper = {};
    while (keepGoing()) {
      wrapper.result = value();
      resolveState(augmentList, wrapper);
      switch (wrapper.state) {
        case YIELD:
          return {
            done: false,
            value: wrapper.result,
          };
        case STOP:
          return end;
      }
    }

    return end;
  };
}

function getStateProcessorAsync(
  operator,
  keepGoingResolver,
  resolveState,
  augmentList,
) {
  const [keepGoing, value] = operator;
  return () => {
    function recursive() {
      return keepGoingResolver(
        keepGoing(),
        stepProcessor(resolveState, augmentList, value, stateResultResolver(recursive)),
      );
    }

    return recursive();
  };
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
  getArrayOperator,
  getItOperator,
  getStateProcessor,
  getStateProcessorAsync,
  processActionResult,
  getAugmentIterable,
  isPromiseLike,
  itClone,
  resolver,
  resolverAsync,
};
