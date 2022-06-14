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

function stepResolveState(
  wrapper,
  actionResult,
  augmentList,
) {
  if (wrapper.next !== augmentList.next) {
    const { type } = wrapper;
    if (type === YIELD) wrapper.result = actionResult;
    else if (!actionResult) wrapper.state = type;
  }
  if (wrapper.state === YIELD && wrapper.next) {
    const item = wrapper.next;
    wrapper.type = item.type;
    actionResult = item.action ? item.action(wrapper.result) : wrapper.result;
  }
  return actionResult;
}

function resolveState(augmentList, wrapper) {
  wrapper.next = augmentList;
  wrapper.state = YIELD;
  function recursive(chain) {
    while (wrapper.next) {
      wrapper.currentAi = wrapper.next;
      wrapper.next = wrapper.next.next;
      chain = stepResolveState(wrapper, chain, augmentList);
      if (isPromiseLike(chain)) return chain.then(recursive);
    }

    return wrapper;
  };
  return recursive();
}

async function asyncProcResolving(wrapper, resolving, asyncNext) {
  if (isPromiseLike(resolving)) await resolving;
  switch (wrapper.state) {
    case YIELD:
      return {
        done: false,
        value: wrapper.result,
      };
    case STOP:
      return end;
    default:
      return asyncNext();
  };
}

function augmentativeIterateArrayAsync(augmentList, base, offset) {
  const length = base.length;
  let i = -1 + offset;

  async function asyncNext() {
    let keepGoing;
    do {
      keepGoing = false;
      while (++i < length) {
        const wrapper = { result: base[i] };
        const resolving = resolveState(augmentList, wrapper);
        if (isPromiseLike(resolving)) await resolving;
        switch (wrapper.state) {
          case YIELD:
            return {
              done: false,
              value: wrapper.result,
            };
          case STOP:
            return end;
        };
      }
    } while (keepGoing);

    return end;
  };

  function syncNext() {
    let keepGoing;
    do {
      keepGoing = false;
      while (++i < length) {
        const wrapper = { result: base[i] };
        const resolving = resolveState(augmentList, wrapper);
        if (isPromiseLike(resolving)) return asyncProcResolving(wrapper, resolving, asyncNext);
        switch (wrapper.state) {
          case YIELD:
            return {
              done: false,
              value: wrapper.result,
            };
          case STOP:
            return end;
        };
      }
    } while (keepGoing);

    return end;
  };

  return {
    next: syncNext,
  };
}

function augmentativeIterateAsyncIterable(augmentList, base, offset) {
  const it = base[Symbol.asyncIterator] ? base[Symbol.asyncIterator]() : base[Symbol.iterator]();

  async function asyncNext() {
    let keepGoing;
    do {
      keepGoing = false;
      do {
        let next = it.next();
        if (isPromiseLike(next)) next = await next;
        keepGoing = !next.done;
        if (offset > 0) offset--;
        else if (keepGoing) {
          const wrapper = { result: next.value };
          const resolving = resolveState(augmentList, wrapper);
          if (isPromiseLike(resolving)) await resolving;
          switch (wrapper.state) {
            case YIELD:
              return {
                done: false,
                value: wrapper.result,
              };
            case STOP:
              return end;
          };
        }
      } while (keepGoing);
    } while (keepGoing);

    return end;
  }

  async function asyncProcNext(next) {
    next = await next;
    if (offset > 0) {
      offset--;
      return asyncNext();
    } else if (next.done) return end;

    const wrapper = { result: next.value };
    const resolving = resolveState(augmentList, wrapper);
    return asyncProcResolving(wrapper, resolving, asyncNext);
  }

  function syncNext() {
    let keepGoing;
    do {
      keepGoing = false;
      do {
        const next = it.next();
        if (isPromiseLike(next)) return asyncProcNext(next);
        keepGoing = !next.done;
        if (offset > 0) offset--;
        else if (keepGoing) {
          const wrapper = { result: next.value };
          const resolving = resolveState(augmentList, wrapper);
          if (isPromiseLike(resolving)) return asyncProcResolving(wrapper, resolving, asyncNext);
          switch (wrapper.state) {
            case YIELD:
              return {
                done: false,
                value: wrapper.result,
              };
            case STOP:
              return end;
          };
        }
      } while (keepGoing);
    } while (keepGoing);

    return end;
  };

  return {
    next: syncNext,
    error: it.error ? it.error.bind(it) : undefined,
    return: it.return ? it.return.bind(it) : undefined,
  };
}

function augmentativeIterateAsync(next) {
  const { augmentList, base, offset } = getIterableParameters(this, next, Symbol.asyncIterator, augmentativeIterateAsync);

  return Array.isArray(base) ? augmentativeIterateArrayAsync(augmentList, base, offset) : augmentativeIterateAsyncIterable(augmentList, base, offset);
}

async function augmentativeForEachAsync(
  action,
) {
  const it = this[Symbol.asyncIterator] ? this[Symbol.asyncIterator]() : this[Symbol.iterator]();
  let keepGoing;
  do {
    let next = it.next();
    if (isPromiseLike(next)) next = await next;
    keepGoing = !next.done;
    if (keepGoing) {
      const resolving = action(next.value);
      if (isPromiseLike(resolving)) await resolving;
    }
  } while (keepGoing);
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
