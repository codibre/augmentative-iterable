/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-magic-numbers */
const {
  getArrayOperator,
  getItOperator,
  getStateProcessorAsync,
  processActionResult,
  getAugmentIterable,
  resolverAsync,
  resolver,
  isPromiseLike,
} = require('./augments-utils');
const {
  augments,
  baseIterable,
  YIELD,
  IGNORE,
  STOP,
} = require('./augments-types');

function stepResolveState(
  context,
  chain,
  augmentList,
) {
  if (context.next > 0) {
    const actionResult = processActionResult(
      context.type,
      chain,
      context.state,
      context.result,
    );
    context.state = actionResult.state;
    context.result = actionResult.result;
  }
  if (context.next < augmentList.length) {
    const item = augmentList[context.next];
    context.type = item.type;
    chain = item.action(context.result);
  }
  return chain;
}

function getRecursive(
  context,
  augmentList,
) {
  return function recursive(chain) {
    while (context.next++ < augmentList.length) {
      chain = stepResolveState(context, chain, augmentList);
      if (isPromiseLike(chain)) {
        return chain.then(recursive);
      }
    }

    return {
      state: context.state,
      result: context.result,
    };
  };
}

async function resolveState(augmentList, result) {
  const context = {
    next: -1,
    type: YIELD,
    state: YIELD,
    result,
  };

  return getRecursive(context, augmentList)();
}

function runNext(
  next,
  action,
) {
  return next().then(({
    done,
    value,
  }) => {
    if (!done) {
      const p = action(value);
      return isPromiseLike(p) ?
        p.then(() => runNext(next, action)) :
        runNext(next, action);
    }
  });
}

function augmentativeIterateAsync() {
  const a = this[augments] || [];
  const base = this[baseIterable] || this;
  const [itResolver, it, kpResolver] = base[Symbol.asyncIterator] ? [resolverAsync, base[Symbol.asyncIterator](), resolverAsync] : [resolver, base[Symbol.iterator](), resolver];

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(it, itResolver);

  return {
    next: getStateProcessorAsync(operator, kpResolver, resolveState, a),
  };
}

function augmentativeForEachAsync(
  action,
) {
  const it = augmentativeIterateAsync.call(this);
  const next = it.next.bind(it);

  return runNext(next, action);
}

function augmentativeToArrayAsync() {
  const result = [];

  return augmentativeForEachAsync
    .call(this, result.push.bind(result))
    .then(() => result);
}

const filterAsyncIterable = getAugmentIterable(
  Symbol.asyncIterator,
  augmentativeIterateAsync,
  IGNORE,
);

const mapAsyncIterable = getAugmentIterable(
  Symbol.asyncIterator,
  augmentativeIterateAsync,
  YIELD,
);

const takeWhileAsyncIterable = getAugmentIterable(
  Symbol.asyncIterator,
  augmentativeIterateAsync,
  STOP,
);

module.exports = {
  augmentativeIterateAsync,
  augmentativeForEachAsync,
  augmentativeToArrayAsync,
  filterAsyncIterable,
  mapAsyncIterable,
  takeWhileAsyncIterable,
};
