/* eslint-disable no-magic-numbers */
export declare const augments: unique symbol;
export declare const baseIterable: unique symbol;
export declare type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;
/**
 * Represents a predicate on type `T`.<br>
 *   Example: `const evenNumber: Predicate<number> = n => (n % 2) === 0;`
 * @typeparam T The type the predicate is defined on.
 */
export declare interface Predicate<T> {
  /**
   * Evaluates an item of type `T`.
   * @param item The item evaluated.
   * @returns `true` if the predicate passed on `item`; otherwise `false`.
   */
  (item: T): any;
}
/**
 * Represents an asynchronous predicate on type `T`.<br>
 *   Example: `const userExists: AsyncPredicate<User> = async user => !!(await getUser(user.id))`
 * @typeparam T The type the predicate is defined on.
 */
interface AsyncPredicate<T> {
  /**
   * Asynchronously evaluates an item of type `T`.
   * @param item The item evaluated.
   * @returns A promise of `true` if the predicate passed on `item`; otherwise a promise of `false`.
   */
  (item: T): Promise<any> | any;
}

/**
 * Represents a mapping operation from type `T` to type `R`.<br>
 *   Example: ``const userToPrintable: Mapper<User, string> = user => `${user.name} (id: ${user.id})` ``
 * @typeparam T The source type.
 * @typeparam R The destination type.
 */
interface Mapper<T, R> {
  /**
   * Maps an item of type `T` into an instance of type `R`.
   * @param item The item to map.
   * @returns The map of `item`.
   */
  (item: T): R;
}
/**
 * Represents a asynchronous mapping operation from type `T` to type `R`.<br>
 *   Example: `const idToUser: AsyncMapper<number, User> = async id => await getUser(id)`<br>
 *   Note: in the example above, `getUser` function is already an [[AsyncMapper]].
 * @typeparam T The source type.
 * @typeparam R The destination type.
 */
interface AsyncMapper<T, R> {
  /**
   * Asynchronously maps an item of type `T` into an instance of type `R`.
   * @param item The item to map.
   * @returns A promise of the map of `item`.
   */
  (item: T): Promise<R> | R;
}

export declare function augmentativeForEach<T>(
  this: Iterable<T>,
  action: Predicate<T>,
): void;
export declare function augmentativeForEachAsync<T>(
  this: Iterable<T>,
  action: AsyncPredicate<T>,
): Promise<void>;
export declare function augmentativeToArray<T>(this: Iterable<T>): T[];
export declare function augmentativeToArrayAsync<T>(
  this: AsyncIterable<T>,
): T[];
export declare function filterIterable<T>(
  it: Iterable<T>,
  predicate: Predicate<T>,
): Iterable<T>;
export declare function filterAsyncIterable<T>(
  it: AnyIterable<T>,
  predicate: AsyncPredicate<T>,
): AsyncIterable<T>;
export declare function mapIterable<T, R>(
  it: Iterable<T>,
  mapper: Mapper<T, R>,
): Iterable<T>;
export declare function mapAsyncIterable<T, R>(
  it: AnyIterable<T>,
  mapper: AsyncMapper<T, R>,
): AsyncIterable<T>;
export declare function takeWhileIterable<T>(
  it: Iterable<T>,
  predicate: Predicate<T>,
): Iterable<T>;
export declare function takeWhileAsyncIterable<T>(
  it: AnyIterable<T>,
  predicate: AsyncPredicate<T>,
): AsyncIterable<T>;

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
