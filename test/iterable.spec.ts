import {
  mapIterable,
  augmentativeToArray,
  filterIterable,
  takeWhileIterable,
} from '../index';
import { expect } from 'chai';

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
});
