import {
  mapAsyncIterable,
  augmentativeToArrayAsync,
  filterAsyncIterable,
  takeWhileAsyncIterable,
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
    const map2 = mapAsyncIterable(map1, (x) => x + 2);
    const map3 = mapAsyncIterable(map2, (x) => x.toString());

    expect(await augmentativeToArrayAsync.call(map3)).to.be.eql([
      '5',
      '8',
      '11',
    ]);
  });

  it('should accumulate different augmentative arguments', async () => {
    const original = [1, 2, 3, 4, 5, 6];

    const map1 = mapAsyncIterable(original, (x) => x * 3);
    const map2 = filterAsyncIterable(map1, (x) => x % 2 === 0);
    const map3 = takeWhileAsyncIterable(map2, (x) => x < 15);

    expect(await augmentativeToArrayAsync.call(map3)).to.be.eql([6, 12]);
  });
});
