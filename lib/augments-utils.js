'use strict';
const {
  YIELD,
  STOP,
  IGNORE,
  augments,
  baseIterable,
  FLAT,
} = require('./augments-types');
const { getLinkedList } = require('./liked-list');

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

function areThereAnyFlat(augmentList) {
  let { next } = augmentList;
  while (next) {
    if (next.type === FLAT) {
      return true;
    }
    next = next.next;
  }
  return false;
}

function getStateProcessor(
  operator,
  resolveState,
  rootAugmentList,
  getIterableParameters,
) {
  let [keepGoing, value] = operator;
  let wrapper = {};
  let augmentList = rootAugmentList;
  let stack;
  if (areThereAnyFlat(augmentList)) {
    stack = getLinkedList();
    stack.push({ operator, wrapper, augmentList });
  }
  return () => {
    while (keepGoing) {
      let mustKeepGoing;
      // eslint-disable-next-line no-cond-assign
      while (mustKeepGoing = keepGoing()) {
        wrapper.result = value();
        resolveState(augmentList, wrapper);
        if (wrapper.state === STOP) {
          mustKeepGoing = false;
          break;
        } else if (wrapper.state === FLAT) {
          const subIterable = getIterableParameters(wrapper.result);
          subIterable.wrapper = {};
          if (subIterable.augmentList.last) {
            subIterable.augmentList.last.next = wrapper.currentAi.next;
          } else {
            subIterable.augmentList.last = subIterable.augmentList.next = wrapper.currentAi.next;
          }
          stack.push(subIterable);
          break;
        }
        if (wrapper.state === YIELD) {
          return {
            done: false,
            value: wrapper.result,
          };
        }
      }
      keepGoing = undefined;
      if (stack) {
        if (!mustKeepGoing) {
          stack.pop();
        }
        const node = stack.peek(stack);
        if (node) {
          [keepGoing, value] = node.operator;
          wrapper = node.wrapper;
          augmentList = node.augmentList;
        }
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
