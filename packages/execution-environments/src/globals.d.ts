/* eslint-disable import/unambiguous */
// Typescript doesn't type WeakRef on ES2020, only on ESNext
// But it's supported on all browsers and Node
// Note, it's stated that it's not supported on Opera,
// But that's not true - https://github.com/mdn/browser-compat-data/issues/12523
declare class WeakRef<T> {
  constructor(target: T);

  deref(): T | undefined;
}

// Typescript doesn't type FinalizationRegistry on ES2020, only on ESNext
declare class FinalizationRegistry<T> {
  constructor(callbackFn: (value: T) => void);

  register(obj: any, value: T, unregisterToken?: unknown): void;

  unregister(unregisterToken: unknown): void;
}
