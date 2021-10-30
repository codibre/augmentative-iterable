import {
  mapIterable,
  augmentativeToArray,
  filterIterable,
  takeWhileIterable,
  augmentativeForEach,
  addMap,
  addFilter,
  addTakeWhile,
  addMapAsync,
} from '../index';
import { expect } from 'chai';
import { stub } from 'sinon';
import 'chai-callslike';

function* generator<T>(source: Iterable<T>) {
  yield* source;
}

describe('Iterable', () => {
  it('should apply map', () => {
    const original = [1, 2, 3];

    const transformed = mapIterable(original, (x) => x * 7);

    expect(Array.from(transformed)).to.be.eql([7, 14, 21]);
  });

  it('should apply filter', () => {
    const original = [1, 2, 3, 4, 5, 6];

    const transformed = filterIterable(original, (x) => x % 2 === 0);

    expect(Array.from(transformed)).to.be.eql([2, 4, 6]);
  });

  it('should apply takeWhile', () => {
    const original = [1, 2, 3, 4, 5, 6];

    const transformed = takeWhileIterable(original, (x) => x < 4);

    expect(Array.from(transformed)).to.be.eql([1, 2, 3]);
  });

  it('should be augmented without modifying the original iterable', () => {
    const original = [1, 2, 3];

    const transformed = mapIterable(original, (x) => x * 3);

    const resultOriginal = Array.from(generator(original));
    const augmentedResultOriginal = augmentativeToArray.call(
      generator(original),
    );
    const resultTransformed = Array.from(generator(transformed));
    const augmentResultTransformed = augmentativeToArray.call(
      generator(transformed),
    );

    expect(resultOriginal).to.be.eql(augmentedResultOriginal);
    expect(resultTransformed).to.be.eql(augmentResultTransformed);
    expect(resultOriginal).to.be.eql([1, 2, 3]);
    expect(resultTransformed).to.be.eql([3, 6, 9]);
  });

  it('should accumulate augmentative arguments', () => {
    const original = [1, 2, 3];

    const map1 = mapIterable(original, (x) => x * 3);
    const map2 = mapIterable(map1, (x) => x + 2);
    const map3 = mapIterable(map2, (x) => x.toString());

    expect(Array.from(map3)).to.be.eql(['5', '8', '11']);
  });

  it('should accumulate different augmentative arguments', () => {
    const original = [1, 2, 3, 4, 5, 6];

    const map1 = mapIterable(original, (x) => x * 3);
    const map2 = filterIterable(map1, (x) => x % 2 === 0);
    const map3 = takeWhileIterable(map2, (x) => x < 15);

    expect(Array.from(map3)).to.be.eql([6, 12]);
  });

  it('should process an for each properly', () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapIterable(original, (x) => x * 3);
    for (const item of map1) {
      result.push(item + 2);
    }

    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should process an augmentative forEach properly', () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapIterable(original, (x) => x * 3);
    augmentativeForEach.call(map1, ((x: number) => result.push(x + 2)) as any);

    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should add an augmentative argument when iterable is already augmentative', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapIterable(original, (x) => x * 3);
    const map2 = addMap(map1, (x) => x + 2);

    await augmentativeForEach.call(map1, ((x: number) =>
      result.push(x + 2)) as any);

    expect(map1).to.be.eq(map2);
    expect(result).to.be.eql([7, 10, 13]);
  });

  it('should return an augmentative iterable with adding operation when informed iterable is not augmentative', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = addMap(original, (x) => x * 3);

    await augmentativeForEach.call(map1, ((x: number) =>
      result.push(x + 2)) as any);

    expect(map1).to.be.not.eq(original);
    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should stop to process augments when a stop is signalized', () => {
    const original = [1, 2, 3, 4, 3];
    const call = stub();

    const takeWhile = addTakeWhile(original, (x) => x < 4);
    const target = addFilter(takeWhile, (x) => {
      call();
      return 2 <= x && x <= 3;
    });

    const result = augmentativeToArray.call(target);

    expect(call.callCount).to.be.eq(3);
    expect(result).to.be.eql([2, 3]);
  });

  it('should respect filter and takeWhile through operations', () => {
    const callFilter = stub().callsFake((x) => x !== 2);
    const callTakeWhile = stub().callsFake((x) => x < 4);
    const callMap = stub().callsFake((x) => x);
    const original = [1, 2, 3, 4, 5];
    const filter = addFilter(original, callFilter);
    const takeWhile = addTakeWhile(filter, callTakeWhile);
    const map: any = addMapAsync(takeWhile, callMap);

    const result = augmentativeToArray.call(map);

    expect(result).to.be.eql([1, 3]);
    expect(callFilter).to.have.callsLike([1], [2], [3], [4]);
    expect(callTakeWhile).to.have.callsLike([1], [3], [4]);
    expect(callMap).to.have.callsLike([1], [3]);
  });
});
