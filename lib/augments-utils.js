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

function getKeepGoing(
  it,
  wrapper,
  resolver,
) {
  return () => resolver(it.next(), (x) => !(wrapper.next = x).done);
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
  resolver,
) {
  return (x) => (x ? resolveState(a, value()).then(resolver) : promiseEnd);
}

exports.getArrayOperator = function getArrayOperator(base) {
  const length = base.length;
  let i = -1;
  return [() => ++i < length, () => base[i]];
};


exports.getItOperator = function getItOperator(
  it,
  resolver,
) {
  const wrapper = {};
  return [getKeepGoing(it, wrapper, resolver), getValue(wrapper)];
};

exports.getStateProcessor = function getStateProcessor(
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
};

exports.getStateProcessorAsync = function getStateProcessorAsync(
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
};

exports.processActionResult = function processActionResult(
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
};

exports.getAugmentIterable = function getAugmentIterable(
  iteratorType,
  augmentativeIterate,
) {
  return function (it, newAugment) {
    const preview = it;
    const previewAugments = preview[augments];

    return {
      [iteratorType]: augmentativeIterate,
      ...(previewAugments ? {
        [augments]: previewAugments.concat(newAugment),
        [baseIterable]: preview[baseIterable],
      } : {
        [augments]: [newAugment],
        [baseIterable]: it,
      }),
    };
  };
};

function isPromiseLike(p) {
  return p && typeof p.then === 'function';
}
exports.isPromiseLike = isPromiseLike;

exports.resolver = function resolver(value, callback) {
  return callback(value);
};

exports.resolverAsync = function resolverAsync(
  promise,
  callback,
) {
  return isPromiseLike(promise) ? promise.then(callback) : callback(promise);
};
