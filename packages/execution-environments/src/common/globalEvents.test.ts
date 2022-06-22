import { addEventListener, removeEventListener } from './globalEvents';

describe('addEventListener', () => {
  it('uses addEventListener by default', () => {
    const spy = jest.spyOn(globalThis, 'addEventListener');
    const listener = () => undefined;
    addEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);
  });

  it('uses on in Node.js', () => {
    // Remove addEventListener
    Object.assign(globalThis, { ...globalThis, addEventListener: undefined });
    const spy = jest.spyOn(globalThis.process, 'on');
    const listener = () => undefined;
    addEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);
  });
});

describe('removeEventListener', () => {
  it('uses addEventListener by default', () => {
    const spy = jest.spyOn(globalThis, 'removeEventListener');
    const listener = () => undefined;
    removeEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);
  });

  it('uses on in Node.js', () => {
    const originalRemoveEventListener = globalThis.removeEventListener;
    // Remove removeEventListener
    Object.assign(globalThis, {
      ...globalThis,
      removeEventListener: undefined,
    });
    const spy = jest.spyOn(globalThis.process, 'removeListener');
    const listener = () => undefined;
    removeEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);

    // Restore
    Object.assign(globalThis, {
      ...globalThis,
      removeEventListener: originalRemoveEventListener,
    });
  });
});
