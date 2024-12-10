import { set } from './setState';

describe('set', () => {
  it('sets the state in an empty object', () => {
    const object = {};

    expect(set(object, 'key', 'value')).toStrictEqual({
      key: 'value',
    });
  });

  it('sets the state if the current state is `null`', () => {
    const object = null;

    expect(set(object, 'key', 'value')).toStrictEqual({
      key: 'value',
    });
  });

  it('sets the state in an empty object with a nested key', () => {
    const object = {};

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('sets the state in an existing object', () => {
    const object = {
      key: 'oldValue',
    };

    expect(set(object, 'key', 'newValue')).toStrictEqual({
      key: 'newValue',
    });
  });

  it('sets the state in an existing object with a nested key', () => {
    const object = {
      nested: {
        key: 'oldValue',
      },
    };

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('sets the state in an existing object with a nested key that does not exist', () => {
    const object = {
      nested: {},
    };

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('overwrites the state in an existing object', () => {
    const object = {
      nested: {
        key: 'oldValue',
      },
    };

    expect(set(object, undefined, { foo: 'bar' })).toStrictEqual({
      foo: 'bar',
    });
  });

  it('overwrites the nested state in an existing object', () => {
    const object = {
      nested: {
        key: 'oldValue',
      },
    };

    expect(set(object, 'nested', { foo: 'bar' })).toStrictEqual({
      nested: {
        foo: 'bar',
      },
    });
  });

  it('throws an error if the key is a prototype pollution attempt', () => {
    expect(() => set({}, '__proto__.polluted', 'value')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });

  it('throws an error if the key is a constructor pollution attempt', () => {
    expect(() => set({}, 'constructor.polluted', 'value')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });
});
