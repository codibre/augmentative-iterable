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
    processActionResult(
      chain,
      context,
    );
  }
  if (context.state === YIELD && context.next < augmentList.length) {
    const item = augmentList[context.next];
    context.type = item.type;
    chain = item.action(context.result);
  }
  return chain;
}

function getRecursive(
  augmentList,
  context,
) {
  return function recursive(chain) {
    while (context.next++ < augmentList.length) {
      chain = stepResolveState(context, chain, augmentList);
      if (isPromiseLike(chain)) {
        return chain.then(recursive);
      }
    }

    return context;
  };
}

function resolveState(augmentList, wrapper) {
  return getRecursive(augmentList, wrapper)();
}

function augmentativeIterateAsync() {
  const a = this[augments] || [];
  const base = this[baseIterable] || this;
  let itResolver;
  let it;
  if (base[Symbol.asyncIterator]) {
    itResolver = resolverAsync;
    it = base[Symbol.asyncIterator]();
  } else {
    itResolver = resolver;
    it = base[Symbol.iterator]();
  }

  const operator = Array.isArray(base) ?
    getArrayOperator(base) :
    getItOperator(it, itResolver);

  return {
    next: getStateProcessorAsync(operator, itResolver, resolveState, a),
    return: it.return ? it.return.bind(it) : undefined,
    throw: it.throw ? it.throw.bind(it) : undefined,
  };
}

async function augmentativeForEachAsync(
  action,
) {
  if (this[Symbol.asyncIterator]) {
    for await (const item of this) {
      let actResult = action(item);
      if (isPromiseLike(actResult)) {
        actResult = await actResult;
      }
    }
  } else {
    for (const item of this) {
      let actResult = action(item);
      if (isPromiseLike(actResult)) {
        actResult = await actResult;
      }
    }
  }
}

function augmentativeToArrayAsync() {
  const result = [];

  const callResult = augmentativeForEachAsync
    .call(this, result.push.bind(result));
  return resolverAsync(callResult, () => result);
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

const addFilterAsync = getAugmentIterable(Symbol.asyncIterator, augmentativeIterateAsync, IGNORE);
const addMapAsync = getAugmentIterable(Symbol.asyncIterator, augmentativeIterateAsync, YIELD);
const addTakeWhileAsync = getAugmentIterable(Symbol.asyncIterator, augmentativeIterateAsync, STOP);

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
