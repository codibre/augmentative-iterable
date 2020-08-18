'use strict';
const {
  YIELD,
  STOP,
  IGNORE,
  augments,
  baseIterable,
  mutable,
} = require('./augments-types');

const end = {
  done: true,
};
const promiseEnd = Promise.resolve(end);

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
  return ({
    state,
    result,
  }) => {
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
  a,
  value,
  resultResolver,
) {
  return (x) => (x ? resolveState(a, value()).then(resultResolver) : promiseEnd);
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
  a,
) {
  return () => {
    let state = YIELD;
    let result;
    while (state !== STOP && keepGoing()) {
      ({
        state,
        result,
      } = resolveState(a, value()));
      if (state === YIELD) {
        return {
          done: false,
          value: result,
        };
      }
    }

    return end;
  };
}

function getStateProcessorAsync(
  operator,
  keepGoingResolver,
  resolveState,
  a,
) {
  const [keepGoing, value] = operator;
  return () => {
    function recursive() {
      return keepGoingResolver(
        keepGoing(),
        stepProcessor(resolveState, a, value, stateResultResolver(recursive)),
      );
    }

    return recursive();
  };
}

function processActionResult(
  type,
  actionResult,
  state,
  result,
) {
  switch (type) {
    case IGNORE:
      if (!actionResult) {
        state = IGNORE;
      }
      break;
    case STOP:
      if (!actionResult) {
        state = STOP;
      }
      break;
    default:
      result = actionResult;
  }
  return {
    state,
    result,
  };
}

function getMutable(iteratorType, augmentativeIterate) {
  return function (it) {
    return it[mutable] ? it : {
      [iteratorType]: augmentativeIterate,
      [mutable]: 1,
      [augments]: [],
      [baseIterable]: it,
    };
  };
}

function getAugmentIterable(
  iteratorType,
  augmentativeIterate,
  type,
) {
  return function (it, action) {
    const previewAugments = it[augments];
    const augment = {
      type,
      action,
    };
    if (it[mutable]) {
      previewAugments.push(augment);
      return it;
    }

    return {
      [iteratorType]: augmentativeIterate,
      ...(previewAugments ? {
        [augments]: [...previewAugments, augment],
        [baseIterable]: it[baseIterable],
      } : {
        [augments]: [augment],
        [baseIterable]: it,
      }),
    };
  };
}

function getAddAugment(
  iteratorType,
  augmentativeIterate,
  type,
) {
  const newAugment = getAugmentIterable(iteratorType, augmentativeIterate, type);
  return function (it, action) {
    const previewAugments = it[augments];
    if (!previewAugments) {
      return newAugment(it, action);
    }
    previewAugments.push({
      type,
      action,
    });
    return it;
  };
}

function isPromiseLike(p) {
  return p && typeof p.then === 'function';
}

function resolver(value, callback) {
  return callback(value);
}

function resolverAsync(
  promise,
  callback,
) {
  return isPromiseLike(promise) ? promise.then(callback) : callback(promise);
}

module.exports = {
  getAddAugment,
  getArrayOperator,
  getItOperator,
  getMutable,
  getStateProcessor,
  getStateProcessorAsync,
  processActionResult,
  getAugmentIterable,
  isPromiseLike,
  resolver,
  resolverAsync,
};
