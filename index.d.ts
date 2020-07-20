/* eslint-disable no-magic-numbers */
export declare const augments: unique symbol;
export declare const baseIterable: unique symbol;
export declare type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;
export declare const YIELD = 0;
export declare const IGNORE = 1;
export declare const STOP = 2;
export declare type AugmentType = 0 | 1 | 2;
export interface Augment<T> {
  type: AugmentType;
  action: (t: T) => any;
}

export interface IterableAugments<T, It extends AnyIterable<T>> {
  [baseIterable]: It;
  [augments]: Augment<T>[];
}
export interface AugmentativeIterable<T> extends Iterable<T>, IterableAugments<T, Iterable<T>> {
}
export interface AugmentativeAsyncIterable<T> extends AsyncIterable<T>, IterableAugments<T, AnyIterable<T>> {
}

export declare type Action<T> = (t: T) => any;

export declare function augmentativeForEach<T>(this: AugmentativeIterable<T>, action: Action<T>): void;
export declare function augmentativeForEachAsync<T>(this: AugmentativeIterable<T>, action: Action<T>): Promise<void>;
export declare function augmentativeToArray<T>(this: AugmentativeIterable<T>): T[];
export declare function augmentativeToArrayAsync<T>(this: AugmentativeAsyncIterable<T>): T[];
export declare function augmentIterable<T>(it: Iterable<T>, newAugment: Augment<T>): Iterable<any>;
export declare function augmentIterableAsync<T>(it: AnyIterable<T>, newAugment: Augment<T>): AnyIterable<any>;

/**
 * Pass the informed value to the callback and returns it's result
 * @typeparam T input type of the callback
 * @typeparam R the result type of the callback
 * @param value The value to be passed on
 * @param callback The callback
 */
export declare function resolver<T, R>(value: T, callback: (c: T) => R): R;

/**
 * Resolves a promise like value and pass the result to a callback and returns it's result
 * @typeparam T input type of the callback
 * @typeparam R the result type of the callback
 * @param promise The promise like value
 * @param callback The callback
 */
export declare function resolverAsync<T, R>(
  promise: PromiseLike<T>,
  callback: (c: T) => R,
): Promise<R>;
