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
  if (context.next !== augmentList.next) {
    processActionResult(
      chain,
      context,
    );
  }
  if (context.state === YIELD && context.next) {
    const item = context.next;
    context.type = item.type;
    chain = item.action(context.result);
  }
  return chain;
}

function resolveState(augmentList, wrapper) {
  function recursive(chain) {
    while (wrapper.next) {
      wrapper.next = wrapper.next.next;
      chain = stepResolveState(wrapper, chain, augmentList);
      if (isPromiseLike(chain)) {
        return chain.then(recursive);
      }
    }

    return wrapper;
  };
  return recursive();
}

function augmentativeIterateAsync() {
  const augmentList = this[augments] || {};
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
    next: getStateProcessorAsync(operator, itResolver, resolveState, augmentList),
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
  mapAsyncIterable,
  takeWhileAsyncIterable,
};
