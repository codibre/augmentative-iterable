'use strict';

const {
  processActionResult,
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
  FLAT,
} = require('./augments-types');
const {
  getLinkedList,
} = require('./liked-list');
const { augmentativeIterate } = require('./augmentative-iterable');

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
    chain = item.action ? item.action(context.result) : context.result;
  }
  return chain;
}

function resolveState(augmentList, wrapper) {
  wrapper.next = augmentList;
  wrapper.state = YIELD;
  function recursive(chain) {
    while (wrapper.next) {
      wrapper.currentAi = wrapper.next;
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

function flat(sub, wrapper) {
  if (wrapper.result[Symbol.asyncIterator]) {
    sub.push(augmentativeIterateAsync.call(wrapper.result, wrapper.currentAi.next));
  } else {
    sub.push(augmentativeIterate.call(wrapper.result, wrapper.currentAi.next));
  }
}

function augmentativeIterateArrayAsync(augmentList, base, offset) {
  const length = base.length;
  const sub = getLinkedList();
  let i = -1 + offset;

  return {
    next: async () => {
      let keepGoing;
      do {
        keepGoing = false;
        while (sub.hasSomething()) {
          const result = await sub.last().value.next();
          if (result.done) {
            sub.pop();
          } else {
            return result;
          }
        }
        iterator:
        while (++i < length) {
          const wrapper = { result: base[i] };
          await resolveState(augmentList, wrapper);
          switch (wrapper.state) {
            case STOP:
              return end;
            case FLAT:
              flat(sub, wrapper);
              keepGoing = true;
              break iterator;
            case YIELD:
              return {
                done: false,
                value: wrapper.result,
              };
          };
        }
      } while (keepGoing);

      return end;
    },
  };
}

function augmentativeIterateAsyncIterable(augmentList, base, offset) {
  const sub = getLinkedList();
  const it = base[Symbol.asyncIterator] ? base[Symbol.asyncIterator]() : base[Symbol.iterator]();

  return {
    next: async () => {
      let keepGoing;
      do {
        keepGoing = false;
        if (offset > 0) {
          offset--;
          keepGoing = !(await it.next()).done;
        } else {
          while (sub.hasSomething()) {
            const result = await sub.last().value.next();
            if (result.done) {
              sub.pop();
            } else {
              return result;
            }
          }
          let next = await it.next();
          iterator:
          while (!next.done) {
            const wrapper = { result: next.value };
            await resolveState(augmentList, wrapper);
            switch (wrapper.state) {
              case STOP:
                return end;
              case FLAT:
                flat(sub, wrapper);
                keepGoing = true;
                break iterator;
              case YIELD:
                return {
                  done: false,
                  value: wrapper.result,
                };
            };
            next = await it.next();
          }
        }
      } while (keepGoing);

      return end;
    },
    error: it.error?.bind(it),
    return: it.return?.bind(it),
  };
}

function augmentativeIterateAsync(next) {
  const { augmentList, base, offset } = getIterableParameters(this, next, Symbol.asyncIterator, augmentativeIterateAsync);

  if (Array.isArray(base)) {
    return augmentativeIterateArrayAsync(augmentList, base, offset);
  }

  return augmentativeIterateAsyncIterable(augmentList, base, offset);
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

const flatMapAsyncIterable = getAugmentIterable(
  Symbol.asyncIterator,
  augmentativeIterateAsync,
  FLAT,
);

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
