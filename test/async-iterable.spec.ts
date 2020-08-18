import {
  mapAsyncIterable,
  augmentativeToArrayAsync,
  filterAsyncIterable,
  takeWhileAsyncIterable,
  augmentativeForEachAsync,
  addMapAsync,
} from '../index';
import { expect } from 'chai';
import { ObjectReadableMock } from 'stream-mock';

describe('AsyncIterable', () => {
  it('should apply map', async () => {
    const original = new ObjectReadableMock([1, 2, 3]);

    const transformed = mapAsyncIterable(original, (x) => x * 7);

    expect(await augmentativeToArrayAsync.call(transformed)).to.be.eql([
      7,
      14,
      21,
    ]);
  });

  it('should apply filter', async () => {
    const original = new ObjectReadableMock([1, 2, 3, 4, 5, 6]);

    const transformed = filterAsyncIterable(original, (x) => x % 2 === 0);

    expect(await augmentativeToArrayAsync.call(transformed)).to.be.eql([
      2,
      4,
      6,
    ]);
  });

  it('should apply takeWhile', async () => {
    const original = new ObjectReadableMock([1, 2, 3, 4, 5, 6]);

    const transformed = takeWhileAsyncIterable(original, (x) => x < 4);

    expect(await augmentativeToArrayAsync.call(transformed)).to.be.eql([
      1,
      2,
      3,
    ]);
  });

  it('should be augmented without modifying the original iterable', async () => {
    const original = [1, 2, 3];

    const transformed = mapAsyncIterable(original, (x) => x * 3);

    const resultOriginal = await augmentativeToArrayAsync.call(
      new ObjectReadableMock(original),
    );
    const resultTransformed = await augmentativeToArrayAsync.call(transformed);

    expect(resultOriginal).to.be.eql([1, 2, 3]);
    expect(resultTransformed).to.be.eql([3, 6, 9]);
  });

  it('should accumulate augmentative arguments', async () => {
    const original = [1, 2, 3];

    const map1 = mapAsyncIterable(original, (x) => x * 3);
    const map2 = mapAsyncIterable(map1, async (x) => x + 2);
    const map3 = mapAsyncIterable(map2, (x) => x.toString());

    expect(await augmentativeToArrayAsync.call(map3)).to.be.eql([
      '5',
      '8',
      '11',
    ]);
  });

  it('should accumulate different augmentative arguments', async () => {
    const original = [1, 2, 3, 4, 5, 6];

    const map1 = mapAsyncIterable(original, async (x) => x * 3);
    const map2 = filterAsyncIterable(map1, async (x) => x % 2 === 0);
    const map3 = takeWhileAsyncIterable(map2, async (x) => x < 15);

    expect(await augmentativeToArrayAsync.call(map3)).to.be.eql([6, 12]);
  });

  it('should process an for each properly', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapAsyncIterable(original, async (x) => x * 3);
    for await (const item of map1) {
      result.push(item + 2);
    }

    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should process an augmentative forEach properly', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapAsyncIterable(original, async (x) => x * 3);
    await augmentativeForEachAsync.call(map1, ((x: number) =>
      result.push(x + 2)) as any);

    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should process an augmentative forEach with an async predicate properly', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapAsyncIterable(original, async (x) => x * 3);
    await augmentativeForEachAsync.call(map1, (async (x: number) =>
      result.push(x + 2)) as any);

    expect(result).to.be.eql([5, 8, 11]);
  });

  it('should add an augmentative argument when iterable is already augmentative', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = mapAsyncIterable(original, async (x) => x * 3);
    const map2 = addMapAsync(map1, (x) => x + 2);

    await augmentativeForEachAsync.call(map1, (async (x: number) =>
      result.push(x + 2)) as any);

    expect(map1).to.be.eq(map2);
    expect(result).to.be.eql([7, 10, 13]);
  });

  it('should return an augmentative iterable with adding operation when informed iterable is not augmentative', async () => {
    const original = [1, 2, 3];
    const result: number[] = [];

    const map1 = addMapAsync(original, async (x) => x * 3);

    await augmentativeForEachAsync.call(map1, (async (x: number) =>
      result.push(x + 2)) as any);

    expect(map1).to.be.not.eq(original);
    expect(result).to.be.eql([5, 8, 11]);
  });
});
