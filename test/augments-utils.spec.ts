import { resolverAsync, resolver, isPromiseLike } from '../lib/augments-utils';
import { expect } from 'chai';

describe('augments-utils', () => {
  describe('resolverAsync()', () => {
    it('should resolve synchronously a sync value', () => {
      const result = resolverAsync(1, (x) => x * 2) as number;

      expect(result).to.be.eq(2);
    });

    it('should resolve synchronously a sync value', async () => {
      const result = resolverAsync(
        Promise.resolve(1),
        (x) => x * 2,
      ) as Promise<number>;

      expect(result).to.be.instanceOf(Promise);
      expect(await result).to.be.eq(2);
    });
  });

  describe('resolver()', () => {
    it('should resolve value', () => {
      const result = resolver(1, (x) => x * 2);

      expect(result).to.be.eq(2);
    });
  });

  describe('isPromiseLike()', () => {
    it('should return true for a PromiseLike value', () => {
      const result = isPromiseLike({
        then: () => undefined,
      });

      expect(result).to.be.true;
    });
    it('should return true for a PromiseLike value', () => {
      const result = isPromiseLike({
        notThen: () => undefined,
      });

      expect(result).to.be.false;
    });
  });
});
