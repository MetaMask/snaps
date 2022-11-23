// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../../node_modules/ses/index.d.ts" />

// eslint-disable-next-line @typescript-eslint/no-require-imports,import/no-unassigned-import
require('ses');

// eslint-disable-next-line
import test from 'ava';

// eslint-disable-next-line
import timeout from './timeout';

test('has expected properties', (tRef) => {
  tRef.like(timeout, {
    names: ['setTimeout', 'clearTimeout'],
    // factory: expect.any(Function),
  });
});

test('should be able to create and clear a timeout', async (tRef) => {
  const { setTimeout: _setTimeout, clearTimeout: _clearTimeout } =
    timeout.factory();

  const result = await new Promise((resolve, reject) => {
    const handle = _setTimeout(reject, 100);
    _clearTimeout(handle);
    _setTimeout(resolve, 200);
  });

  tRef.is(result, undefined);
});

test('teardownFunction should clear timeouts', async (tRef) => {
  const { setTimeout: _setTimeout, teardownFunction } = timeout.factory();

  const result = await new Promise((resolve, reject) => {
    _setTimeout(reject, 100);
    teardownFunction();
    setTimeout(resolve, 200);
  });

  tRef.is(result, undefined);
});

test('should not be able to clear a timeout created with the global setTimeout', async (tRef) => {
  const { clearTimeout: _clearTimeout } = timeout.factory();

  const result = await new Promise((resolve) => {
    const handle = setTimeout(resolve, 100);
    _clearTimeout(handle as any);
  });

  tRef.is(result, undefined);
});

test('the attenuated setTimeout should throw if passed a non-function', (tRef) => {
  const { setTimeout: _setTimeout } = timeout.factory();

  [undefined, null, 'foo', {}, [], true].forEach((invalidInput) => {
    tRef.throws(() => _setTimeout(invalidInput as any), {
      message: `The timeout handler must be a function. Received: ${typeof invalidInput}`,
    });
  });
});
