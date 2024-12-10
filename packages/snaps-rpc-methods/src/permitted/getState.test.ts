import { get } from './getState';

describe('get', () => {
  const object = {
    a: {
      b: {
        c: 'value',
      },
    },
  };

  it('returns the value of the key', () => {
    expect(get(object, 'a.b.c')).toBe('value');
  });

  it('returns the object if the key is empty', () => {
    expect(get(object, '')).toBe(object);
  });

  it('returns `null` if the object is `null`', () => {
    expect(get(null, '')).toBeNull();
  });

  it('returns `null` if the key does not exist', () => {
    expect(get(object, 'a.b.d')).toBeNull();
  });

  it('returns `null` if the parent key is not an object', () => {
    expect(get(object, 'a.b.c.d')).toBeNull();
  });

  it('throws an error if the key is a prototype pollution attempt', () => {
    expect(() => get(object, '__proto__.polluted')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });

  it('returns `null` if the key is a constructor pollution attempt', () => {
    expect(() => get(object, 'constructor.polluted')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });
});
