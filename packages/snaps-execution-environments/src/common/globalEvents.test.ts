import { addEventListener, removeEventListener } from './globalEvents';

const originalAddEventListener = globalThis.addEventListener;
const originalRemoveEventListener = globalThis.removeEventListener;
const originalProcess = globalThis.process;

globalThis.addEventListener = () => undefined;
globalThis.removeEventListener = () => undefined;

describe('addEventListener', () => {
  afterEach(() => {
    Object.assign(globalThis, {
      ...globalThis,
      addEventListener: originalAddEventListener,
      process: originalProcess,
    });
  });

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

  it('throws otherwise', () => {
    // Remove addEventListener
    Object.assign(globalThis, {
      ...globalThis,
      process: { ...globalThis.process, on: undefined },
      addEventListener: undefined,
    });
    const listener = () => undefined;
    expect(() => {
      addEventListener('foo', listener);
    }).toThrow('Platform agnostic addEventListener failed');
  });
});

describe('removeEventListener', () => {
  afterEach(() => {
    Object.assign(globalThis, {
      ...globalThis,
      removeEventListener: originalRemoveEventListener,
      process: originalProcess,
    });
  });

  it('uses addEventListener by default', () => {
    const spy = jest.spyOn(globalThis, 'removeEventListener');
    const listener = () => undefined;
    removeEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);
  });

  it('uses on in Node.js', () => {
    // Remove removeEventListener
    Object.assign(globalThis, {
      ...globalThis,
      removeEventListener: undefined,
    });
    const spy = jest.spyOn(globalThis.process, 'removeListener');
    const listener = () => undefined;
    removeEventListener('foo', listener);
    expect(spy).toHaveBeenCalledWith('foo', listener);
  });

  it('throws otherwise', () => {
    // Remove removeEventListener
    Object.assign(globalThis, {
      ...globalThis,
      process: { ...globalThis.process, removeListener: undefined },
      removeEventListener: undefined,
    });
    const listener = () => undefined;
    expect(() => {
      removeEventListener('foo', listener);
    }).toThrow('Platform agnostic removeEventListener failed');
  });
});
