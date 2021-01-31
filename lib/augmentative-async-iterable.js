'use strict';
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
  getImmutable,
  getMutable,
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
  if (context.state === YIELD && context.next < augmentList.length) {
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
  itReturn
) {
  return next().then(({
    done,
    value,
  }) => {
    if (!done) {
      return resolverAsync(action(value), () => runNext(next, action, itReturn));
    } else if (itReturn) {
      return itReturn();
    }
  });
}

function augmentativeIterateAsync() {
  const a = this[augments] || [];
  const base = this[baseIterable] || this;
  const [itResolver, it] = base[Symbol.asyncIterator] ? [resolverAsync, base[Symbol.asyncIterator]()] : [resolver, base[Symbol.iterator]()];

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(it, itResolver);

  return {
    next: getStateProcessorAsync(operator, itResolver, resolveState, a),
    return: it.return ? it.return.bind(it) : undefined,
    throw: it.throw ? it.throw.bind(it) : undefined,
  };
}

function augmentativeForEachAsync(
  action,
) {
  const it = augmentativeIterateAsync.call(this);
  const next = it.next.bind(it);

  return runNext(next, action, it.return);
}

function augmentativeToArrayAsync() {
  const result = [];

  return augmentativeForEachAsync
    .call(this, result.push.bind(result))
    .then(() => result);
}

const immutableAsync = getImmutable(Symbol.asyncIterator, augmentativeIterateAsync);
const mutableAsync = getMutable(Symbol.asyncIterator, augmentativeIterateAsync);

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

const addFilterAsync = getAugmentIterable(Symbol.iterator, augmentativeIterateAsync, IGNORE);
const addMapAsync = getAugmentIterable(Symbol.iterator, augmentativeIterateAsync, YIELD);
const addTakeWhileAsync = getAugmentIterable(Symbol.iterator, augmentativeIterateAsync, STOP);

module.exports = {
  addFilterAsync,
  addMapAsync,
  addTakeWhileAsync,
  augmentativeIterateAsync,
  augmentativeForEachAsync,
  augmentativeToArrayAsync,
  filterAsyncIterable,
  immutableAsync,
  mapAsyncIterable,
  mutableAsync,
  takeWhileAsyncIterable,
};
