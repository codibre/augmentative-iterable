'use strict';

const {
  getAugmentIterable,
  getSkippedAugmentIterable,
  resolverAsync,
  isPromiseLike,
  end,
  getIterableParameters,
} = require('./augments-utils');
const {
  YIELD,
  IGNORE,
  STOP,
} = require('./augments-types');

function resolveState(augmentList, value) {
  let next = augmentList;
  let state = YIELD;
  let type;
  function recursive(chain) {
    while (next) {
      next = next.next;
      if (next !== augmentList.next) {
        if (type === YIELD) value = chain;
        else if (!chain) {
          state = type;
          break;
        }
      }
      if (state === YIELD && next) {
        type = next.type;
        chain = next.action ? next.action(value) : value;
      }
      if (isPromiseLike(chain)) return chain.then(recursive);
    }

    switch (state) {
      case YIELD:
        return {
          done: false,
          value,
        };
      case STOP:
        return end;
    };
  };
  return recursive();
}

function asyncProcResolvingFactory(next) {
  return (result) => result.then((value) => value ? value : next());
}

function augmentativeIterateArrayAsync(augmentList, base, offset) {
  const length = base.length;
  let i = -1 + offset;
  const next = () => {
    while (++i < length) {
      const result = resolveState(augmentList, base[i]);
      if (result) return isPromiseLike(result) ? asyncProcResolving(result) : result;
    }

    return end;
  };
  const asyncProcResolving = asyncProcResolvingFactory(next);

  return {
    next,
  };
}

function augmentativeIterateAsyncIterable(augmentList, base, offset) {
  const it = base[Symbol.asyncIterator] ? base[Symbol.asyncIterator]() : base[Symbol.iterator]();
  const next = () => {
    let keepGoing = false;
    do {
      const item = it.next();
      if (isPromiseLike(item)) return item.then(asyncProcNext);
      keepGoing = !item.done;
      if (keepGoing) {
        if (offset > 0) offset--;
        else {
          const result = resolveState(augmentList, item.value);
          if (result) return isPromiseLike(result) ? asyncProcResolving(result) : result;
        }
      }
    } while (keepGoing);

    return end;
  };
  const asyncProcResolving = asyncProcResolvingFactory(next);

  const processNext = (item) => {
    if (item.done) return end;
    const result = resolveState(augmentList, item.value);
    if (result) return isPromiseLike(result) ? asyncProcResolving(result) : result;
    return next();
  };

  let asyncProcNext = offset > 0 ? (item) => {
    if (item.done) return end;
    offset--;
    if (offset <= 0) asyncProcNext = processNext;
    return next();
  } : processNext;

  return {
    next,
    error: it.error ? it.error.bind(it) : undefined,
    return: it.return ? it.return.bind(it) : undefined,
  };
}

function augmentativeIterateAsync(next) {
  const { augmentList, base, offset } = getIterableParameters(this, next, Symbol.asyncIterator, augmentativeIterateAsync);

  return Array.isArray(base) ? augmentativeIterateArrayAsync(augmentList, base, offset) : augmentativeIterateAsyncIterable(augmentList, base, offset);
}

function augmentativeForEachAsync(
  action,
) {
  const it = this[Symbol.asyncIterator] ? this[Symbol.asyncIterator]() : this[Symbol.iterator]();
  let keepGoing = true;
  const processNext = (item) => {
    keepGoing = !item.done;
    if (keepGoing) return action(item.value);
  };
  const ṕrocessNextPromise = (item) => resolverAsync(processNext(item), recursive);
  const recursive = async () => {
    while (keepGoing) {
      let item = it.next();
      if (isPromiseLike(item)) return item.then(ṕrocessNextPromise);
      item = processNext(item);
      if (isPromiseLike(item)) return item.then(recursive);
    }
  };

  return recursive();
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

const flatMapAsyncIterable = async function* flatMapAsyncIterable(iterable, mapper) {
  if (mapper) {
    for await (const item of iterable) {
      yield* mapper(item);
    }
  } else {
    for await (const item of iterable) {
      yield* item;
    }
  }
};

const skipAsyncIterable = getSkippedAugmentIterable(
  Symbol.asyncIterator,
  augmentativeIterateAsync,
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
  flatMapAsyncIterable,
  skipAsyncIterable,
};
