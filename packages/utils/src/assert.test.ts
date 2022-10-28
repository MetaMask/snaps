import { assertStruct } from './assert';
import { EventStruct } from './notification';

describe('assertStruct', () => {
  it('does not throw for a valid value', () => {
    expect(() =>
      assertStruct({ name: 'foo', data: 'bar' }, EventStruct),
    ).not.toThrow();
  });

  it('throws meaningful error messages for an invalid value', () => {
    expect(() => assertStruct({ data: 'foo' }, EventStruct)).toThrow(
      'Assertion failed: At path: name -- Expected a string, but received: undefined.',
    );

    expect(() => assertStruct({ name: 1, data: 'foo' }, EventStruct)).toThrow(
      'Assertion failed: At path: name -- Expected a string, but received: 1.',
    );
  });

  it('throws with a custom error prefix', () => {
    expect(() =>
      assertStruct({ data: 'foo' }, EventStruct, 'Invalid event'),
    ).toThrow(
      'Invalid event: At path: name -- Expected a string, but received: undefined.',
    );
  });

  it('throws with a custom error class', () => {
    class CustomError extends Error {
      constructor({ message }: { message: string }) {
        super(message);
        this.name = 'CustomError';
      }
    }

    expect(() =>
      assertStruct({ data: 'foo' }, EventStruct, 'Invalid event', CustomError),
    ).toThrow(
      new CustomError({
        message:
          'Invalid event: At path: name -- Expected a string, but received: undefined.',
      }),
    );
  });

  it('throws with a custom error function', () => {
    const CustomError = ({ message }: { message: string }) =>
      new Error(message);

    expect(() =>
      assertStruct({ data: 'foo' }, EventStruct, 'Invalid event', CustomError),
    ).toThrow(
      CustomError({
        message:
          'Invalid event: At path: name -- Expected a string, but received: undefined.',
      }),
    );
  });
});
